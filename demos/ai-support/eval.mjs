import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { FAQS, FAQ_BY_ID } from "./src/faqs.mjs";
import { EVAL_CASES } from "./src/eval-cases.mjs";
import {
  answerQuestion,
  createLogEntry,
  redactPII,
  RETRIEVAL_SETTINGS,
  validateCitations,
} from "./src/engine.mjs";

const outputDirectory = fileURLToPath(new URL("./results/", import.meta.url));

function ratio(numerator, denominator) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function evaluateCase(testCase) {
  const result = answerQuestion(testCase.question, { lang: testCase.lang });
  const expectedSource = testCase.expectedFaqId ? FAQ_BY_ID.get(testCase.expectedFaqId) : null;
  const behaviorCorrect = testCase.kind === "out_of_scope"
    ? result.status === "refused"
    : result.status === "answered" && result.selectedFaqId === testCase.expectedFaqId;
  const citationValid = result.status !== "answered" || validateCitations(result.citations);
  const expectedTemplate = expectedSource
    ? redactPII(expectedSource[testCase.lang].answer).text
    : null;
  const templateGrounded = result.status !== "answered"
    || (expectedSource !== null && result.answerText === expectedTemplate);
  const logEntry = createLogEntry("query", {
    query: result.query,
    status: result.status,
    faqId: result.selectedFaqId,
    answer: result.answer,
  });
  const answerLeaks = redactPII(result.answer).count;
  const logLeaks = redactPII(JSON.stringify(logEntry)).count;
  const resultLeaks = redactPII(JSON.stringify(result)).count;
  const piiLeakCount = answerLeaks + logLeaks + resultLeaks;

  return {
    id: testCase.id,
    lang: testCase.lang,
    kind: testCase.kind,
    input: result.query,
    inputHadPII: result.pii.length > 0,
    piiTypes: result.pii.map((match) => match.type),
    expectedFaqId: testCase.expectedFaqId ?? null,
    expectedBehavior: testCase.kind === "out_of_scope" ? "refuse" : "answer",
    status: result.status,
    selectedFaqId: result.selectedFaqId,
    citations: result.citations,
    citationValid,
    templateGrounded,
    behaviorCorrect,
    score: result.score,
    coverage: result.candidates[0]?.coverage ?? 0,
    confidence: result.confidence,
    threshold: result.threshold,
    terms: result.terms,
    answer: result.answer,
    candidates: result.candidates.map((candidate) => ({
      faqId: candidate.faqId,
      score: candidate.score,
      coverage: candidate.coverage,
      confidence: candidate.confidence,
      matchedTerms: candidate.matchedTerms,
    })),
    logEntry,
    piiLeakCount,
  };
}

function summarize(results) {
  const total = results.length;
  const answerable = results.filter((result) => result.kind === "answerable");
  const outOfScope = results.filter((result) => result.kind === "out_of_scope");
  const answered = results.filter((result) => result.status === "answered");
  const refused = results.filter((result) => result.status === "refused");
  const behaviorCorrect = results.filter((result) => result.behaviorCorrect).length;
  const correctAnswerable = answerable.filter((result) => result.behaviorCorrect).length;
  const correctRefusals = outOfScope.filter((result) => result.status === "refused").length;
  const hallucinated = answered.filter((result) => !result.citationValid || !result.templateGrounded).length;
  const uncited = answered.filter((result) => !result.citationValid).length;

  return {
    totalQuestions: total,
    answerableQuestions: answerable.length,
    outOfScopeQuestions: outOfScope.length,
    answeredCount: answered.length,
    refusedCount: refused.length,
    accuracy: ratio(behaviorCorrect, total),
    answerableAccuracy: ratio(correctAnswerable, answerable.length),
    refusalCorrectness: ratio(correctRefusals, outOfScope.length),
    falseRefusalCount: answerable.length - correctAnswerable,
    hallucinationRate: ratio(hallucinated, answered.length),
    uncitedAnswerRate: ratio(uncited, answered.length),
    invalidCitationCount: uncited,
    piiLeakCount: results.reduce((sum, result) => sum + result.piiLeakCount, 0),
  };
}

function escapeCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function renderMarkdown(report) {
  const metrics = report.metrics;
  const lines = [
    "# AI Support 离线评测结果 / Offline Evaluation Results",
    "",
    `生成时间 / Generated: ${report.generatedAt}`,
    "",
    "> 固定合成评测集；不是生产准确率或零幻觉承诺。",
    "> Fixed synthetic evaluation set; not a production accuracy or zero-hallucination claim.",
    "",
    "## 指标 / Metrics",
    "",
    "| 指标 / Metric | 数值 / Value |",
    "| --- | ---: |",
    `| Accuracy（总体行为正确率 / overall behavior accuracy） | ${percent(metrics.accuracy)} |`,
    `| Answerable accuracy（可答题正确率 / answerable accuracy） | ${percent(metrics.answerableAccuracy)} |`,
    `| Refusal correctness（拒答正确率 / refusal correctness） | ${percent(metrics.refusalCorrectness)} |`,
    `| Hallucination / 无依据率 / unsupported-answer rate | ${percent(metrics.hallucinationRate)} |`,
    `| 无引用率 / uncited-answer rate | ${percent(metrics.uncitedAnswerRate)} |`,
    `| PII 泄漏数 / PII leak count | ${metrics.piiLeakCount} |`,
    `| 误拒数 / false refusals | ${metrics.falseRefusalCount} |`,
    "",
    `数据集 / Dataset: ${report.dataset.faqCount} 条双语 FAQ，${report.dataset.evalCaseCount} 道固定评测题。`,
    `回答阈值 / Answer gates: BM25 ≥ ${RETRIEVAL_SETTINGS.minScore}，词项覆盖 ≥ ${RETRIEVAL_SETTINGS.minCoverage}，组合置信度 ≥ ${RETRIEVAL_SETTINGS.minConfidence}。`,
    "",
    "## 30 题逐题结果 / Per-question Results",
    "",
    "| ID | 语言 | 类型 | 脱敏后输入 | 结果 | 命中 FAQ | BM25 | 置信度 | 正确 | 引用有效 | PII 泄漏 |",
    "| --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | ---: |",
  ];

  for (const result of report.results) {
    lines.push(
      `| ${result.id} | ${result.lang} | ${result.kind} | ${escapeCell(result.input)} | ${result.status} | ${result.selectedFaqId ?? "—"} | ${result.score.toFixed(2)} | ${percent(result.confidence)} | ${result.behaviorCorrect ? "✓" : "✗"} | ${result.citationValid ? "✓" : "—"} | ${result.piiLeakCount} |`,
    );
  }

  lines.push("", "## 原始回答与候选 / Raw Answers and Candidates", "");
  for (const result of report.results) {
    lines.push(
      `### ${result.id} · ${result.lang} · ${result.status}`,
      "",
      `- 输入 / Input: ${result.input}`,
      `- 期望 / Expected: ${result.expectedBehavior}${result.expectedFaqId ? ` (${result.expectedFaqId})` : ""}`,
      `- 引用 / Citations: ${result.citations.length ? result.citations.join(", ") : "none (refusal)"}`,
      `- BM25 / Coverage / Confidence: ${result.score.toFixed(3)} / ${percent(result.coverage)} / ${percent(result.confidence)}`,
      "",
      result.answer,
      "",
      "候选 / Candidates:",
      ...result.candidates.map((candidate) => `- ${candidate.faqId} · BM25 ${candidate.score.toFixed(3)} · ${percent(candidate.confidence)}`),
      "",
    );
  }

  lines.push(
    "## 口径 / Metric Definitions",
    "",
    "- **Accuracy**: 可答题命中期望 FAQ，或范围外题正确拒答，占总题数比例。",
    "- **Hallucination rate**: 已回答中，引用无效或回答文本不等于对应 FAQ 脱敏模板的比例。",
    "- **Uncited-answer rate**: 已回答中，没有有效 FAQ 引用的比例。",
    "- **Refusal correctness**: 范围外题中被拒答的比例。",
    "- **PII leak count**: 回答、内存日志和结果对象中检测到的受支持 PII 模式总数；输入以脱敏形式保存。",
    "",
    "**Accuracy**: correct FAQ hit for answerable cases, or correct refusal for out-of-scope cases, divided by all cases.",
    "**Hallucination rate**: answered cases with an invalid citation or text differing from the cited FAQ's masked template, divided by answered cases.",
    "**Uncited-answer rate**: answered cases without a valid FAQ citation, divided by answered cases.",
    "**Refusal correctness**: out-of-scope cases correctly refused, divided by out-of-scope cases.",
    "**PII leak count**: supported PII patterns found in answers, in-memory log entries, and serialized result objects; saved inputs are masked.",
    "",
  );

  return `${lines.join("\n")}\n`;
}

if (FAQS.length < 50) throw new Error(`Expected at least 50 FAQs, found ${FAQS.length}`);
if (EVAL_CASES.length !== 30) throw new Error(`Expected 30 evaluation cases, found ${EVAL_CASES.length}`);

const results = EVAL_CASES.map(evaluateCase);
const metrics = summarize(results);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  runtime: { node: process.version, platform: process.platform },
  dataset: {
    faqCount: FAQS.length,
    evalCaseCount: EVAL_CASES.length,
    allSynthetic: true,
    externalModelCalls: 0,
  },
  retrieval: RETRIEVAL_SETTINGS,
  metrics,
  results,
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(`${outputDirectory}eval-results.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(`${outputDirectory}eval-results.md`, renderMarkdown(report), "utf8");

console.log("AI Support offline evaluation / 离线评测");
console.log(`Questions / 题数: ${metrics.totalQuestions}`);
console.log(`Accuracy / 准确率: ${percent(metrics.accuracy)}`);
console.log(`Answerable accuracy / 可答题正确率: ${percent(metrics.answerableAccuracy)}`);
console.log(`Refusal correctness / 拒答正确率: ${percent(metrics.refusalCorrectness)}`);
console.log(`Hallucination rate / 无依据率: ${percent(metrics.hallucinationRate)}`);
console.log(`Uncited-answer rate / 无引用率: ${percent(metrics.uncitedAnswerRate)}`);
console.log(`PII leaks / PII 泄漏: ${metrics.piiLeakCount}`);
console.log(`Saved / 已保存: ${outputDirectory}eval-results.json`);
console.log(`Saved / 已保存: ${outputDirectory}eval-results.md`);

if (
  metrics.accuracy < 1
  || metrics.hallucinationRate > 0
  || metrics.uncitedAnswerRate > 0
  || metrics.refusalCorrectness < 1
  || metrics.piiLeakCount > 0
) {
  process.exitCode = 1;
}
