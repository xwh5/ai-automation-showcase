import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'public');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const copies = [
  ['index.html', 'index.html'],
  ['assets', 'assets'],
  ['robots.txt', 'robots.txt'],
  ['sitemap.xml', 'sitemap.xml'],
  ['LICENSE', 'LICENSE'],
  ['demos/price-console/index.html', 'demos/price-console/index.html'],
  ['demos/price-console/styles.css', 'demos/price-console/styles.css'],
  ['demos/price-console/app.js', 'demos/price-console/app.js'],
  ['demos/price-console/dist', 'demos/price-console/dist'],
  ['demos/ai-support/index.html', 'demos/ai-support/index.html'],
  ['demos/ai-support/src', 'demos/ai-support/src'],
  ['demos/legacy-bridge/web', 'demos/legacy-bridge/web'],
  ['demos/legacy-bridge/fixtures', 'demos/legacy-bridge/fixtures'],
  ['demos/business-site', 'demos/business-site'],
];

for (const [from, to] of copies) {
  const src = resolve(root, from);
  const dst = resolve(out, to);
  mkdirSync(resolve(dst, '..'), { recursive: true });
  cpSync(src, dst, { recursive: true });
}

console.log(`Built static showcase into ${out}`);
