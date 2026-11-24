export const MATCH_THRESHOLD = 0.78;
export const LOW_CONFIDENCE = 0.85;
export const CONFLICT_SPREAD = 0.08;

const BRAND_ALIASES = new Map([
  ["aster", "aster"],
  ["aster audio", "aster"],
  ["nori", "nori"],
  ["nori works", "nori"],
  ["morrow", "morrow"],
  ["morrow lab", "morrow"],
  ["vela", "vela"],
  ["vela goods", "vela"],
  ["kite", "kite"],
  ["kite electric", "kite"],
]);

const VARIANT_ALIASES = new Map([
  ["black", "black"],
  ["黑色", "black"],
  ["white", "white"],
  ["白色", "white"],
  ["silver", "silver"],
  ["银色", "silver"],
  ["blue", "blue"],
  ["蓝色", "blue"],
  ["green", "green"],
  ["绿色", "green"],
  ["pink", "pink"],
  ["粉色", "pink"],
  ["beige", "beige"],
  ["米色", "beige"],
  ["standard", "standard"],
  ["标准", "standard"],
]);

const BASIS_ALIASES = new Map([
  ["retail", "retail"],
  ["single item", "retail"],
  ["sale", "sale"],
  ["refurbished", "refurbished"],
  ["二手", "refurbished"],
  ["翻新", "refurbished"],
  ["membership", "membership"],
  ["bundle", "bundle"],
]);

const CATEGORY_WORDS = new Map([
  ["audio", ["headphone", "earbud", "speaker", "耳机", "音箱"]],
  ["computing", ["keyboard", "mouse", "dock", "hub", "键盘", "鼠标", "扩展坞"]],
  ["home", ["lamp", "kettle", "purifier", "filter", "灯", "水壶", "滤芯"]],
  ["outdoor", ["bottle", "power bank", "charger", "水杯", "充电宝", "充电器"]],
]);

const MODEL_PREFIX_STOP_WORDS = new Set([
  "c", "usb", "type", "w", "v", "gb", "tb", "ml", "cm", "mm", "hz", "khz", "mah", "inch", "pack",
]);

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[_/\\|]+/g, " ")
    .replace(/[–—]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeBrand(value) {
  const text = normalizeText(value);
  if (!text) return "";
  if (BRAND_ALIASES.has(text)) return BRAND_ALIASES.get(text);
  for (const [alias, canonical] of BRAND_ALIASES) {
    if (text.startsWith(`${alias} `)) return canonical;
  }
  return text.replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
}

export function normalizeModel(value) {
  return normalizeText(value).replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
}

export function normalizeVariant(value) {
  const text = normalizeText(value);
  if (!text || text === "default") return "standard";
  return VARIANT_ALIASES.get(text) ?? text.replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
}

export function normalizePackSize(value) {
  if (Number.isFinite(Number(value)) && Number(value) > 0) return Math.trunc(Number(value));
  const text = normalizeText(value);
  const direct = text.match(/(?:pack\s*(?:of\s*)?|box\s*of\s*|盒装\s*|装\s*)(\d+)\s*(?:pack|pcs?|pieces?|件|只|个|入)?/);
  const suffix = text.match(/(\d+)\s*(?:-?\s*pack|pcs?|pieces?|件装|件|只装|只|个装|个|入)/);
  const match = direct ?? suffix;
  return match ? Math.max(1, Number(match[1])) : 1;
}

export function normalizeBasis(value) {
  const text = normalizeText(value);
  if (BASIS_ALIASES.has(text)) return BASIS_ALIASES.get(text);
  if (/refurbished|翻新|二手/.test(text)) return "refurbished";
  if (/membership|会员/.test(text)) return "membership";
  if (/\bsale\b|促销/.test(text)) return "sale";
  if (/\bbundle\b|套装/.test(text)) return "bundle";
  return "retail";
}

export function titleTokens(value) {
  const stop = new Set([
    "the", "with", "for", "and", "of", "new", "inch", "wireless", "wired",
    "耳机", "音箱", "键盘", "鼠标", "扩展坞", "灯具", "水壶", "滤芯", "水杯", "充电宝", "充电器",
  ]);
  return new Set(
    normalizeText(value)
      .match(/[a-z0-9]+|[\u3400-\u9fff]/g)
      ?.filter((token) => token.length > 1 && !stop.has(token)) ?? [],
  );
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

export function similarity(a, b) {
  if (!a || !b) return 0;
  const longest = Math.max(a.length, b.length);
  return longest === 0 ? 1 : 1 - levenshtein(a, b) / longest;
}

export function brandFromTitle(value) {
  const text = normalizeText(value);
  for (const alias of [...BRAND_ALIASES.keys()].sort((a, b) => b.length - a.length)) {
    if (new RegExp(`(?:^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-z0-9])`).test(text)) {
      return BRAND_ALIASES.get(alias);
    }
  }
  return "";
}

export function modelFromTitle(value) {
  const text = normalizeText(value);
  const hyphenated = text.match(/(?:^|[^a-z0-9])([a-z]{2,8}(?:-[a-z]{1,5}\d{1,4}[a-z]?|-\d{1,4}[a-z]?)(?:-[a-z]{1,5})?)(?:$|[^a-z0-9])/);
  if (hyphenated) return normalizeModel(hyphenated[1]);
  const compact = text.match(/(?:^|[^a-z0-9])([a-z]{2,8}\d{1,4}[a-z]?)(?:$|[^a-z0-9])/);
  if (compact && !MODEL_PREFIX_STOP_WORDS.has(compact[1].replace(/\d.*$/, ""))) return normalizeModel(compact[1]);
  const spaced = text.match(/(?:^|[^a-z0-9])([a-z]{2,8})\s+([a-z]{1,5}\d{1,4}[a-z]?)(?:$|[^a-z0-9])/);
  if (spaced && !MODEL_PREFIX_STOP_WORDS.has(spaced[1])) return normalizeModel(`${spaced[1]}${spaced[2]}`);
  return "";
}

export function variantFromTitle(value) {
  const text = normalizeText(value);
  for (const [alias, canonical] of VARIANT_ALIASES) {
    if (text.includes(alias)) return canonical;
  }
  return "standard";
}

export function categoryFromTitle(value) {
  const text = normalizeText(value);
  for (const [category, words] of CATEGORY_WORDS) {
    if (words.some((word) => text.includes(normalizeText(word)))) return category;
  }
  return "";
}

export function normalizeRecord(record) {
  const title = String(record.title ?? "");
  return {
    brand: normalizeBrand(record.brand || brandFromTitle(title)),
    model: normalizeModel(record.model || modelFromTitle(title)),
    variant: normalizeVariant(record.variant || variantFromTitle(title)),
    packSize: normalizePackSize(record.packSize ?? title),
    basis: normalizeBasis(record.basis || title),
    category: normalizeText(record.category || categoryFromTitle(title)),
    tokens: titleTokens(title),
  };
}

export function normalizeProduct(product) {
  return {
    brand: normalizeBrand(product.brand),
    model: normalizeModel(product.model),
    variant: normalizeVariant(product.variant),
    packSize: normalizePackSize(product.packSize),
    basis: normalizeBasis(product.basis),
    category: normalizeText(product.category),
    tokens: titleTokens(`${product.nameEn} ${product.nameZh} ${product.brand} ${product.model}`),
  };
}

export function standardizeSku(record) {
  const normalized = normalizeRecord(record);
  return {
    ...normalized,
    tokens: [...normalized.tokens].sort(),
    key: [normalized.brand, normalized.model, normalized.variant, normalized.packSize, normalized.basis]
      .filter(Boolean)
      .join("|"),
    complete: Boolean(normalized.brand && normalized.model),
  };
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

export function scoreMatch(record, product) {
  const candidate = normalizeRecord(record);
  const canonical = normalizeProduct(product);
  const hardConflicts = [];
  if (candidate.brand && canonical.brand && candidate.brand !== canonical.brand) hardConflicts.push("brand");
  if (candidate.variant !== canonical.variant) hardConflicts.push("variant");
  if (candidate.packSize !== canonical.packSize) hardConflicts.push("pack_size");
  if (candidate.basis !== canonical.basis) hardConflicts.push("basis");
  if (candidate.category && canonical.category && candidate.category !== canonical.category) hardConflicts.push("category");

  const modelExact = Boolean(candidate.model && candidate.model === canonical.model);
  const modelSimilarity = candidate.model ? similarity(candidate.model, canonical.model) : 0;
  const brandExact = Boolean(candidate.brand && candidate.brand === canonical.brand);
  const brandSimilarity = candidate.brand ? similarity(candidate.brand, canonical.brand) : 0;
  const variantExact = candidate.variant === canonical.variant;
  const packExact = candidate.packSize === canonical.packSize;
  const basisExact = candidate.basis === canonical.basis;
  const categoryExact = Boolean(candidate.category && candidate.category === canonical.category);
  const tokenScore = jaccard(candidate.tokens, canonical.tokens);

  const components = {
    model: modelExact ? 0.45 : modelSimilarity >= 0.72 && Math.min(candidate.model.length, canonical.model.length) >= 4 ? 0.3 : 0,
    brand: brandExact ? 0.12 : brandSimilarity >= 0.8 ? 0.08 : 0,
    variant: variantExact ? 0.12 : 0,
    packSize: packExact ? 0.1 : 0,
    basis: basisExact ? 0.06 : 0,
    category: categoryExact ? 0.05 : 0,
    title: Number((tokenScore * 0.1).toFixed(4)),
  };
  const rawScore = Object.values(components).reduce((total, value) => total + value, 0);
  return {
    score: Math.round(rawScore * 100) / 100,
    compatible: hardConflicts.length === 0,
    hardConflicts,
    components,
  };
}

export function unitPrice(offer) {
  const amount = Number(offer.price?.amount);
  const packSize = normalizePackSize(offer.packSize);
  return Number.isFinite(amount) && amount >= 0 ? amount / packSize : null;
}

export function priceSummary(offers) {
  const prices = offers.map(unitPrice).filter((price) => price !== null);
  if (!prices.length) return { low: null, high: null, median: null, spread: null, currencies: [] };
  const sorted = [...prices].sort((a, b) => a - b);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return {
    low: Number(low.toFixed(2)),
    high: Number(high.toFixed(2)),
    median: Number(median.toFixed(2)),
    spread: low === 0 ? (high === 0 ? 0 : 1) : Number(((high - low) / low).toFixed(4)),
    currencies: [...new Set(offers.map((offer) => offer.price?.currency).filter(Boolean))].sort(),
  };
}
