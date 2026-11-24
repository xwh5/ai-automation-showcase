import {
  CONFLICT_SPREAD,
  LOW_CONFIDENCE,
  MATCH_THRESHOLD,
  normalizeRecord,
  priceSummary,
  scoreMatch,
  standardizeSku,
  unitPrice,
} from "./model.mjs";

export function rankMatches(record, products) {
  const normalized = standardizeSku(record);
  return products
    .map((product) => {
      const result = scoreMatch(record, product);
      return {
        productId: product.id,
        model: product.model,
        nameEn: product.nameEn,
        nameZh: product.nameZh,
        ...result,
        accepted: result.compatible && result.score >= MATCH_THRESHOLD,
      };
    })
    .sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.score - a.score || a.productId.localeCompare(b.productId))
    .map((candidate, index) => ({ ...candidate, rank: index + 1, normalized }));
}

export function matchObservation(observation, products) {
  const candidates = rankMatches(observation, products);
  const best = candidates[0] ?? null;
  const accepted = best?.accepted ? best : null;
  return {
    observationId: observation.id,
    productId: accepted?.productId ?? null,
    matchScore: best?.score ?? 0,
    confidence: accepted ? Math.min(Number(observation.confidence ?? 1), accepted.score) : 0,
    lowConfidence: Boolean(accepted && Math.min(Number(observation.confidence ?? 1), accepted.score) < LOW_CONFIDENCE),
    candidates: candidates.slice(0, 3),
    reason: accepted
      ? "accepted"
      : best?.compatible
        ? "below_threshold"
        : `incompatible:${best?.hardConflicts.join(",") ?? "no_candidate"}`,
  };
}

export function evaluateBlindCases(blindCases, products) {
  const rows = blindCases.map((testCase) => {
    const match = matchObservation({ id: testCase.id, title: testCase.title }, products);
    const predictedProductId = match.productId;
    const expectedProductId = testCase.expectedProductId ?? null;
    let outcome = "true_negative";
    if (expectedProductId && predictedProductId === expectedProductId) outcome = "true_positive";
    else if (expectedProductId && predictedProductId) outcome = "false_positive_and_false_negative";
    else if (expectedProductId) outcome = "false_negative";
    else if (predictedProductId) outcome = "false_positive";
    return {
      id: testCase.id,
      title: testCase.title,
      expectedProductId,
      predictedProductId,
      expectedNote: testCase.expectedNote,
      matchScore: match.matchScore,
      confidence: match.confidence,
      accepted: Boolean(predictedProductId),
      lowConfidence: match.lowConfidence,
      outcome,
      reason: match.reason,
      normalized: match.candidates[0]?.normalized ?? standardizeSku({ title: testCase.title }),
      topCandidates: match.candidates,
    };
  });

  const count = (outcome) => rows.filter((row) => row.outcome === outcome).length;
  const truePositives = count("true_positive");
  const falsePositives = count("false_positive") + count("false_positive_and_false_negative");
  const falseNegatives = count("false_negative") + count("false_positive_and_false_negative");
  const trueNegatives = count("true_negative");
  return {
    threshold: MATCH_THRESHOLD,
    total: rows.length,
    rows,
    counts: { truePositives, falsePositives, falseNegatives, trueNegatives },
    precision: truePositives + falsePositives === 0 ? null : truePositives / (truePositives + falsePositives),
    recall: truePositives + falseNegatives === 0 ? null : truePositives / (truePositives + falseNegatives),
  };
}

export function analyzeFixture(fixture) {
  const products = fixture.products ?? [];
  const observations = fixture.observations ?? [];
  const sources = fixture.sources ?? [];
  const history = fixture.history ?? [];
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const matches = observations.map((observation) => ({ observation, ...matchObservation(observation, products) }));
  const matched = matches.filter((match) => match.productId);
  const unmatched = matches.filter((match) => !match.productId);

  const clusters = products.map((product) => {
    const offers = matched
      .filter((match) => match.productId === product.id)
      .map((match) => ({
        ...match.observation,
        source: sourceById.get(match.observation.sourceId) ?? null,
        matchScore: match.matchScore,
        matchConfidence: match.confidence,
        lowConfidence: match.lowConfidence,
        matchReason: match.reason,
        matchComponents: match.candidates[0]?.components ?? {},
      }))
      .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
    const summary = priceSummary(offers);
    const conflictReasons = [];
    if (summary.currencies.length > 1) conflictReasons.push("currency_mismatch");
    if (new Set(offers.map((offer) => offer.basis)).size > 1) conflictReasons.push("basis_mismatch");
    if (summary.spread !== null && summary.spread > CONFLICT_SPREAD) conflictReasons.push("price_spread");
    const lowConfidence = offers.some((offer) => offer.lowConfidence);
    const status = offers.length === 0 ? "empty" : conflictReasons.length ? "conflict" : lowConfidence ? "review" : "clear";
    const comparable = summary.currencies.length <= 1 && new Set(offers.map((offer) => offer.basis)).size <= 1;
    const indicativePrice = status === "clear" && comparable ? summary.median : null;
    return {
      product,
      normalized: standardizeSku(product),
      offers,
      price: summary,
      conflictReasons,
      lowConfidence,
      status,
      indicativePrice,
      indicativeMethod: indicativePrice === null ? null : "median_of_comparable_offers",
      mergedPrice: null,
      history: history
        .filter((entry) => entry.productId === product.id)
        .sort((a, b) => a.observedAt.localeCompare(b.observedAt)),
    };
  });

  const blind = evaluateBlindCases(fixture.blindCases ?? [], products);
  return {
    meta: {
      ...(fixture.meta ?? {}),
      matchThreshold: MATCH_THRESHOLD,
      lowConfidenceThreshold: LOW_CONFIDENCE,
      conflictSpreadThreshold: CONFLICT_SPREAD,
      analysisMethod: "catalog-assisted deterministic scoring; no silent price merge",
    },
    sources,
    clusters,
    unmatched: unmatched.map((match) => ({
      ...match.observation,
      matchScore: match.matchScore,
      confidence: match.confidence,
      sourceConfidence: Number(match.observation.confidence ?? 1),
      lowSourceConfidence: Number(match.observation.confidence ?? 1) < LOW_CONFIDENCE,
      reason: match.reason,
      topCandidates: match.candidates,
      unitPrice: unitPrice(match.observation),
    })),
    blind,
    summary: {
      skuCount: products.length,
      sourceCount: sources.length,
      observationCount: observations.length,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      conflictCount: clusters.filter((cluster) => cluster.status === "conflict").length,
      reviewCount: clusters.filter((cluster) => cluster.status === "review").length,
      clearCount: clusters.filter((cluster) => cluster.status === "clear").length,
      emptyCount: clusters.filter((cluster) => cluster.status === "empty").length,
      lowConfidenceOfferCount: matched.filter((match) => match.lowConfidence).length,
    },
  };
}
