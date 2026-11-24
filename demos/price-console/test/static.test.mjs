import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { buildBundle } from "../scripts/build.mjs";

test("classic browser bundle is current and executable without module loading", async () => {
  const expected = await buildBundle();
  const actual = await readFile(new URL("../dist/core.js", import.meta.url), "utf8");
  assert.equal(actual, expected, "Run node scripts/build.mjs after changing src/*.mjs");
  const context = vm.createContext({ structuredClone });
  vm.runInContext(actual, context);
  const core = context.PriceConsoleCore;
  assert.equal(core.PRODUCTS.length, 30);
  assert.equal(core.analyzeFixture(core.createFixture()).blind.counts.truePositives, 13);
});

test("page references only local scripts and contains no network API calls", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
  const scripts = [...html.matchAll(/<script\s+[^>]*src="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(scripts, ["./dist/core.js", "./app.js"]);
  assert.ok(!/<script[^>]+src="https?:/i.test(html));
  assert.ok(!/<link[^>]+href="https?:/i.test(html));
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|navigator\.sendBeacon/.test(app));
});

test("every static DOM id used by app.js exists in index.html", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const referenced = new Set([...app.matchAll(/byId\("([^"]+)"\)/g)].map((match) => match[1]));
  for (const id of referenced) assert.ok(ids.has(id), `Missing DOM id: ${id}`);
});
