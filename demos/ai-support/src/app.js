import { CATEGORY_LABELS, FAQS, FAQ_BY_ID } from "./faqs.mjs";
import {
  answerQuestion,
  appendLog,
  containsPII,
  createLogEntry,
  RETRIEVAL_SETTINGS,
} from "./engine.mjs";

const COPY = {
  zh: {
    documentTitle: "星桥知识库客服原型 · StarBridge KB",
    skip: "跳到提问框",
    brandName: "星桥知识库",
    brandSub: "支持台 · 离线原型",
    offline: "离线 · 合成数据",
    languageLabel: "界面语言",
    clearLogs: "清空日志",
    indexKicker: "内置知识索引",
    indexTitle: "可追溯的支持范围",
    faqCountLabel: "条中英文合成 FAQ",
    coverageDetail: "9 个主题 · 本地 BM25 索引",
    railNote: "所有政策、限制和公司名称均为虚构。没有真实客户数据、密钥或外部服务。",
    deskKicker: "企业知识支持台",
    pageTitle: "每个答案，都有出处。",
    headingDescription: "用自然语言查询合成 FAQ。系统只回答检索到的模板，并在证据不足时拒答。",
    handoff: "一键转人工",
    localRetrieval: "本地检索",
    citedBadge: "引用",
    templateAnswer: "模板回答",
    refusalBadge: "拒答",
    lowConfidence: "低置信度",
    maskingBadge: "自动脱敏",
    guideAuthor: "原型向导",
    guideTitle: "先试一个问题",
    guideBody: "例如“如何下载发票？”回答会附带稳定的 FAQ 编号；问天气、订机票等范围外问题时，原型会拒答并建议转人工。",
    guideWarning: "这是离线 RAG-style prototype，不是生产客服，也不承诺零幻觉。",
    tryLabel: "试试",
    sampleInvoice: "如何下载发票？",
    sampleRateLimit: "API 返回 429 怎么办？",
    sampleOutOfScope: "今天上海天气怎么样？",
    questionLabel: "输入你的问题",
    questionPlaceholder: "输入问题，例如：如何开启双重验证？",
    send: "提问",
    piiNotice: "邮箱、手机号、身份证号会在日志和回答中脱敏",
    piiDetected: "检测到支持的 PII 类型，提交后将自动脱敏",
    enterHint: "Enter 发送 · Shift+Enter 换行",
    receiptKicker: "可检查的检索过程",
    receiptTitle: "检索回执",
    traceWaiting: "等待提问",
    traceAnswered: "已命中",
    traceRefused: "已拒答",
    traceEmpty: "提交问题后，这里会显示查询词、BM25 分数、置信度和候选条目。",
    bm25Score: "BM25 分数",
    confidence: "置信度",
    termCoverage: "词项覆盖",
    queryTerms: "查询词",
    selectedSource: "命中来源",
    viewSource: "查看 FAQ 原文",
    logKicker: "仅当前页面内存",
    logTitle: "会话日志",
    logDescription: "不写入磁盘、不发送网络、不做员工监控。刷新页面即清空。",
    logEmpty: "暂无日志。提交问题后会显示脱敏记录。",
    footerPrototype: "离线 RAG-style prototype · 非生产客服 · 不承诺零幻觉",
    footerFuture: "真实 LLM 后端仅作为后续替换项",
    syntheticFaq: "合成 FAQ 原文",
    close: "关闭",
    dialogFootnote: "该条目来自内置合成数据集，不代表真实公司政策。",
    you: "你",
    assistantAuthor: "知识库助手 · 模板",
    handoffAuthor: "模拟客服",
    handoffBody: "已创建模拟工单 {ticket}。本演示不会联系真实客服，也不会发送任何数据。",
    directHandoff: "用户主动请求转人工",
    handoffToast: "已创建模拟工单 {ticket}",
    logsCleared: "会话日志已清空",
    piiMasked: "已脱敏 {count} 项 PII",
    citationContext: "合成来源 · 点击查看原文",
    logQuery: "query",
    logHandoff: "handoff",
    thresholdNote: "回答阈值：BM25 ≥ {score}，覆盖 ≥ {coverage}，置信度 ≥ {confidence}",
  },
  en: {
    documentTitle: "StarBridge KB Support Prototype",
    skip: "Skip to the question box",
    brandName: "StarBridge KB",
    brandSub: "Support desk · offline prototype",
    offline: "Offline · synthetic data",
    languageLabel: "Interface language",
    clearLogs: "Clear logs",
    indexKicker: "Built-in knowledge index",
    indexTitle: "A traceable support scope",
    faqCountLabel: "bilingual synthetic FAQs",
    coverageDetail: "9 topics · local BM25 index",
    railNote: "Every policy, limit, and company name is fictional. No real customer data, keys, or external services are used.",
    deskKicker: "Enterprise knowledge support",
    pageTitle: "Every answer has a source.",
    headingDescription: "Ask the synthetic FAQ in natural language. The system composes answers from retrieved templates and refuses when evidence is weak.",
    handoff: "Human handoff",
    localRetrieval: "local retrieval",
    citedBadge: "Cited",
    templateAnswer: "template answer",
    refusalBadge: "Refusal",
    lowConfidence: "low confidence",
    maskingBadge: "PII masking",
    guideAuthor: "Prototype guide",
    guideTitle: "Start with a question",
    guideBody: "Try “How do I download an invoice?” Answers include a stable FAQ ID. Out-of-scope questions such as weather or flight booking are refused with a human-handoff option.",
    guideWarning: "This is an offline RAG-style prototype, not a production support system, and it does not promise zero hallucinations.",
    tryLabel: "Try",
    sampleInvoice: "How do I download an invoice?",
    sampleRateLimit: "What does API error 429 mean?",
    sampleOutOfScope: "What is the weather today?",
    questionLabel: "Enter your question",
    questionPlaceholder: "Ask a question, e.g. How do I enable two-factor authentication?",
    send: "Ask",
    piiNotice: "Emails, phone numbers, and national IDs are masked in answers and logs",
    piiDetected: "Supported PII detected; it will be masked before submission",
    enterHint: "Enter to send · Shift+Enter for a new line",
    receiptKicker: "An inspectable retrieval process",
    receiptTitle: "Retrieval receipt",
    traceWaiting: "Waiting",
    traceAnswered: "Matched",
    traceRefused: "Refused",
    traceEmpty: "After you ask a question, this panel shows query terms, BM25 score, confidence, and candidate entries.",
    bm25Score: "BM25 score",
    confidence: "Confidence",
    termCoverage: "Term coverage",
    queryTerms: "Query terms",
    selectedSource: "Selected source",
    viewSource: "View FAQ source",
    logKicker: "Current page memory only",
    logTitle: "Session log",
    logDescription: "Nothing is written to disk, sent over the network, or used for employee monitoring. Refresh clears it.",
    logEmpty: "No logs yet. Masked records appear after you ask a question.",
    footerPrototype: "Offline RAG-style prototype · not production support · no zero-hallucination promise",
    footerFuture: "A real LLM backend is only a future replacement option",
    syntheticFaq: "Synthetic FAQ source",
    close: "Close",
    dialogFootnote: "This entry comes from the built-in synthetic dataset and does not represent a real company policy.",
    you: "You",
    assistantAuthor: "KB assistant · template",
    handoffAuthor: "Mock support",
    handoffBody: "Mock ticket {ticket} created. This demo contacts no real agent and sends no data.",
    directHandoff: "User requested human handoff",
    handoffToast: "Mock ticket {ticket} created",
    logsCleared: "Session logs cleared",
    piiMasked: "{count} PII item(s) masked",
    citationContext: "Synthetic source · open original",
    logQuery: "query",
    logHandoff: "handoff",
    thresholdNote: "Answer gates: BM25 ≥ {score}, coverage ≥ {coverage}, confidence ≥ {confidence}",
  },
};

const SAMPLES = {
  zh: { invoice: "如何下载发票？", rateLimit: "API 返回 429 怎么办？", outOfScope: "今天上海天气怎么样？" },
  en: { invoice: "How do I download an invoice?", rateLimit: "What does API error 429 mean?", outOfScope: "What is the weather today?" },
};

const state = {
  lang: "zh",
  messages: [],
  logs: [],
  currentResult: null,
  ticketCounter: 0,
  toastTimer: null,
};

const elements = {
  chatLog: document.querySelector("#chatLog"),
  composer: document.querySelector("#composer"),
  question: document.querySelector("#question"),
  piiNotice: document.querySelector("#piiNotice"),
  categoryList: document.querySelector("#categoryList"),
  faqCount: document.querySelector("#faqCount"),
  traceState: document.querySelector("#traceState"),
  traceEmpty: document.querySelector("#traceEmpty"),
  traceContent: document.querySelector("#traceContent"),
  traceScore: document.querySelector("#traceScore"),
  traceConfidence: document.querySelector("#traceConfidence"),
  traceCoverage: document.querySelector("#traceCoverage"),
  confidenceBar: document.querySelector("#confidenceBar"),
  confidenceTrack: document.querySelector(".confidence-track"),
  traceTerms: document.querySelector("#traceTerms"),
  candidateList: document.querySelector("#candidateList"),
  sourceCard: document.querySelector("#sourceCard"),
  sourceId: document.querySelector("#sourceId"),
  sourceQuestion: document.querySelector("#sourceQuestion"),
  logList: document.querySelector("#logList"),
  logCount: document.querySelector("#logCount"),
  sourceDialog: document.querySelector("#sourceDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogAnswer: document.querySelector("#dialogAnswer"),
  toast: document.querySelector("#toast"),
};

function t(key, values = {}) {
  let text = COPY[state.lang][key] ?? COPY.zh[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function format(value, digits = 2) {
  return Number(value ?? 0).toFixed(digits);
}

function applyTranslations() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = t("documentTitle");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    const active = button.dataset.lang === state.lang;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  elements.faqCount.textContent = String(FAQS.length);
  renderCategories();
  renderChat();
  renderLogs();
  updatePiiNotice();
  if (state.currentResult) updateTrace(state.currentResult);
}

function renderCategories() {
  const counts = new Map();
  for (const faq of FAQS) counts.set(faq.category, (counts.get(faq.category) ?? 0) + 1);
  elements.categoryList.replaceChildren();

  for (const [category, labels] of Object.entries(CATEGORY_LABELS)) {
    const item = document.createElement("span");
    item.className = "category-item";
    const label = document.createElement("span");
    label.textContent = labels[state.lang];
    const count = document.createElement("span");
    count.className = "category-count";
    count.textContent = String(counts.get(category) ?? 0);
    item.append(label, count);
    elements.categoryList.append(item);
  }
}

function makeAvatar() {
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = state.lang === "zh" ? "星" : "KB";
  return avatar;
}

function createUserMessage(text) {
  const article = document.createElement("article");
  article.className = "message user-message";
  const body = document.createElement("div");
  body.className = "message-body";
  const author = document.createElement("p");
  author.className = "message-author";
  author.textContent = t("you");
  const message = document.createElement("p");
  message.className = "message-text";
  message.textContent = text;
  body.append(author, message);
  article.append(body);
  return article;
}

function createAssistantMessage(result) {
  const article = document.createElement("article");
  article.className = `message assistant-message${result.status === "refused" ? " refusal-message" : ""}`;
  const body = document.createElement("div");
  body.className = "message-body";

  const author = document.createElement("p");
  author.className = "message-author";
  author.textContent = t("assistantAuthor");
  const message = document.createElement("p");
  message.className = "message-text";
  message.textContent = result.status === "answered" ? result.answerText : result.answer;
  body.append(author, message);

  if (result.status === "answered") {
    const citationRow = document.createElement("div");
    citationRow.className = "citation-row";
    const citation = document.createElement("button");
    citation.type = "button";
    citation.className = "citation-button";
    citation.dataset.citation = result.selectedFaqId;
    citation.textContent = `[${result.selectedFaqId}]`;
    const context = document.createElement("span");
    context.className = "citation-context";
    context.textContent = t("citationContext");
    citationRow.append(citation, context);
    body.append(citationRow);
  } else {
    const handoff = document.createElement("button");
    handoff.type = "button";
    handoff.className = "inline-handoff";
    handoff.dataset.handoff = "true";
    handoff.textContent = t("handoff");
    body.append(handoff);
  }

  const piiCount = result.pii.reduce((sum, match) => sum + match.count, 0);
  if (piiCount > 0) {
    const footnote = document.createElement("p");
    footnote.className = "message-footnote";
    footnote.textContent = t("piiMasked", { count: piiCount });
    body.append(footnote);
  }

  article.append(makeAvatar(), body);
  return article;
}

function createHandoffMessage(ticketId) {
  const article = document.createElement("article");
  article.className = "message assistant-message handoff-message";
  const body = document.createElement("div");
  body.className = "message-body";
  const author = document.createElement("p");
  author.className = "message-author";
  author.textContent = t("handoffAuthor");
  const message = document.createElement("p");
  message.className = "message-text";
  message.textContent = t("handoffBody", { ticket: ticketId });
  body.append(author, message);
  article.append(makeAvatar(), body);
  return article;
}

function appendMessage(record) {
  let node;
  if (record.kind === "user") node = createUserMessage(record.text);
  if (record.kind === "assistant") node = createAssistantMessage(record.result);
  if (record.kind === "handoff") node = createHandoffMessage(record.ticketId);
  if (!node) return;
  elements.chatLog.append(node);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function renderChat() {
  elements.chatLog.querySelectorAll(".message").forEach((node) => node.remove());
  for (const record of state.messages) appendMessage(record);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function updateTrace(result) {
  const top = result.candidates[0];
  elements.traceEmpty.hidden = true;
  elements.traceContent.hidden = false;
  elements.traceState.textContent = t(result.status === "answered" ? "traceAnswered" : "traceRefused");
  elements.traceState.classList.toggle("is-answered", result.status === "answered");
  elements.traceState.classList.toggle("is-refused", result.status === "refused");
  elements.traceScore.textContent = format(result.score);
  elements.traceConfidence.textContent = `${Math.round(result.confidence * 100)}%`;
  elements.traceCoverage.textContent = `${Math.round((top?.coverage ?? 0) * 100)}%`;
  elements.confidenceBar.style.width = `${Math.round(result.confidence * 100)}%`;
  elements.confidenceTrack.classList.toggle("is-low", result.status === "refused");
  elements.traceTerms.textContent = result.terms.length ? result.terms.join(" · ") : "—";
  elements.traceTerms.title = t("thresholdNote", {
    score: RETRIEVAL_SETTINGS.minScore,
    coverage: RETRIEVAL_SETTINGS.minCoverage,
    confidence: RETRIEVAL_SETTINGS.minConfidence,
  });

  elements.candidateList.replaceChildren();
  result.candidates.forEach((candidate, index) => {
    const item = document.createElement("li");
    item.className = `candidate-item${index === 0 ? " is-top" : ""}`;
    const id = document.createElement("span");
    id.className = "candidate-id";
    id.textContent = candidate.faqId;
    const score = document.createElement("span");
    score.className = "candidate-score";
    score.textContent = `BM25 ${format(candidate.score)}`;
    const question = document.createElement("span");
    question.className = "candidate-question";
    question.textContent = candidate.question;
    item.append(id, score, question);
    elements.candidateList.append(item);
  });

  const source = result.selectedFaqId ? FAQ_BY_ID.get(result.selectedFaqId) : null;
  elements.sourceCard.hidden = !source;
  if (source) {
    elements.sourceId.textContent = source.id;
    elements.sourceQuestion.textContent = source[state.lang].question;
  }
}

function logDetail(entry) {
  if (entry.type === "handoff") return entry.ticketId;
  return `${entry.query} · ${entry.status}${entry.faqId ? ` · ${entry.faqId}` : ""}`;
}

function addLog(type, payload) {
  state.logs = appendLog(state.logs, createLogEntry(type, payload));
  renderLogs();
}

function renderLogs() {
  elements.logCount.textContent = String(state.logs.length);
  elements.logList.replaceChildren();
  if (state.logs.length === 0) {
    const empty = document.createElement("li");
    empty.className = "log-empty";
    empty.textContent = t("logEmpty");
    elements.logList.append(empty);
    return;
  }

  for (const entry of state.logs) {
    const item = document.createElement("li");
    item.className = "log-entry";
    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const type = document.createElement("strong");
    type.textContent = t(entry.type === "handoff" ? "logHandoff" : "logQuery");
    const detail = document.createElement("span");
    detail.textContent = logDetail(entry);
    item.append(time, type, detail);
    elements.logList.append(item);
  }
  elements.logList.scrollTop = elements.logList.scrollHeight;
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 3200);
}

function updatePiiNotice() {
  const detected = containsPII(elements.question.value);
  elements.piiNotice.classList.toggle("has-pii", detected);
  elements.piiNotice.textContent = t(detected ? "piiDetected" : "piiNotice");
}

function resizeComposer() {
  elements.question.style.height = "auto";
  elements.question.style.height = `${Math.min(elements.question.scrollHeight, 130)}px`;
}

function submitQuestion(rawQuestion) {
  const question = rawQuestion.trim();
  if (!question) return;

  const result = answerQuestion(question, { lang: state.lang });
  state.currentResult = result;
  state.messages.push(
    { kind: "user", text: result.query },
    { kind: "assistant", result },
  );
  appendMessage({ kind: "user", text: result.query });
  appendMessage({ kind: "assistant", result });
  updateTrace(result);
  addLog("query", {
    query: result.query,
    status: result.status,
    faqId: result.selectedFaqId,
    score: result.score,
    confidence: result.confidence,
    piiTypes: result.pii.map((match) => match.type),
  });

  elements.question.value = "";
  resizeComposer();
  updatePiiNotice();
  elements.question.focus();
}

function createHandoff() {
  state.ticketCounter += 1;
  const ticketId = `MOCK-${String(state.ticketCounter).padStart(4, "0")}`;
  const record = { kind: "handoff", ticketId };
  state.messages.push(record);
  appendMessage(record);
  addLog("handoff", {
    ticketId,
    query: state.currentResult?.query ?? t("directHandoff"),
  });
  showToast(t("handoffToast", { ticket: ticketId }));
}

function clearLogs() {
  state.logs = [];
  renderLogs();
  showToast(t("logsCleared"));
}

function openSource(faqId) {
  const faq = FAQ_BY_ID.get(faqId);
  if (!faq) return;
  elements.dialogTitle.textContent = `${faq.id} · ${faq[state.lang].question}`;
  elements.dialogAnswer.textContent = faq[state.lang].answer;
  if (!elements.sourceDialog.open) elements.sourceDialog.showModal();
}

function changeLanguage(lang) {
  if (lang === state.lang) return;
  state.lang = lang;
  state.messages = state.messages.map((record) => {
    if (record.kind !== "assistant") return record;
    return { ...record, result: answerQuestion(record.result.query, { lang }) };
  });
  if (state.currentResult) {
    state.currentResult = answerQuestion(state.currentResult.query, { lang });
  }
  applyTranslations();
}

elements.composer.addEventListener("submit", (event) => {
  event.preventDefault();
  submitQuestion(elements.question.value);
});

elements.question.addEventListener("input", () => {
  resizeComposer();
  updatePiiNotice();
});

elements.question.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    elements.composer.requestSubmit();
  }
});

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", () => {
    submitQuestion(SAMPLES[state.lang][button.dataset.sample]);
  });
});

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => changeLanguage(button.dataset.lang));
});

document.querySelector("#handoffButton").addEventListener("click", createHandoff);
document.querySelector("#clearLogs").addEventListener("click", clearLogs);
document.querySelector("#clearLogsInline").addEventListener("click", clearLogs);
document.querySelector("#openSource").addEventListener("click", () => {
  if (state.currentResult?.selectedFaqId) openSource(state.currentResult.selectedFaqId);
});
document.querySelector("#closeSource").addEventListener("click", () => elements.sourceDialog.close());

elements.chatLog.addEventListener("click", (event) => {
  const citation = event.target.closest("[data-citation]");
  if (citation) openSource(citation.dataset.citation);
  if (event.target.closest("[data-handoff]")) createHandoff();
});

elements.sourceDialog.addEventListener("click", (event) => {
  if (event.target !== elements.sourceDialog) return;
  const bounds = elements.sourceDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) elements.sourceDialog.close();
});

// Read-only validation hook. It exposes only already-masked in-memory state.
window.__AI_SUPPORT_DEMO__ = Object.freeze({
  getSnapshot: () => JSON.parse(JSON.stringify({
    lang: state.lang,
    messages: state.messages,
    logs: state.logs,
    currentResult: state.currentResult,
    settings: RETRIEVAL_SETTINGS,
  })),
});

applyTranslations();
