const SYNTHETIC_HOSTS = new Set(["example.com", "example.net", "example.org"]);

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireArray(root, key) {
  if (!Array.isArray(root[key])) throw new Error(`Fixture field "${key}" must be an array.`);
  return root[key];
}

function uniqueIds(rows, label) {
  const ids = new Set();
  for (const row of rows) {
    if (!isRecord(row) || typeof row.id !== "string" || !row.id.trim()) throw new Error(`${label} rows need a non-empty string id.`);
    if (ids.has(row.id)) throw new Error(`Duplicate ${label} id: ${row.id}`);
    ids.add(row.id);
  }
}

function isSyntheticUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return [...SYNTHETIC_HOSTS].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export function parseFixture(text) {
  let root;
  try {
    root = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }
  if (!isRecord(root)) throw new Error("Fixture root must be an object.");
  if (isRecord(root.meta) && root.meta.synthetic === false) throw new Error("Only synthetic fixtures are accepted.");
  const products = requireArray(root, "products");
  const sources = requireArray(root, "sources");
  const observations = requireArray(root, "observations");
  const history = requireArray(root, "history");
  const blindCases = root.blindCases ?? [];
  if (!Array.isArray(blindCases)) throw new Error('Fixture field "blindCases" must be an array.');
  uniqueIds(products, "product");
  uniqueIds(sources, "source");
  uniqueIds(observations, "observation");
  uniqueIds(history, "history");
  uniqueIds(blindCases, "blind case");

  const productIds = new Set(products.map((product) => product.id));
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const product of products) {
    if (![product.brand, product.model, product.nameEn, product.nameZh].every((value) => typeof value === "string" && value.trim())) {
      throw new Error(`Product ${product.id} needs brand, model, nameEn and nameZh.`);
    }
    if (!Number.isFinite(Number(product.basePrice)) || Number(product.basePrice) < 0) {
      throw new Error(`Product ${product.id} needs a non-negative basePrice.`);
    }
  }
  for (const source of sources) {
    if (!isSyntheticUrl(source.url)) throw new Error(`Source ${source.id} must use an https://example.com, example.net or example.org address.`);
    if (!Number.isFinite(Number(source.reliability)) || Number(source.reliability) < 0 || Number(source.reliability) > 1) {
      throw new Error(`Source ${source.id} reliability must be between 0 and 1.`);
    }
  }
  for (const observation of observations) {
    if (!sourceIds.has(observation.sourceId)) throw new Error(`Observation ${observation.id} references an unknown source.`);
    if (typeof observation.title !== "string" || !observation.title.trim()) throw new Error(`Observation ${observation.id} needs a title.`);
    if (!isRecord(observation.price) || !Number.isFinite(Number(observation.price.amount)) || Number(observation.price.amount) < 0) {
      throw new Error(`Observation ${observation.id} needs a non-negative price.amount.`);
    }
    if (typeof observation.price.currency !== "string" || !/^[A-Z]{3}$/.test(observation.price.currency)) {
      throw new Error(`Observation ${observation.id} needs a three-letter price.currency.`);
    }
    if (!Number.isFinite(Date.parse(observation.observedAt))) throw new Error(`Observation ${observation.id} has an invalid observedAt.`);
    if (!Number.isFinite(Number(observation.confidence)) || Number(observation.confidence) < 0 || Number(observation.confidence) > 1) {
      throw new Error(`Observation ${observation.id} confidence must be between 0 and 1.`);
    }
    if (!isSyntheticUrl(observation.url)) throw new Error(`Observation ${observation.id} must use a synthetic example URL.`);
  }
  for (const entry of history) {
    if (!productIds.has(entry.productId) || !sourceIds.has(entry.sourceId)) throw new Error(`History ${entry.id} references an unknown product or source.`);
    if (!Number.isFinite(Date.parse(entry.observedAt))) throw new Error(`History ${entry.id} has an invalid observedAt.`);
    if (!isRecord(entry.price) || !Number.isFinite(Number(entry.price.amount)) || Number(entry.price.amount) < 0) {
      throw new Error(`History ${entry.id} needs a non-negative price.amount.`);
    }
  }
  for (const testCase of blindCases) {
    if (typeof testCase.title !== "string" || !testCase.title.trim()) throw new Error(`Blind case ${testCase.id} needs a title.`);
    if (testCase.expectedProductId !== null && !productIds.has(testCase.expectedProductId)) {
      throw new Error(`Blind case ${testCase.id} references an unknown expected product.`);
    }
  }
  return {
    meta: { ...(isRecord(root.meta) ? root.meta : {}), synthetic: true, schemaVersion: 1 },
    sources,
    products,
    observations,
    history,
    blindCases,
  };
}

export function exportJSON(report, options = {}) {
  return `${JSON.stringify({
    exportedAt: options.exportedAt ?? null,
    schemaVersion: 1,
    synthetic: true,
    disclaimer: report.meta?.disclaimer ?? null,
    summary: report.summary,
    sources: report.sources,
    clusters: report.clusters,
    unmatched: report.unmatched,
    blindTest: report.blind,
  }, null, 2)}\n`;
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportCSV(report) {
  const header = [
    "row_type", "cluster_id", "model", "normalized_key", "observation_id", "source_id", "source_name_en",
    "source_url", "observed_at", "title", "amount", "currency", "pack_size", "unit_price", "basis",
    "confidence", "match_score", "low_confidence", "conflict", "status",
  ];
  const rows = [];
  for (const cluster of report.clusters) {
    for (const offer of cluster.offers) {
      rows.push([
        "matched_offer", cluster.product.id, cluster.product.model, cluster.normalized.key, offer.id,
        offer.sourceId, offer.source?.nameEn ?? "", offer.source?.url ?? "", offer.observedAt, offer.title,
        offer.price.amount, offer.price.currency, offer.packSize, (offer.price.amount / offer.packSize).toFixed(2),
        offer.basis, offer.matchConfidence.toFixed(4), offer.matchScore.toFixed(4), offer.lowConfidence,
        cluster.status === "conflict", cluster.status,
      ]);
    }
  }
  for (const offer of report.unmatched) {
    rows.push([
      "unmatched_offer", "", "", "", offer.id, offer.sourceId, report.sources.find((source) => source.id === offer.sourceId)?.nameEn ?? "",
      offer.url, offer.observedAt, offer.title, offer.price.amount, offer.price.currency, offer.packSize,
      offer.unitPrice?.toFixed(2) ?? "", offer.basis, (offer.sourceConfidence ?? offer.confidence).toFixed(4), offer.matchScore.toFixed(4),
      true, "unmatched",
    ]);
  }
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
