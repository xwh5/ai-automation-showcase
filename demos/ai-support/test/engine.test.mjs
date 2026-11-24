import test from "node:test";
import assert from "node:assert/strict";

import { CATEGORY_LABELS, FAQS, FAQ_BY_ID } from "../src/faqs.mjs";
import { EVAL_CASES } from "../src/eval-cases.mjs";
import {
  answerQuestion,
  appendLog,
  buildIndex,
  containsPII,
  createLogEntry,
  redactPII,
  retrieve,
  sanitizeForLog,
  tokenize,
  validateCitations,
} from "../src/engine.mjs";

test("synthetic dataset has at least 50 unique bilingual FAQs", () => {
  assert.ok(FAQS.length >= 50);
  assert.equal(new Set(FAQS.map((faq) => faq.id)).size, FAQS.length);
  for (const faq of FAQS) {
    assert.ok(CATEGORY_LABELS[faq.category]);
    assert.ok(faq.zh.question.length > 0);
    assert.ok(faq.zh.answer.length > 0);
    assert.ok(faq.en.question.length > 0);
    assert.ok(faq.en.answer.length > 0);
    assert.ok(Array.isArray(faq.zh.keywords));
    assert.ok(Array.isArray(faq.en.keywords));
  }
});

test("fixed evaluation set contains exactly 30 balanced synthetic cases", () => {
  assert.equal(EVAL_CASES.length, 30);
  assert.equal(new Set(EVAL_CASES.map((item) => item.id)).size, 30);
  assert.equal(EVAL_CASES.filter((item) => item.kind === "answerable").length, 20);
  assert.equal(EVAL_CASES.filter((item) => item.kind === "out_of_scope").length, 10);
  for (const item of EVAL_CASES) {
    if (item.kind === "answerable") assert.ok(FAQ_BY_ID.has(item.expectedFaqId));
  }
});

test("tokenizer handles English words and Chinese bigrams", () => {
  assert.ok(tokenize("How do I reset my password?").includes("password"));
  assert.ok(tokenize("reset passwords").includes("password"));
  assert.ok(tokenize("如何重置密码").includes("重置"));
  assert.ok(tokenize("如何重置密码").includes("密码"));
});

test("BM25 retrieves the expected FAQ for representative questions", () => {
  const cases = [
    ["如何下载发票？", "KB-008"],
    ["How can I turn on two-factor authentication?", "KB-002"],
    ["API 返回 429 时应该如何处理速率限制？", "KB-032"],
    ["How many times are failed webhook deliveries retried?", "KB-031"],
  ];
  for (const [question, expectedId] of cases) {
    const result = retrieve(question);
    assert.equal(result.candidates[0].faqId, expectedId);
    assert.ok(result.candidates[0].score > 0);
    assert.ok(result.candidates[0].matchedTerms.length > 0);
  }
});

test("retrieval can return the English template for a Chinese query", () => {
  const result = retrieve("如何下载发票", { lang: "en" });
  assert.equal(result.candidates[0].faqId, "KB-008");
  assert.match(result.candidates[0].question, /invoice/i);
  assert.match(result.candidates[0].answer, /Billing/);
});

test("answered questions compose the cited FAQ template and a valid citation", () => {
  const result = answerQuestion("如何下载发票？", { lang: "zh" });
  assert.equal(result.status, "answered");
  assert.equal(result.selectedFaqId, "KB-008");
  assert.deepEqual(result.citations, ["KB-008"]);
  assert.equal(validateCitations(result.citations), true);
  assert.equal(result.answerText, FAQ_BY_ID.get("KB-008").zh.answer);
  assert.ok(result.answer.endsWith("[KB-008]"));
});

test("out-of-scope questions are refused without fabricated citations", () => {
  for (const question of ["今天上海天气怎么样？", "Recommend a stock that will double next month."]) {
    const result = answerQuestion(question);
    assert.equal(result.status, "refused");
    assert.equal(result.selectedFaqId, null);
    assert.deepEqual(result.citations, []);
    assert.match(result.answer, /不能猜测|will not guess/);
  }
});

test("an empty or unrelated index triggers low-confidence refusal", () => {
  const tinyIndex = buildIndex([FAQS[0]]);
  const result = answerQuestion("quantum banana orchard", { index: tinyIndex, lang: "en" });
  assert.equal(result.status, "refused");
  assert.deepEqual(result.citations, []);
});

test("PII redaction masks email, mainland mobile, and 18-digit national ID", () => {
  const input = "联系 alice@example.com、13800138000、+86 139 1234 5678，证件 110101199001011234。";
  const result = redactPII(input);
  assert.equal(result.count, 4);
  assert.deepEqual(result.matches, [
    { type: "email", count: 1 },
    { type: "national_id", count: 1 },
    { type: "phone", count: 2 },
  ]);
  assert.equal(containsPII(input), true);
  assert.equal(containsPII(result.text), false);
  assert.doesNotMatch(result.text, /alice@example\.com|13800138000|110101199001011234/);
  assert.match(result.text, /\[email\]/);
  assert.match(result.text, /\[phone\]/);
  assert.match(result.text, /\[id\]/);
});

test("answers and retained log entries never contain raw synthetic PII", () => {
  const result = answerQuestion("我的邮箱 alice@example.com 收不到密码重置邮件，怎么办？");
  assert.equal(result.status, "answered");
  assert.equal(containsPII(result.query), false);
  assert.equal(containsPII(result.answer), false);
  const entry = createLogEntry("query", {
    query: result.query,
    answer: result.answer,
    nested: { note: "手机 13800138000，身份证 110101199001011234" },
  });
  const serialized = JSON.stringify(entry);
  assert.equal(containsPII(serialized), false);
  assert.doesNotMatch(serialized, /alice@example\.com|13800138000|110101199001011234/);
});

test("nested log sanitization masks every string field", () => {
  const safe = sanitizeForLog({
    text: "a@example.com",
    list: ["13800138000", { id: "110101199001011234" }],
    count: 2,
  });
  assert.equal(containsPII(JSON.stringify(safe)), false);
  assert.equal(safe.count, 2);
});

test("in-memory log append enforces its bounded size", () => {
  let log = [];
  for (let index = 0; index < 105; index += 1) {
    log = appendLog(log, createLogEntry("query", { index }), 100);
  }
  assert.equal(log.length, 100);
  assert.equal(log[0].index, 5);
  assert.equal(log.at(-1).index, 104);
});

test("citation validation rejects empty and unknown references", () => {
  assert.equal(validateCitations([]), false);
  assert.equal(validateCitations(["KB-999"]), false);
  assert.equal(validateCitations(["KB-001", null]), false);
  assert.equal(validateCitations(["KB-001", "KB-054"]), true);
});

test("all 30 fixed evaluation cases produce the expected behavior", () => {
  for (const item of EVAL_CASES) {
    const result = answerQuestion(item.question, { lang: item.lang });
    if (item.kind === "out_of_scope") {
      assert.equal(result.status, "refused", `${item.id} should refuse`);
      assert.deepEqual(result.citations, [], `${item.id} must not fabricate a citation`);
    } else {
      assert.equal(result.status, "answered", `${item.id} should answer`);
      assert.equal(result.selectedFaqId, item.expectedFaqId, `${item.id} selected the wrong FAQ`);
      assert.equal(validateCitations(result.citations), true, `${item.id} needs a valid citation`);
    }
    assert.equal(containsPII(result.answer), false, `${item.id} leaked PII in its answer`);
  }
});
