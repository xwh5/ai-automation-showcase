import test from "node:test";
import assert from "node:assert/strict";
import { PriceConsole as C } from "../src/core.mjs";

function fixtureReport() {
  const fixture = C.createFixture();
  return { fixture, report: C.analyzeFixture(fixture) };
}

test("fixture contains exactly 30 synthetic SKUs, 3 synthetic sources and 90 offers", () => {
  const fixture = C.createFixture();
  assert.equal(fixture.products.length, 30);
  assert.equal(fixture.sources.length, 3);
  assert.equal(fixture.observations.length, 90);
  assert.equal(fixture.history.length, 540);
  assert.equal(fixture.blindCases.length, 20);
  assert.equal(new Set(fixture.products.map((product) => product.id)).size, 30);
  assert.equal(new Set(fixture.observations.map((offer) => offer.id)).size, 90);
  assert.ok(fixture.products.every((product) => product.synthetic === true));
  assert.ok(fixture.meta.synthetic === true);
});

test("all fixture URLs use reserved example domains and are never treated as fetched evidence", () => {
  const fixture = C.createFixture();
  const urls = [...fixture.sources.map((source) => source.url), ...fixture.observations.map((offer) => offer.url)];
  assert.equal(urls.length, 93);
  for (const value of urls) {
    const url = new URL(value);
    assert.equal(url.protocol, "https:");
    assert.ok(["example.com", "example.net", "example.org"].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)));
  }
});

test("SKU standardization handles punctuation, compound models, Chinese variants and packs", () => {
  const normalized = C.standardizeSku({ title: "ASTER® AUR-T2 白色 真无线耳机 2件装" });
  assert.deepEqual(
    {
      brand: normalized.brand,
      model: normalized.model,
      variant: normalized.variant,
      packSize: normalized.packSize,
      basis: normalized.basis,
    },
    { brand: "aster", model: "aurt2", variant: "white", packSize: 2, basis: "retail" },
  );
  assert.equal(normalized.complete, true);
  assert.equal(C.standardizeSku({ title: "Morrow warm desk lamp beige" }).complete, false);
  assert.equal(C.normalizeModel("KBD-68-Pro"), "kbd68pro");
  assert.equal(C.normalizePackSize("box of 2"), 2);
  assert.equal(C.normalizePackSize("3-pack"), 3);
  assert.equal(C.normalizeBasis("refurbished"), "refurbished");
});

test("matcher accepts exact identity, tolerates a missing brand, and rejects hard conflicts", () => {
  const products = C.PRODUCTS;
  const exact = C.rankMatches({ title: "Aster AUR420 black headphones" }, products)[0];
  assert.equal(exact.productId, "P001");
  assert.equal(exact.accepted, true);
  assert.ok(exact.score >= C.MATCH_THRESHOLD);

  const missingBrand = C.rankMatches({ title: "DOCK-D12 silver USB-C hub" }, products)[0];
  assert.equal(missingBrand.productId, "P006");
  assert.equal(missingBrand.accepted, true);

  const wrongPack = C.rankMatches({ title: "Nori KBD-68 2-pack white keyboard" }, products).find((item) => item.productId === "P004");
  assert.equal(wrongPack.accepted, false);
  assert.ok(wrongPack.hardConflicts.includes("pack_size"));

  const wrongBasis = C.rankMatches({ title: "Vela BTL-V8 green bottle refurbished" }, products).find((item) => item.productId === "P008");
  assert.equal(wrongBasis.accepted, false);
  assert.ok(wrongBasis.hardConflicts.includes("basis"));
});

test("analysis keeps conflicts and low-confidence evidence explicit", () => {
  const { report } = fixtureReport();
  assert.deepEqual(report.summary, {
    skuCount: 30,
    sourceCount: 3,
    observationCount: 90,
    matchedCount: 88,
    unmatchedCount: 2,
    conflictCount: 2,
    reviewCount: 2,
    clearCount: 26,
    emptyCount: 0,
    lowConfidenceOfferCount: 2,
  });

  const conflictIds = report.clusters.filter((cluster) => cluster.status === "conflict").map((cluster) => cluster.product.id);
  assert.deepEqual(conflictIds, ["P006", "P009"]);
  for (const id of conflictIds) {
    const cluster = report.clusters.find((item) => item.product.id === id);
    assert.equal(cluster.mergedPrice, null);
    assert.equal(cluster.indicativePrice, null);
    assert.ok(cluster.conflictReasons.includes("price_spread"));
  }

  const reviewIds = report.clusters.filter((cluster) => cluster.status === "review").map((cluster) => cluster.product.id);
  assert.deepEqual(reviewIds, ["P003", "P016"]);
  for (const id of reviewIds) {
    const cluster = report.clusters.find((item) => item.product.id === id);
    assert.equal(cluster.lowConfidence, true);
    assert.equal(cluster.indicativePrice, null);
    assert.equal(cluster.mergedPrice, null);
  }

  const clear = report.clusters.find((cluster) => cluster.status === "clear");
  assert.equal(clear.indicativePrice, clear.price.median);
  assert.equal(clear.indicativeMethod, "median_of_comparable_offers");
  assert.equal(clear.mergedPrice, null);
});

test("unmatched offers remain separate with their original confidence and reason", () => {
  const { report } = fixtureReport();
  assert.deepEqual(report.unmatched.map((offer) => offer.id), ["O-P007-beta", "O-P023-alpha"]);
  assert.equal(report.unmatched[0].reason, "below_threshold");
  assert.equal(report.unmatched[0].sourceConfidence, 0.68);
  assert.equal(report.unmatched[0].lowSourceConfidence, true);
  assert.equal(report.unmatched[1].reason, "incompatible:basis");
  assert.ok(report.clusters.every((cluster) => !cluster.offers.some((offer) => offer.id.startsWith("O-P007-beta"))));
});

test("price history fixture provides 18 dated points for every SKU", () => {
  const { report } = fixtureReport();
  for (const cluster of report.clusters) {
    assert.equal(cluster.history.length, 18);
    assert.equal(new Set(cluster.history.map((entry) => entry.sourceId)).size, 3);
    assert.equal(new Set(cluster.history.map((entry) => entry.observedAt.slice(0, 10))).size, 6);
  }
});

test("20-case blind test reports raw rows and exact precision/recall without hiding errors", () => {
  const { report } = fixtureReport();
  const blind = report.blind;
  assert.equal(blind.total, 20);
  assert.equal(blind.rows.length, 20);
  assert.deepEqual(blind.rows.map((row) => row.id), Array.from({ length: 20 }, (_, index) => `B${String(index + 1).padStart(3, "0")}`));
  assert.deepEqual(blind.counts, { truePositives: 13, falsePositives: 1, falseNegatives: 2, trueNegatives: 4 });
  assert.equal(blind.precision, 13 / 14);
  assert.equal(blind.recall, 13 / 15);

  const errors = blind.rows.filter((row) => !["true_positive", "true_negative"].includes(row.outcome));
  assert.deepEqual(errors.map((row) => row.id), ["B014", "B015", "B016"]);
  assert.equal(errors[0].outcome, "false_negative");
  assert.equal(errors[1].outcome, "false_negative");
  assert.equal(errors[2].outcome, "false_positive");
  assert.equal(errors[2].predictedProductId, "P001");
  assert.equal(errors[2].lowConfidence, true);
  assert.ok(blind.rows.every((row) => typeof row.matchScore === "number" && typeof row.reason === "string"));
});
