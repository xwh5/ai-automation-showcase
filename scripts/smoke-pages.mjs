#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const publicRoot = resolve(import.meta.dirname, '..', 'public');
const clsThreshold = 0.1;
const pages = [
  { name: 'home', path: '/' },
  { name: 'legacy-bridge', path: '/demos/legacy-bridge/web/?preview=1' },
  { name: 'price-console', path: '/demos/price-console/' },
  { name: 'ai-support', path: '/demos/ai-support/' },
  { name: 'business-site', path: '/demos/business-site/' },
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function createStaticServer() {
  return createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    } catch {
      response.writeHead(400);
      response.end('Bad request');
      return;
    }
    if (pathname.includes('\0')) {
      response.writeHead(400);
      response.end('Bad request');
      return;
    }

    let target = resolve(publicRoot, `.${pathname}`);
    if (target !== publicRoot && !target.startsWith(`${publicRoot}${sep}`)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    try {
      let stats = statSync(target);
      if (stats.isDirectory()) {
        target = join(target, 'index.html');
        stats = statSync(target);
      }
      if (!stats.isFile()) throw new Error('Not a file');

      response.writeHead(200, {
        'Content-Type': mimeTypes[extname(target).toLowerCase()] ?? 'application/octet-stream',
        'Content-Length': stats.size,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      if (request.method === 'HEAD') {
        response.end();
        return;
      }
      const stream = createReadStream(target);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });
}

async function startServer() {
  const server = createStaticServer();
  await new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolvePromise);
  });
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function closeServer(server) {
  if (!server?.listening) return;
  server.closeAllConnections();
  await new Promise((resolvePromise) => server.close(resolvePromise));
}

async function runScenario(browser, baseUrl, pageDefinition, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.name === 'mobile',
    hasTouch: viewport.name === 'mobile',
  });
  await context.addInitScript(() => {
    globalThis.__smokeCls = 0;
    globalThis.__smokeRecordShifts = (entries) => {
      for (const entry of entries) {
        if (!entry.hadRecentInput) globalThis.__smokeCls += entry.value;
      }
    };
    try {
      globalThis.__smokeShiftObserver = new PerformanceObserver((list) => {
        globalThis.__smokeRecordShifts(list.getEntries());
      });
      globalThis.__smokeShiftObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      globalThis.__smokeShiftObserver = null;
    }
  });

  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'request failed' });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push({ url: response.url(), status: response.status() });
    }
  });

  const record = {
    name: `${pageDefinition.name}-${viewport.name}`,
    path: pageDefinition.path,
    viewport: { width: viewport.width, height: viewport.height },
    consoleErrors,
    pageErrors,
    failedRequests,
    checks: {},
  };

  try {
    const response = await page.goto(`${baseUrl}${pageDefinition.path}`, {
      waitUntil: 'load',
      timeout: 30_000,
    });
    record.httpStatus = response?.status() ?? null;
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
    await page.waitForTimeout(750);

    const metrics = await page.evaluate(() => {
      globalThis.__smokeRecordShifts(globalThis.__smokeShiftObserver?.takeRecords() ?? []);
      const viewportWidth = window.innerWidth;
      const documentWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      );
      return {
        readyState: document.readyState,
        title: document.title.trim(),
        bodyChildCount: document.body?.children.length ?? 0,
        viewportWidth,
        documentWidth,
        overflowPx: Math.max(0, documentWidth - viewportWidth),
        cls: globalThis.__smokeCls,
      };
    });
    record.metrics = metrics;
    record.checks = {
      httpOk: record.httpStatus === 200,
      pageLoaded: metrics.readyState === 'complete'
        && metrics.title.length > 0
        && metrics.bodyChildCount > 0,
      noConsoleErrors: consoleErrors.length === 0,
      noPageErrors: pageErrors.length === 0,
      noFailedRequests: failedRequests.length === 0,
      noHorizontalOverflow: metrics.documentWidth <= metrics.viewportWidth + 1,
      clsBelowThreshold: Number.isFinite(metrics.cls) && metrics.cls < clsThreshold,
    };
    record.passed = Object.values(record.checks).every(Boolean);
  } catch (error) {
    record.error = error.stack ?? String(error);
    record.passed = false;
  } finally {
    await context.close();
  }
  return record;
}

async function main() {
  const summary = {
    generatedAt: new Date().toISOString(),
    publicDirectory: 'public/',
    pages: pages.map((page) => page.path),
    viewports,
    clsThreshold,
    scenarios: [],
  };
  let server;
  let browser;

  try {
    if (!existsSync(join(publicRoot, 'index.html'))) {
      throw new Error('public/index.html is missing; run npm run build:pages first');
    }
    const started = await startServer();
    server = started.server;
    summary.baseUrl = started.baseUrl;

    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
    summary.browser = browser.version();

    for (const pageDefinition of pages) {
      for (const viewport of viewports) {
        summary.scenarios.push(await runScenario(browser, started.baseUrl, pageDefinition, viewport));
      }
    }
  } catch (error) {
    summary.error = error.stack ?? String(error);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        summary.cleanupError = error.stack ?? String(error);
      }
    }
    try {
      await closeServer(server);
    } catch (error) {
      summary.cleanupError = error.stack ?? String(error);
    }
  }

  summary.total = summary.scenarios.length;
  summary.passed = summary.scenarios.filter((scenario) => scenario.passed).length;
  summary.failed = summary.total - summary.passed + (summary.error ? 1 : 0);
  summary.ok = !summary.error && !summary.cleanupError && summary.total === 10 && summary.failed === 0;
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  process.exitCode = summary.ok ? 0 : 1;
}

await main();
