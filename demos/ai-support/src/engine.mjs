import { CATEGORY_LABELS, FAQS, FAQ_BY_ID } from "./faqs.mjs";

export const RETRIEVAL_SETTINGS = Object.freeze({
  k1: 1.5,
  b: 0.75,
  minScore: 7,
  minCoverage: 0.12,
  minConfidence: 0.6,
  candidateLimit: 3,
});

export const REFUSAL_MESSAGES = Object.freeze({
  zh: "我没有找到足够可靠的知识库条目，因此不能猜测。请换一种说法，或使用“转人工”创建模拟工单。",
  en: "I could not find a sufficiently reliable knowledge-base entry, so I will not guess. Try rephrasing your question or use “Human handoff” to create a mock ticket.",
});

const PII_PATTERNS = Object.freeze([
  {
    type: "email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    mask: "[email]",
  },
  {
    type: "national_id",
    pattern: /(?<!\d)\d{17}[\dXx](?!\d)/g,
    mask: "[id]",
  },
  {
    type: "phone",
    pattern: /(?<!\d)(?:\+?86[-\s]?)?1[3-9]\d(?:[-\s]?\d){8}(?!\d)/g,
    mask: "[phone]",
  },
]);

const ZH_STOP_PHRASES = [
  "请问", "怎么办", "如何", "怎么", "怎样", "什么", "哪里", "哪个", "是否", "可以", "能否",
  "我的", "我们", "你们", "这个", "那个", "一下", "为什么",
];
const ZH_STOP_CHARS = new Set("的了和是在有与及或为对把被这那我你他她它吗呢吧啊");
const EN_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "could", "do", "does",
  "for", "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "our",
  "please", "should", "that", "the", "their", "this", "to", "was", "we", "what",
  "when", "where", "which", "who", "will", "with", "would", "you", "your",
]);

/** Replace supported PII classes without retaining matched raw values. */
export function redactPII(value) {
  const counts = new Map();
  let text = String(value ?? "");

  for (const rule of PII_PATTERNS) {
    text = text.replace(rule.pattern, () => {
      counts.set(rule.type, (counts.get(rule.type) ?? 0) + 1);
      return rule.mask;
    });
  }

  return {
    text,
    matches: [...counts].map(([type, count]) => ({ type, count })),
    count: [...counts.values()].reduce((sum, count) => sum + count, 0),
  };
}

export function containsPII(value) {
  return redactPII(value).count > 0;
}

/** Recursively mask strings before any log object is retained in memory. */
export function sanitizeForLog(value) {
  if (typeof value === "string") return redactPII(value).text;
  if (Array.isArray(value)) return value.map(sanitizeForLog);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeForLog(item)]),
    );
  }
  return value;
}

let logSequence = 0;

export function createLogEntry(type, payload = {}) {
  logSequence += 1;
  return {
    id: `LOG-${String(logSequence).padStart(4, "0")}`,
    timestamp: new Date().toISOString(),
    type,
    ...sanitizeForLog(payload),
  };
}

export function appendLog(log, entry, maxEntries = 100) {
  const next = [...log, entry];
  return next.length > maxEntries ? next.slice(next.length - maxEntries) : next;
}

function stemEnglish(word) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

/**
 * Offline tokenizer: Latin words use light stemming; Han text uses bigrams.
 * It is intentionally transparent rather than a hidden semantic model.
 */
export function tokenize(value) {
  let text = String(value ?? "").toLowerCase();
  for (const phrase of ZH_STOP_PHRASES) text = text.split(phrase).join(" ");
  const tokens = [];

  for (const run of text.matchAll(/[\p{Script=Han}]+/gu)) {
    const han = run[0];
    if (han.length === 1) {
      if (!ZH_STOP_CHARS.has(han)) tokens.push(han);
      continue;
    }
    for (let index = 0; index < han.length - 1; index += 1) {
      tokens.push(han.slice(index, index + 2));
    }
  }

  const latinText = text.replace(/[\p{Script=Han}]+/gu, " ");
  for (const match of latinText.matchAll(/[a-z0-9]+(?:[._-][a-z0-9]+)*/gi)) {
    const word = stemEnglish(match[0].replace(/'s$/, ""));
    if (word && !EN_STOP_WORDS.has(word)) tokens.push(word);
  }

  return tokens;
}

function countTokens(tokens) {
  const counts = new Map();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return counts;
}

function documentText(faq) {
  return [
    faq.zh.question,
    faq.zh.answer,
    faq.zh.keywords.join(" "),
    faq.en.question,
    faq.en.answer,
    faq.en.keywords.join(" "),
    CATEGORY_LABELS[faq.category]?.zh ?? "",
    CATEGORY_LABELS[faq.category]?.en ?? "",
  ].join(" ");
}

export function buildIndex(faqs = FAQS) {
  const documents = faqs.map((faq) => {
    const tokens = tokenize(documentText(faq));
    return { faq, tokens, length: tokens.length, counts: countTokens(tokens) };
  });
  const documentFrequency = new Map();
  for (const document of documents) {
    for (const token of document.counts.keys()) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }
  const averageLength = documents.reduce((sum, document) => sum + document.length, 0) / documents.length;
  return { documents, documentFrequency, averageLength, size: documents.length };
}

export const BM25_INDEX = buildIndex();

function inverseDocumentFrequency(index, term) {
  const frequency = index.documentFrequency.get(term) ?? 0;
  return Math.log(1 + (index.size - frequency + 0.5) / (frequency + 0.5));
}

/** Retrieve ranked FAQ entries and expose lexical evidence for inspection. */
export function retrieve(query, options = {}) {
  const {
    limit = RETRIEVAL_SETTINGS.candidateLimit,
    lang = "zh",
    index = BM25_INDEX,
  } = options;
  const safeQuery = redactPII(query);
  // PII labels are evidence for masking, not for answer intent. Exclude them
  // from retrieval so a phone/email/ID mention cannot dominate the ranking.
  const retrievalText = safeQuery.text
    .replace(/\[(?:email|phone|id)\]/gi, " ")
    .replace(/身份证号|手机号|邮箱|电话号码/g, " ");
  const queryTerms = [...new Set(tokenize(retrievalText))];
  const queryIdf = new Map(queryTerms.map((term) => [term, inverseDocumentFrequency(index, term)]));
  const totalIdf = [...queryIdf.values()].reduce((sum, idf) => sum + idf, 0);

  const ranked = index.documents.map((document) => {
    let score = 0;
    let matchedIdf = 0;
    const matchedTerms = [];

    for (const term of queryTerms) {
      const frequency = document.counts.get(term) ?? 0;
      if (frequency === 0) continue;
      const idf = queryIdf.get(term);
      const denominator = frequency + RETRIEVAL_SETTINGS.k1 * (
        1 - RETRIEVAL_SETTINGS.b + RETRIEVAL_SETTINGS.b * document.length / index.averageLength
      );
      score += idf * (frequency * (RETRIEVAL_SETTINGS.k1 + 1)) / denominator;
      matchedIdf += idf;
      matchedTerms.push(term);
    }

    const source = document.faq[lang] ?? document.faq.zh;
    const coverage = totalIdf === 0 ? 0 : matchedIdf / totalIdf;
    const scoreSignal = score / (score + RETRIEVAL_SETTINGS.minScore / 2);
    const coverageSignal = 0.65 + 0.35 * Math.min(
      1,
      coverage / RETRIEVAL_SETTINGS.minCoverage,
    );
    return {
      faqId: document.faq.id,
      category: document.faq.category,
      categoryLabel: CATEGORY_LABELS[document.faq.category]?.[lang] ?? document.faq.category,
      question: source.question,
      answer: source.answer,
      score: Number(score.toFixed(6)),
      coverage: Number(coverage.toFixed(6)),
      confidence: Number(Math.min(0.99, scoreSignal * coverageSignal).toFixed(6)),
      matchedTerms,
    };
  });

  ranked.sort((left, right) => right.score - left.score || left.faqId.localeCompare(right.faqId));
  return {
    query: safeQuery.text,
    pii: safeQuery.matches,
    terms: queryTerms,
    candidates: ranked.slice(0, Math.max(0, limit)),
  };
}

export function validateCitations(citations, faqById = FAQ_BY_ID) {
  return Array.isArray(citations)
    && citations.length > 0
    && citations.every((citation) => typeof citation === "string" && faqById.has(citation));
}

/** Deterministic answer composition: one retrieved FAQ template plus its ID. */
export function answerQuestion(rawQuery, options = {}) {
  const lang = options.lang === "en" ? "en" : "zh";
  const index = options.index ?? BM25_INDEX;
  const retrieval = retrieve(rawQuery, { lang, index });
  const top = retrieval.candidates[0];
  const accepted = Boolean(
    top
    && top.score >= RETRIEVAL_SETTINGS.minScore
    && top.coverage >= RETRIEVAL_SETTINGS.minCoverage
    && top.confidence >= RETRIEVAL_SETTINGS.minConfidence,
  );

  if (!accepted) {
    return {
      status: "refused",
      lang,
      query: retrieval.query,
      pii: retrieval.pii,
      terms: retrieval.terms,
      answer: REFUSAL_MESSAGES[lang],
      answerText: null,
      citations: [],
      selectedFaqId: null,
      confidence: top?.confidence ?? 0,
      score: top?.score ?? 0,
      threshold: {
        minScore: RETRIEVAL_SETTINGS.minScore,
        minCoverage: RETRIEVAL_SETTINGS.minCoverage,
        minConfidence: RETRIEVAL_SETTINGS.minConfidence,
      },
      candidates: retrieval.candidates,
    };
  }

  const answerText = redactPII(top.answer).text;
  return {
    status: "answered",
    lang,
    query: retrieval.query,
    pii: retrieval.pii,
    terms: retrieval.terms,
    answer: `${answerText}\n\n[${top.faqId}]`,
    answerText,
    citations: [top.faqId],
    selectedFaqId: top.faqId,
    confidence: top.confidence,
    score: top.score,
    threshold: {
      minScore: RETRIEVAL_SETTINGS.minScore,
      minCoverage: RETRIEVAL_SETTINGS.minCoverage,
      minConfidence: RETRIEVAL_SETTINGS.minConfidence,
    },
    candidates: retrieval.candidates,
  };
}
