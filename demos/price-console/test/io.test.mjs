import test from "node:test";
import assert from "node:assert/strict";
import { PriceConsole as C } from "../src/core.mjs";

function report() {
  return C.analyzeFixture(C.createFixture());
}

test("fixture JSON round-trips through strict import validation", () => {
  const fixture = C.createFixture();
  const parsed = C.parseFixture(JSON.stringify(fixture));
  assert.equal(parsed.products.length, 30);
  assert.equal(parsed.sources.length, 3);
  assert.equal(parsed.observations.length, 90);
  assert.equal(parsed.history.length, 540);
  assert.equal(parsed.blindCases.length, 20);
  assert.equal(parsed.meta.synthetic, true);
});

test("JSON export includes provenance, conflicts, unmatched rows and all blind results", () => {
  const exported = C.exportJSON(report(), { exportedAt: "2026-11-24T08:00:00.000Z" });
  const parsed = JSON.parse(exported);
  assert.equal(parsed.exportedAt, "2026-11-24T08:00:00.000Z");
  assert.equal(parsed.synthetic, true);
  assert.equal(parsed.summary.skuCount, 30);
  assert.equal(parsed.clusters.length, 30);
  assert.equal(parsed.unmatched.length, 2);
  assert.equal(parsed.blindTest.rows.length, 20);
  assert.equal(parsed.blindTest.counts.falsePositives, 1);
  assert.equal(parsed.blindTest.counts.falseNegatives, 2);
  assert.ok(parsed.disclaimer.en.includes("No platform was scraped"));
});

test("CSV export contains one row per offer, including unmatched offers", () => {
  const csv = C.exportCSV(report());
  const lines = csv.trim().split(/\r\n/);
  assert.equal(lines.length, 91);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.equal((csv.match(/"matched_offer",/g) ?? []).length, 88);
  assert.equal((csv.match(/"unmatched_offer",/g) ?? []).length, 2);
  assert.ok(csv.includes('"O-P007-beta"'));
  assert.ok(csv.includes('"O-P023-alpha"'));
});

test("CSV neutralizes spreadsheet formula prefixes in imported text", () => {
  const analysis = report();
  analysis.clusters[0].offers[0].title = '=HYPERLINK("https://example.com","x")';
  const csv = C.exportCSV(analysis);
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(!csv.includes(',"=HYPERLINK'));
});

test("import rejects non-synthetic source URLs", () => {
  const fixture = C.createFixture();
  fixture.sources[0].url = "https://real-shop.invalid/prices";
  assert.throws(() => C.parseFixture(JSON.stringify(fixture)), /must use an https:\/\/example.com/);
});

test("import rejects fixtures that declare themselves non-synthetic", () => {
  const fixture = C.createFixture();
  fixture.meta.synthetic = false;
  assert.throws(() => C.parseFixture(JSON.stringify(fixture)), /Only synthetic fixtures/);
});

test("import rejects malformed JSON, duplicate ids and unknown references", () => {
  assert.throws(() => C.parseFixture("{"), /not valid JSON/);
  const duplicate = C.createFixture();
  duplicate.products[1].id = duplicate.products[0].id;
  assert.throws(() => C.parseFixture(JSON.stringify(duplicate)), /Duplicate product id/);
  const unknownSource = C.createFixture();
  unknownSource.observations[0].sourceId = "missing";
  assert.throws(() => C.parseFixture(JSON.stringify(unknownSource)), /unknown source/);
  const unknownExpected = C.createFixture();
  unknownExpected.blindCases[0].expectedProductId = "P999";
  assert.throws(() => C.parseFixture(JSON.stringify(unknownExpected)), /unknown expected product/);
});

test("import validates price, confidence and timestamps", () => {
  const badPrice = C.createFixture();
  badPrice.observations[0].price.amount = -1;
  assert.throws(() => C.parseFixture(JSON.stringify(badPrice)), /non-negative price.amount/);
  const badConfidence = C.createFixture();
  badConfidence.observations[0].confidence = 2;
  assert.throws(() => C.parseFixture(JSON.stringify(badConfidence)), /confidence must be between 0 and 1/);
  const badDate = C.createFixture();
  badDate.observations[0].observedAt = "not-a-date";
  assert.throws(() => C.parseFixture(JSON.stringify(badDate)), /invalid observedAt/);
});
