#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'bin',
  'obj',
  'public',
  '.agents',
  '.playwright-cli',
]);
const documentCache = new Map();
const problems = [];
const files = [];

function displayPath(path) {
  return relative(root, path).split(sep).join('/');
}

function lineAt(text, offset) {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (text[index] === '\n') line += 1;
  }
  return line;
}

function addProblem(path, line, message) {
  problems.push(`${displayPath(path)}:${line}: ${message}`);
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
    } else if (entry.isFile() && ['.md', '.html'].includes(extname(entry.name).toLowerCase())) {
      files.push(path);
    }
  }
}

function readDocument(path) {
  if (!documentCache.has(path)) {
    try {
      documentCache.set(path, { text: readFileSync(path, 'utf8') });
    } catch (error) {
      const record = { error };
      documentCache.set(path, record);
      addProblem(path, 1, `cannot read document: ${error.message}`);
    }
  }
  return documentCache.get(path);
}

function maskText(text) {
  return text.replace(/[^\r\n]/g, ' ');
}

function maskMarkdownCode(text) {
  const lines = text.split(/(?<=\n)/);
  let fence = null;
  return lines.map((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence.character && marker[1].length >= fence.length) {
        fence = null;
      }
      return maskText(line);
    }
    if (marker) {
      fence = { character: marker[1][0], length: marker[1].length };
      return maskText(line);
    }
    return line.replace(/(`+)(.*?)\1/g, (match) => maskText(match));
  }).join('');
}

function decodeHtmlEntities(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (match, entity) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity.toLowerCase()];
  });
}

function parseDestination(content, contentOffset) {
  let start = 0;
  while (start < content.length && /\s/.test(content[start])) start += 1;
  if (content[start] === '<') {
    const end = content.indexOf('>', start + 1);
    if (end !== -1) return { url: content.slice(start + 1, end), offset: contentOffset + start + 1 };
  }

  let depth = 0;
  let escaped = false;
  let end = start;
  for (let index = start; index < content.length; index += 1) {
    const character = content[index];
    if (escaped) {
      escaped = false;
      end = index + 1;
      continue;
    }
    if (character === '\\') {
      escaped = true;
      end = index + 1;
      continue;
    }
    if (/\s/.test(character) && depth === 0) break;
    if (character === '(') depth += 1;
    if (character === ')' && depth > 0) depth -= 1;
    end = index + 1;
  }
  return { url: content.slice(start, end), offset: contentOffset + start };
}

function extractMarkdownLinks(text) {
  const masked = maskMarkdownCode(text).replace(/<!--[\s\S]*?-->/g, (match) => maskText(match));
  const links = [];
  const inlinePattern = /!?\[[^\]]*\]\(\s*/g;
  for (let match = inlinePattern.exec(masked); match; match = inlinePattern.exec(masked)) {
    const openParen = match.index + match[0].lastIndexOf('(');
    let depth = 1;
    let escaped = false;
    let end = openParen + 1;
    for (; end < masked.length && depth > 0; end += 1) {
      const character = masked[end];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === '\\') {
        escaped = true;
        continue;
      }
      if (character === '(') depth += 1;
      if (character === ')') depth -= 1;
    }
    if (depth !== 0) continue;
    const destination = parseDestination(masked.slice(openParen + 1, end - 1), openParen + 1);
    if (destination.url) links.push(destination);
  }

  const definitionPattern = /^ {0,3}\[[^\]]+\]:[ \t]*(?:<([^>\n]+)>|(\S+))/gm;
  for (let match = definitionPattern.exec(masked); match; match = definitionPattern.exec(masked)) {
    const url = match[1] ?? match[2];
    const offset = match.index + match[0].indexOf(url);
    links.push({ url, offset });
  }
  return links;
}

function extractHtmlLinks(text) {
  const masked = text
    .replace(/<!--[\s\S]*?-->/g, (match) => maskText(match))
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, (match) => maskText(match));
  const links = [];
  const attributePattern = /\b(?:href|src|poster|action|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
  for (let match = attributePattern.exec(masked); match; match = attributePattern.exec(masked)) {
    const url = match[1] ?? match[2] ?? match[3];
    const offset = match.index + match[0].lastIndexOf(url);
    links.push({ url, offset });
  }
  return links;
}

function checkFormatting(path, text) {
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) addProblem(path, index + 1, 'trailing whitespace');
  });

  const contentLines = text.endsWith('\n') ? lines.slice(0, -1) : lines;
  let lastContentLine = contentLines.length - 1;
  while (lastContentLine >= 0 && contentLines[lastContentLine].trim() === '') lastContentLine -= 1;
  const extraBlankLines = contentLines.length - 1 - lastContentLine;
  if (extraBlankLines > 0) {
    addProblem(path, lastContentLine + 2, `EOF has ${extraBlankLines} extra blank line(s)`);
  }
}

function checkFirstLineSummary(path, text) {
  const firstLine = text.split(/\r?\n/, 1)[0].replace(/^\uFEFF/, '').trim();
  const summary = firstLine.replace(/^#{1,6}[ \t]*/, '').trim();
  if (!summary || /^(?:```|~~~|<!--|\||!\[|\[[^\]]*\]\([^)]*\)$)/.test(summary)) {
    addProblem(path, 1, 'Markdown must start with a non-empty summary line');
  }
}

function markdownSlug(heading) {
  return heading
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
}

function collectAnchors(path) {
  const record = readDocument(path);
  if (!record?.text) return new Set();
  const anchors = new Set();
  const extension = extname(path).toLowerCase();

  if (extension === '.html') {
    const attributePattern = /\b(?:id|name)\s*=\s*(["'])(.*?)\1/gi;
    for (let match = attributePattern.exec(record.text); match; match = attributePattern.exec(record.text)) {
      anchors.add(decodeHtmlEntities(match[2]));
    }
    return anchors;
  }
  if (extension !== '.md') return anchors;

  const masked = maskMarkdownCode(record.text);
  const explicitPattern = /\b(?:id|name)\s*=\s*(["'])(.*?)\1/gi;
  for (let match = explicitPattern.exec(masked); match; match = explicitPattern.exec(masked)) {
    anchors.add(decodeHtmlEntities(match[2]));
  }

  const duplicates = new Map();
  const headingPattern = /^ {0,3}#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/gm;
  for (let match = headingPattern.exec(masked); match; match = headingPattern.exec(masked)) {
    const heading = match[1].replace(/[ \t]+#+[ \t]*$/, '');
    const base = markdownSlug(heading);
    const count = duplicates.get(base) ?? 0;
    duplicates.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  return anchors;
}

function isIgnoredPath(path) {
  const fromRoot = relative(root, path);
  return fromRoot.split(sep).some((part) => ignoredDirectories.has(part));
}

function validateLocalLink(sourcePath, rawUrl, line) {
  const url = decodeHtmlEntities(rawUrl.trim());
  if (!url || url.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(url)) return;

  const hashIndex = url.indexOf('#');
  const pathAndQuery = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const queryIndex = pathAndQuery.indexOf('?');
  const encodedPath = queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(encodedPath);
  } catch {
    addProblem(sourcePath, line, `local link has invalid percent encoding: ${rawUrl}`);
    return;
  }

  let targetPath = sourcePath;
  if (decodedPath) {
    targetPath = decodedPath.startsWith('/')
      ? resolve(root, `.${decodedPath}`)
      : resolve(dirname(sourcePath), decodedPath);
  }

  const fromRoot = relative(root, targetPath);
  if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    addProblem(sourcePath, line, `local link escapes the repository: ${rawUrl}`);
    return;
  }
  if (isIgnoredPath(targetPath)) return;

  let targetStat;
  try {
    targetStat = statSync(targetPath);
  } catch {
    addProblem(sourcePath, line, `local link target not found: ${rawUrl}`);
    return;
  }

  if (hashIndex === -1 || !targetStat.isFile()) return;
  let fragment;
  try {
    fragment = decodeURIComponent(url.slice(hashIndex + 1));
  } catch {
    addProblem(sourcePath, line, `local link has an invalid fragment: ${rawUrl}`);
    return;
  }
  if (fragment && !collectAnchors(targetPath).has(fragment)) {
    addProblem(sourcePath, line, `local link fragment not found: ${rawUrl}`);
  }
}

try {
  walk(root);
} catch (error) {
  addProblem(root, 1, `cannot scan repository: ${error.message}`);
}

if (files.length === 0) addProblem(root, 1, 'no Markdown or HTML files found');

for (const path of files) {
  const record = readDocument(path);
  if (!record || typeof record.text !== 'string') continue;
  checkFormatting(path, record.text);
  if (extname(path).toLowerCase() === '.md') checkFirstLineSummary(path, record.text);
  const links = extname(path).toLowerCase() === '.md'
    ? [...extractMarkdownLinks(record.text), ...extractHtmlLinks(record.text)]
    : extractHtmlLinks(record.text);
  const seen = new Set();
  for (const link of links) {
    const key = `${link.offset}:${link.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    validateLocalLink(path, link.url, lineAt(record.text, link.offset));
  }
}

if (problems.length > 0) {
  console.error(`[FAIL] documentation checks: ${problems.length} issue(s)`);
  for (const problem of problems) console.error(` - ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`[OK] documentation checks passed (${files.length} Markdown/HTML files)`);
}
