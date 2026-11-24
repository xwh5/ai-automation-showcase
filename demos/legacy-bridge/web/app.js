import { reconcileCsv, renderExceptionsCsv, renderMarkdown } from "./reconcile.js";

(() => {
  "use strict";

  const translations = {
    zh: {
      skip: "跳到对账工作台",
      brandSub: "公司资产底座 · 第 07 天 · 遗留系统打通",
      safetyChip: "默认预演 · 生产写入 0",
      kicker: "CSV → 暂存 → 对账 → 异常 → 日报",
      heroTitle: "让遗留账本，<br>进入可审计的今天。",
      heroEn: "让遗留账本，进入可审计的一天。",
      heroCopy: "上传合成订单与回款，查看匹配、异常和每日汇总。API 模式提供请求标识、规则版本、输入哈希与审计；浏览器预览明确标注无服务端审计或持久化。",
      boundaryTitle: "安全边界",
      boundaryCopy: "不连接 ERP、银行或生产库；不自动记账、不付款。即使关闭预演，本 demo 也只生成计划。",
      boardTitle: "对账凭证簿",
      ordersNode: "订单台账",
      paymentsNode: "银行回款",
      stagingNode: "SQLite 本地暂存",
      stagingNote: "幂等 · 哈希 · 审计",
      outputNode: "异常队列 + 日报",
      outputNote: "人工复核，不自动入账",
      workspaceTitle: "对账工作台",
      workspaceCopy: "静态页可部署到 Pages；API 在本地运行。数据仅使用合成 CSV。",
      apiLabel: "API 地址",
      apiPlaceholder: "http://127.0.0.1:5087",
      checkConnection: "检查连接",
      loadSample: "载入合成样本",
      connectionIdle: "输入 API 地址，或检查本地服务。",
      ordersTitle: "上传订单 CSV",
      ordersHelp: "order_id, company_code, order_date, currency, amount…",
      paymentsTitle: "上传回款 CSV",
      paymentsHelp: "payment_id, company_code, order_id, payment_date, currency, amount…",
      chooseFile: "选择文件",
      dryRunTitle: "预演模式（默认）",
      dryRunHelp: "API 写本地 SQLite；预览仅用浏览器内存。不尝试生产写入。",
      reconcile: "运行对账",
      resultsEmpty: "载入样本或上传两份 CSV 后运行对账。结果、异常与日报会显示在这里。",
      tabExceptions: "异常队列",
      tabMatches: "匹配结果",
      tabReport: "日报",
      tabAudit: "审计",
      filterType: "异常类型",
      allTypes: "全部类型",
      search: "搜索",
      searchPlaceholder: "订单 / 回款 / 消息",
      downloadCsv: "下载 CSV",
      reportNote: "日报按订单日期与币种汇总；生产写入数始终为 0。",
      downloadMarkdown: "下载 Markdown",
      colType: "类型",
      colSeverity: "级别",
      severityError: "错误",
      severityWarning: "警告",
      colCompany: "公司",
      colOrder: "订单",
      colPayment: "回款",
      colRow: "行号",
      colMessage: "说明",
      colDate: "日期",
      colStatus: "状态",
      colOrderAmount: "订单金额",
      colPaidAmount: "已回款",
      colDifference: "差额",
      historyTitle: "最近运行",
      refresh: "刷新",
      historyEmpty: "还没有运行记录。",
      footerTitle: "全合成数据 · 本地优先 · 默认预演",
      footerCopy: "不连接 ERP、银行或生产数据库；不自动记账、不付款。任何未来桥接都必须单独评估、授权和审计。",
      footerRule: "规则版本固定，结果可复现。",
      connected: "已连接：规则 {rule}，生产写入固定为 0。",
      connectionFailed: "无法连接 API。请确认本地服务已启动，且地址使用 http://127.0.0.1:5087。",
      loadingSample: "正在载入 100 条订单与 70 条回款…",
      sampleLoaded: "已载入合成样本。可以运行对账。",
      sampleFailed: "样本载入失败。请检查 API 连接，或手动选择 fixtures 中的两份 CSV。",
      rows: "{count} 行数据",
      running: "正在对账…",
      runComplete: "对账完成：{matched} 笔匹配，{exceptions} 项异常。",
      replayed: "幂等复用",
      request: "请求",
      run: "运行",
      rule: "规则",
      hash: "输入哈希",
      createdAt: "创建时间",
      metricOrders: "订单行",
      metricPayments: "回款行",
      metricMatched: "完全匹配",
      metricExceptions: "异常",
      metricOutstanding: "未回款",
      metricWrites: "生产写入",
      matched: "已匹配",
      unpaid: "未回款",
      amountMismatch: "金额不符",
      currencyMismatch: "币种不符",
      duplicateOrder: "重复订单",
      missingField: "缺字段",
      invalidField: "字段无效",
      paymentWithoutOrder: "无来源回款",
      duplicatePayment: "重复回款",
      csvStructure: "CSV 结构异常",
      noExceptions: "当前筛选条件下没有异常。",
      noMatches: "没有匹配结果。",
      noAudit: "没有审计事件。",
      auditOutcomeCreated: "已创建",
      auditOutcomeReplayed: "已复用",
      dryRun: "预演",
      simulation: "仅模拟",
      exportHint: "下载使用 API 地址；Pages 与本地 API 之间需要可访问且允许 CORS。",
      invalidApi: "API 地址无效。请输入以 http:// 或 https:// 开头的地址。",
      chooseBoth: "请先选择订单和回款两份 CSV。",
      failedRequest: "请求失败（{status}）。{detail}",
      networkError: "网络请求失败。请检查 API 地址、CORS 和服务状态。",
      loadRunFailed: "运行记录加载失败。",
      noRuns: "还没有运行记录。",
      previewMode: "浏览器预览模式",
      previewBannerZh: "浏览器预览模式 · 无服务端审计/持久化",
      previewFallback: "API 不可达，已切换到浏览器预览；结果不会写入服务器。",
      previewRequest: "未签发服务端请求",
      previewHistory: "浏览器预览不持久化运行历史；无服务端审计。",
      previewNoAudit: "浏览器预览模式：无服务端审计或持久化。",
      previewLoaded: "已从相对路径 ../fixtures/ 载入合成样本。",
      previewComplete: "浏览器预览完成：{matched} 笔匹配，{exceptions} 项异常；无服务端审计/持久化。",
      previewFixtureFailed: "浏览器预览样本载入失败。请确认静态服务器同时发布 web/ 与 fixtures/。"
    },
    en: {
      skip: "Skip to reconciliation workspace",
      brandSub: "Company asset foundation · Day 07 · Legacy systems",
      safetyChip: "Dry-run by default · 0 production writes",
      kicker: "CSV → STAGING → MATCH → EXCEPTIONS → REPORT",
      heroTitle: "Bring legacy ledgers<br>into an auditable day.",
      heroEn: "让遗留账本，进入可审计的一天。",
      heroCopy: "Upload synthetic orders and payments to inspect matches, exceptions, and daily totals. API mode provides request ids, rule versions, input hashes, and audit; browser preview clearly states that it has no server audit or persistence.",
      boundaryTitle: "Safety boundary",
      boundaryCopy: "No ERP, bank, or production database connection. No automatic posting or payment. Turning off dry-run still produces a plan only.",
      boardTitle: "Reconciliation ledger",
      ordersNode: "Order ledger",
      paymentsNode: "Bank payments",
      stagingNode: "SQLite local staging",
      stagingNote: "Idempotent · Hashed · Audited",
      outputNode: "Exceptions + daily report",
      outputNote: "Human review, no auto-posting",
      workspaceTitle: "Reconciliation workspace",
      workspaceCopy: "Host this static page on Pages; run the API locally. Use synthetic CSV data only.",
      apiLabel: "API address",
      apiPlaceholder: "http://127.0.0.1:5087",
      checkConnection: "Check connection",
      loadSample: "Load synthetic sample",
      connectionIdle: "Enter the API address or check the local service.",
      ordersTitle: "Upload orders CSV",
      ordersHelp: "order_id, company_code, order_date, currency, amount…",
      paymentsTitle: "Upload payments CSV",
      paymentsHelp: "payment_id, company_code, order_id, payment_date, currency, amount…",
      chooseFile: "Choose file",
      dryRunTitle: "Dry-run mode (default)",
      dryRunHelp: "API mode writes local SQLite; preview uses browser memory only. No production write is attempted.",
      reconcile: "Run reconciliation",
      resultsEmpty: "Load the sample or upload both CSV files. Results, exceptions, and the daily report appear here.",
      tabExceptions: "Exceptions",
      tabMatches: "Matches",
      tabReport: "Daily report",
      tabAudit: "Audit",
      filterType: "Exception type",
      allTypes: "All types",
      search: "Search",
      searchPlaceholder: "Order / payment / message",
      downloadCsv: "Download CSV",
      reportNote: "The report groups by order date and currency; production writes stay at zero.",
      downloadMarkdown: "Download Markdown",
      colType: "Type",
      colSeverity: "Severity",
      severityError: "Error",
      severityWarning: "Warning",
      colCompany: "Company",
      colOrder: "Order",
      colPayment: "Payment",
      colRow: "Row",
      colMessage: "Message",
      colDate: "Date",
      colStatus: "Status",
      colOrderAmount: "Order amount",
      colPaidAmount: "Paid",
      colDifference: "Difference",
      historyTitle: "Recent runs",
      refresh: "Refresh",
      historyEmpty: "No runs yet.",
      footerTitle: "Synthetic data · Local first · Dry-run by default",
      footerCopy: "No ERP, bank, or production database connection. No automatic posting or payment. Any future bridge needs separate assessment, authorization, and audit.",
      footerRule: "A fixed rule version makes results reproducible.",
      connected: "Connected: rule {rule}; production writes are fixed at 0.",
      connectionFailed: "Could not connect. Start the local API and check http://127.0.0.1:5087.",
      loadingSample: "Loading 100 orders and 70 payments…",
      sampleLoaded: "Synthetic sample loaded. Ready to reconcile.",
      sampleFailed: "Sample loading failed. Check the API connection or choose both CSV files from fixtures.",
      rows: "{count} data rows",
      running: "Reconciling…",
      runComplete: "Complete: {matched} matched orders, {exceptions} exceptions.",
      replayed: "Idempotent replay",
      request: "Request",
      run: "Run",
      rule: "Rule",
      hash: "Input hash",
      createdAt: "Created",
      metricOrders: "Order rows",
      metricPayments: "Payment rows",
      metricMatched: "Fully matched",
      metricExceptions: "Exceptions",
      metricOutstanding: "Outstanding",
      metricWrites: "Production writes",
      matched: "Matched",
      unpaid: "Unpaid",
      amountMismatch: "Amount mismatch",
      currencyMismatch: "Currency mismatch",
      duplicateOrder: "Duplicate order",
      missingField: "Missing field",
      invalidField: "Invalid field",
      paymentWithoutOrder: "Payment without order",
      duplicatePayment: "Duplicate payment",
      csvStructure: "CSV structure",
      noExceptions: "No exceptions match the current filters.",
      noMatches: "No match results.",
      noAudit: "No audit events.",
      auditOutcomeCreated: "Created",
      auditOutcomeReplayed: "Replayed",
      dryRun: "Dry-run",
      simulation: "Simulation only",
      exportHint: "Downloads use the API address. Pages and the local API must be reachable with CORS enabled.",
      invalidApi: "Invalid API address. Use a URL beginning with http:// or https://.",
      chooseBoth: "Choose both orders and payments CSV files first.",
      failedRequest: "Request failed ({status}). {detail}",
      networkError: "Network request failed. Check the API address, CORS, and service status.",
      loadRunFailed: "Could not load the run.",
      noRuns: "No runs yet.",
      previewMode: "Browser preview mode",
      previewBannerZh: "浏览器预览模式 · 无服务端审计/持久化",
      previewFallback: "API unreachable. Browser preview is active; results are not written to a server.",
      previewRequest: "No server request issued",
      previewHistory: "Browser preview does not persist run history; there is no server audit.",
      previewNoAudit: "Browser preview mode: no server audit or persistence.",
      previewLoaded: "Synthetic sample loaded from the relative ../fixtures/ path.",
      previewComplete: "Browser preview complete: {matched} matched, {exceptions} exceptions; no server audit/persistence.",
      previewFixtureFailed: "Could not load the browser preview sample. Publish web/ and fixtures/ together on the static server."
    }
  };

  const exceptionLabels = {
    DUPLICATE_ORDER: ["duplicateOrder", "重复订单"],
    AMOUNT_MISMATCH: ["amountMismatch", "金额不符"],
    MISSING_FIELD: ["missingField", "缺字段"],
    INVALID_FIELD: ["invalidField", "字段无效"],
    UNPAID_ORDER: ["unpaidOrder", "未回款"],
    PAYMENT_WITHOUT_ORDER: ["paymentWithoutOrder", "无来源回款"],
    CURRENCY_MISMATCH: ["currencyMismatch", "币种不符"],
    DUPLICATE_PAYMENT: ["duplicatePayment", "重复回款"],
    CSV_STRUCTURE: ["csvStructure", "CSV 结构异常"]
  };

  const statusLabels = {
    matched: "matched",
    unpaid: "unpaid",
    amount_mismatch: "amountMismatch",
    currency_mismatch: "currencyMismatch"
  };

  const elements = Object.fromEntries([
    "apiBase", "checkConnection", "loadSample", "connectionStatus", "ordersFile", "paymentsFile",
    "ordersDrop", "paymentsDrop", "ordersName", "ordersMeta", "paymentsName", "paymentsMeta",
    "dryRun", "nextRequestId", "reconcile", "resultsEmpty", "resultsContent", "runMeta", "metrics",
    "exceptionType", "exceptionSearch", "exceptionsBody", "matchesBody", "reportContent", "auditList",
    "downloadExceptions", "downloadReport", "historyList", "refreshRuns", "langZh", "langEn", "modeBanner"
  ].map(id => [id, document.getElementById(id)]));

  let language = localStorage.getItem("legacy-bridge-language") === "en" ? "en" : "zh";
  let ordersFile = null;
  let paymentsFile = null;
  let currentRun = null;
  let currentRequestId = null;
  let mode = "api";
  let modeInitialized = false;
  let previewDownloads = [];

  function t(key, values = {}) {
    let text = translations[language][key] ?? translations.en[key] ?? key;
    for (const [name, value] of Object.entries(values)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.body.lang = document.documentElement.lang;
    localStorage.setItem("legacy-bridge-language", language);
    elements.langZh.setAttribute("aria-pressed", String(language === "zh"));
    elements.langEn.setAttribute("aria-pressed", String(language === "en"));
    document.querySelectorAll("[data-i18n]").forEach(node => {
      const key = node.dataset.i18n;
      if (key === "heroTitle") {
        node.innerHTML = t(key);
      } else {
        node.textContent = t(key);
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(node => {
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });
    if (currentRun) {
      renderRun(currentRun);
      void loadReport(currentRun.run.run.runId);
    }
    if (modeInitialized) void loadRuns();
  }

  function normalizeApiBase() {
    const raw = elements.apiBase.value.trim();
    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error(t("invalidApi"));
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error(t("invalidApi"));
    }
    const normalized = parsed.href.replace(/\/$/, "");
    elements.apiBase.value = normalized;
    localStorage.setItem("legacy-bridge-api", normalized);
    return normalized;
  }

  async function apiFetch(path, options = {}) {
    let base;
    try {
      base = normalizeApiBase();
    } catch (error) {
      error.code = "network";
      throw error;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(base + path, { ...options, signal: controller.signal });
      if (!response.ok) {
        const raw = await response.text();
        let detail = raw;
        try {
          const problem = JSON.parse(raw);
          detail = problem.detail || problem.title || raw;
        } catch {
          // Keep the plain-text response as the error detail.
        }
        const error = new Error(t("failedRequest", { status: response.status, detail }));
        error.code = "http";
        throw error;
      }
      return response;
    } catch (error) {
      if (error.name === "AbortError" || error instanceof TypeError) {
        const networkError = new Error(t("networkError"));
        networkError.code = "network";
        throw networkError;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  function setConnectionStatus(message, kind = "") {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = `status-line ${kind}`.trim();
  }

  async function probeApi() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    try {
      const base = normalizeApiBase();
      const response = await fetch(`${base}/api/health`, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function initializeMode() {
    modeInitialized = true;
    const base = normalizeApiBase();
    const loopbackApi = /^https?:\/\/(127\.0\.0\.1|localhost)(:|$)/i.test(base);
    const localPage = ["localhost", "127.0.0.1"].includes(location.hostname);
    if (loopbackApi && !localPage) {
      await enterBrowserPreview(true);
      return;
    }
    const health = await probeApi();
    if (health) {
      mode = "api";
      elements.modeBanner.hidden = true;
      setConnectionStatus(t("connected", { rule: health.ruleVersion }), "ok");
      await loadRuns();
      return;
    }
    await enterBrowserPreview(true);
  }

  function setModeBanner(visible) {
    elements.modeBanner.hidden = !visible;
  }

  async function enterBrowserPreview(autoRun = true) {
    mode = "preview";
    setModeBanner(true);
    elements.nextRequestId.textContent = t("previewRequest");
    setConnectionStatus(t("previewFallback"), "ok");
    renderPreviewHistory();
    if (autoRun) await loadPreviewSampleAndRun();
  }

  function clearPreviewResults() {
    currentRun = null;
    currentRequestId = null;
    revokePreviewDownloads();
    elements.resultsEmpty.hidden = false;
    elements.resultsContent.hidden = true;
    elements.reportContent.textContent = "";
    elements.runMeta.replaceChildren();
    elements.metrics.replaceChildren();
    elements.exceptionsBody.replaceChildren();
    elements.matchesBody.replaceChildren();
    elements.auditList.replaceChildren();
  }

  async function checkConnection() {
    elements.checkConnection.disabled = true;
    try {
      const health = await probeApi();
      if (!health) {
        await enterBrowserPreview(true);
        return false;
      }
      const wasPreview = mode === "preview";
      mode = "api";
      setModeBanner(false);
      if (wasPreview) clearPreviewResults();
      elements.nextRequestId.textContent = `${t("request")}: ${newRequestId()}`;
      setConnectionStatus(t("connected", { rule: health.ruleVersion }), "ok");
      await loadRuns();
      return true;
    } finally {
      elements.checkConnection.disabled = false;
    }
  }

  async function loadPreviewSampleAndRun() {
    elements.loadSample.disabled = true;
    setConnectionStatus(t("loadingSample"));
    try {
      const [ordersResponse, paymentsResponse] = await Promise.all([
        fetch(new URL("../fixtures/orders.csv", import.meta.url), { cache: "no-store" }),
        fetch(new URL("../fixtures/payments.csv", import.meta.url), { cache: "no-store" })
      ]);
      if (!ordersResponse.ok || !paymentsResponse.ok) {
        throw new Error(`${ordersResponse.status}/${paymentsResponse.status}`);
      }
      const [ordersBlob, paymentsBlob] = await Promise.all([ordersResponse.blob(), paymentsResponse.blob()]);
      setFile("orders", new File([ordersBlob], "orders.csv", { type: "text/csv" }));
      setFile("payments", new File([paymentsBlob], "payments.csv", { type: "text/csv" }));
      setConnectionStatus(t("previewLoaded"), "ok");
      await runBrowserPreview();
    } catch (error) {
      setConnectionStatus(`${t("previewFixtureFailed")} ${error.message}`, "error");
    } finally {
      elements.loadSample.disabled = false;
    }
  }

  async function loadSample() {
    if (mode === "preview") {
      await loadPreviewSampleAndRun();
      return;
    }
    elements.loadSample.disabled = true;
    setConnectionStatus(t("loadingSample"));
    try {
      const [ordersResponse, paymentsResponse] = await Promise.all([
        apiFetch("/api/sample/orders.csv"),
        apiFetch("/api/sample/payments.csv")
      ]);
      const [ordersBlob, paymentsBlob] = await Promise.all([ordersResponse.blob(), paymentsResponse.blob()]);
      setFile("orders", new File([ordersBlob], "orders.csv", { type: "text/csv" }));
      setFile("payments", new File([paymentsBlob], "payments.csv", { type: "text/csv" }));
      setConnectionStatus(t("sampleLoaded"), "ok");
    } catch (error) {
      if (error.code === "network") {
        await enterBrowserPreview(true);
      } else {
        setConnectionStatus(`${t("sampleFailed")} ${error.message}`, "error");
      }
    } finally {
      elements.loadSample.disabled = false;
    }
  }

  async function runBrowserPreview() {
    if (!ordersFile || !paymentsFile) {
      setConnectionStatus(t("chooseBoth"), "error");
      return;
    }
    elements.reconcile.disabled = true;
    elements.reconcile.textContent = t("running");
    setConnectionStatus(t("running"));
    try {
      const [ordersCsv, paymentsCsv] = await Promise.all([ordersFile.text(), paymentsFile.text()]);
      const result = await reconcileCsv(ordersCsv, paymentsCsv, elements.dryRun.checked);
      currentRun = {
        requestId: t("previewRequest"),
        replayed: false,
        preview: true,
        run: { run: result, auditEvents: [] }
      };
      renderRun(currentRun);
      await loadReport(result.runId);
      setConnectionStatus(t("previewComplete", {
        matched: result.summary.matchedOrders,
        exceptions: result.summary.exceptionCount
      }), "ok");
    } catch (error) {
      setConnectionStatus(error.message, "error");
    } finally {
      elements.reconcile.disabled = !ordersFile || !paymentsFile;
      elements.reconcile.textContent = t("reconcile");
    }
  }

  function setFile(kind, file) {
    if (!file) return;
    if (kind === "orders") ordersFile = file;
    else paymentsFile = file;
    const prefix = kind;
    const drop = elements[`${prefix}Drop`];
    drop.classList.add("has-file");
    elements[`${prefix}Name`].textContent = file.name;
    elements[`${prefix}Meta`].textContent = `${formatBytes(file.size)} · ${t("rows", { count: "…" })}`;
    file.text().then(text => {
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      const rows = Math.max(0, lines.length - 1);
      elements[`${prefix}Meta`].textContent = `${formatBytes(file.size)} · ${t("rows", { count: rows })}`;
    });
    updateRunButton();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  }

  function updateRunButton() {
    elements.reconcile.disabled = !ordersFile || !paymentsFile;
  }

  function newRequestId() {
    const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `web-${random}`;
  }

  async function reconcile() {
    if (mode === "preview") {
      await runBrowserPreview();
      return;
    }
    if (!ordersFile || !paymentsFile) {
      setConnectionStatus(t("chooseBoth"), "error");
      return;
    }
    const requestId = newRequestId();
    currentRequestId = requestId;
    elements.nextRequestId.textContent = `${t("request")}: ${requestId}`;
    const form = new FormData();
    form.append("orders", ordersFile, ordersFile.name);
    form.append("payments", paymentsFile, paymentsFile.name);
    form.append("dryRun", String(elements.dryRun.checked));
    form.append("requestId", requestId);
    elements.reconcile.disabled = true;
    elements.reconcile.textContent = t("running");
    setConnectionStatus(t("running"));
    try {
      const response = await apiFetch("/api/reconcile", {
        method: "POST",
        headers: { "X-Request-Id": requestId },
        body: form
      });
      const payload = await response.json();
      currentRun = payload;
      renderRun(payload);
      await loadReport(payload.run.run.runId);
      setConnectionStatus(t("runComplete", {
        matched: payload.run.run.summary.matchedOrders,
        exceptions: payload.run.run.summary.exceptionCount
      }), "ok");
      await loadRuns();
    } catch (error) {
      if (error.code === "network") {
        await enterBrowserPreview(true);
      } else {
        setConnectionStatus(error.message, "error");
      }
    } finally {
      elements.reconcile.disabled = !ordersFile || !paymentsFile;
      elements.reconcile.textContent = t("reconcile");
    }
  }

  function renderRun(payload) {
    const view = payload.run;
    const run = view.run;
    const isPreview = mode === "preview" || payload.preview === true;
    elements.resultsEmpty.hidden = true;
    elements.resultsContent.hidden = false;
    elements.runMeta.replaceChildren();
    const meta = [
      [t("run"), run.runId],
      [t("request"), isPreview ? t("previewRequest") : payload.requestId],
      [t("rule"), run.ruleVersion],
      [t("hash"), run.inputHash],
      [t("createdAt"), new Date(run.createdAtUtc).toLocaleString(language === "zh" ? "zh-CN" : "en-US")]
    ];
    for (const [label, value] of meta) {
      const span = document.createElement("span");
      span.textContent = `${label}: ${value}`;
      elements.runMeta.append(span);
    }
    if (isPreview) {
      const badge = document.createElement("span");
      badge.className = "replay-badge";
      badge.textContent = t("previewMode");
      elements.runMeta.append(badge);
    } else if (payload.replayed) {
      const badge = document.createElement("span");
      badge.className = "replay-badge";
      badge.textContent = t("replayed");
      elements.runMeta.append(badge);
    }

    const outstanding = (run.summary.currencyTotals || []).reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0);
    const metrics = [
      [t("metricOrders"), run.summary.totalOrderRows, ""],
      [t("metricPayments"), run.summary.totalPaymentRows, ""],
      [t("metricMatched"), run.summary.matchedOrders, "safe"],
      [t("metricExceptions"), run.summary.exceptionCount, run.summary.exceptionCount ? "warn" : "safe"],
      [t("metricOutstanding"), formatMoney(outstanding), outstanding ? "danger" : "safe"],
      [t("metricWrites"), run.execution.productionWrites, "safe"]
    ];
    elements.metrics.replaceChildren();
    for (const [label, value, tone] of metrics) {
      const cellElement = document.createElement("div");
      cellElement.className = `metric ${tone}`.trim();
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = String(value);
      cellElement.append(term, description);
      elements.metrics.append(cellElement);
    }

    populateExceptionTypes(run.exceptions || []);
    renderExceptions(run.exceptions || []);
    renderMatches(run.matches || []);
    renderAudit(view.auditEvents || [], isPreview);
    configureDownloads(run, isPreview);
  }

  function apiUrl(runId, file, lang) {
    try {
      const base = normalizeApiBase();
      return `${base}/api/runs/${encodeURIComponent(runId)}/${file}${lang ? `?lang=${lang}` : ""}`;
    } catch {
      return "#";
    }
  }

  function revokePreviewDownloads() {
    for (const url of previewDownloads) URL.revokeObjectURL(url);
    previewDownloads = [];
  }

  function configureDownloads(run, isPreview) {
    revokePreviewDownloads();
    if (!isPreview) {
      elements.downloadExceptions.removeAttribute("download");
      elements.downloadReport.removeAttribute("download");
      elements.downloadExceptions.href = apiUrl(run.runId, "exceptions.csv");
      elements.downloadReport.href = apiUrl(run.runId, "report.md", language);
      return;
    }
    const csv = "\uFEFF" + renderExceptionsCsv(run);
    const report = renderMarkdown(run, language);
    const csvUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const reportUrl = URL.createObjectURL(new Blob([report], { type: "text/markdown;charset=utf-8" }));
    previewDownloads = [csvUrl, reportUrl];
    elements.downloadExceptions.href = csvUrl;
    elements.downloadExceptions.download = `${run.runId}-exceptions.csv`;
    elements.downloadReport.href = reportUrl;
    elements.downloadReport.download = `${run.runId}-report.md`;
  }

  function formatMoney(value, currency = "") {
    const number = Number(value || 0);
    return `${currency ? currency + " " : ""}${new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number)}`;
  }

  function populateExceptionTypes(exceptions) {
    const selected = elements.exceptionType.value;
    const types = [...new Set(exceptions.map(item => item.type))].sort();
    elements.exceptionType.replaceChildren();
    const all = document.createElement("option");
    all.value = "";
    all.textContent = t("allTypes");
    elements.exceptionType.append(all);
    for (const type of types) {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = `${type} · ${exceptionTypeLabel(type)}`;
      elements.exceptionType.append(option);
    }
    elements.exceptionType.value = types.includes(selected) ? selected : "";
  }

  function exceptionTypeLabel(type) {
    const entry = exceptionLabels[type];
    return entry ? t(entry[0]) : type;
  }

  function renderExceptions(exceptions) {
    const typeFilter = elements.exceptionType.value;
    const search = elements.exceptionSearch.value.trim().toLowerCase();
    const filtered = exceptions.filter(item => (!typeFilter || item.type === typeFilter)
      && (!search || [item.type, item.companyCode, item.orderId, item.paymentId, item.message, item.messageZh]
        .join(" ").toLowerCase().includes(search)));
    elements.exceptionsBody.replaceChildren();
    if (!filtered.length) {
      appendEmptyRow(elements.exceptionsBody, 7, t("noExceptions"));
      return;
    }
    for (const item of filtered) {
      const row = document.createElement("tr");
      row.append(
        cell(item.type, "code"),
        cell(t(item.severity === "error" ? "severityError" : "severityWarning"), `severity ${item.severity}`),
        cell(item.companyCode),
        cell(item.orderId || "—", "code"),
        cell(item.paymentId || "—", "code"),
        cell(item.sourceRow, "number"),
        messageCell(item)
      );
      elements.exceptionsBody.append(row);
    }
  }

  function messageCell(item) {
    const wrapper = document.createElement("div");
    const english = document.createElement("span");
    english.className = "message-en";
    english.textContent = item.message;
    const chinese = document.createElement("span");
    chinese.className = "message-zh";
    chinese.textContent = item.messageZh;
    wrapper.append(english, chinese);
    const td = document.createElement("td");
    td.append(wrapper);
    return td;
  }

  function renderMatches(matches) {
    elements.matchesBody.replaceChildren();
    if (!matches.length) {
      appendEmptyRow(elements.matchesBody, 8, t("noMatches"));
      return;
    }
    for (const match of matches) {
      const status = document.createElement("span");
      status.className = `match-status ${match.status}`;
      status.textContent = t(statusLabels[match.status] || match.status);
      const statusCell = document.createElement("td");
      statusCell.append(status);
      const row = document.createElement("tr");
      row.append(
        cell(match.companyCode),
        cell(match.orderId, "code"),
        cell(match.orderDate),
        statusCell,
        cell(formatMoney(match.orderAmount, match.currency), "number"),
        cell(formatMoney(match.paidAmount, match.currency), "number"),
        cell(formatMoney(match.remainingAmount, match.currency), "number"),
        cell((match.paymentIds || []).join(", ") || "—", "code")
      );
      elements.matchesBody.append(row);
    }
  }

  function renderAudit(events, isPreview = false) {
    elements.auditList.replaceChildren();
    if (!events.length) {
      const empty = document.createElement("p");
      empty.className = "empty-row";
      empty.textContent = isPreview ? t("previewNoAudit") : t("noAudit");
      elements.auditList.append(empty);
      return;
    }
    for (const event of events) {
      const item = document.createElement("div");
      item.className = "audit-item";
      const time = document.createElement("time");
      time.dateTime = event.occurredAtUtc;
      time.textContent = new Date(event.occurredAtUtc).toLocaleString(language === "zh" ? "zh-CN" : "en-US");
      const code = document.createElement("code");
      code.textContent = `${event.requestId} · ${event.inputHash}`;
      const outcome = document.createElement("span");
      outcome.className = `audit-outcome ${event.outcome}`;
      outcome.textContent = t(event.outcome === "replayed" ? "auditOutcomeReplayed" : "auditOutcomeCreated");
      item.append(time, code, outcome);
      elements.auditList.append(item);
    }
  }

  function cell(value, className = "") {
    const td = document.createElement("td");
    td.textContent = String(value ?? "—");
    if (className) td.className = className;
    return td;
  }

  function appendEmptyRow(tbody, columns, message) {
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = columns;
    td.className = "empty-row";
    td.textContent = message;
    row.append(td);
    tbody.append(row);
  }

  async function loadReport(runId) {
    if (mode === "preview" && currentRun?.preview) {
      elements.reportContent.textContent = renderMarkdown(currentRun.run.run, language);
      return;
    }
    try {
      const response = await apiFetch(`/api/runs/${encodeURIComponent(runId)}/report.md?lang=${language}`);
      elements.reportContent.textContent = await response.text();
    } catch (error) {
      elements.reportContent.textContent = error.message;
    }
  }

  async function loadRun(runId) {
    try {
      const response = await apiFetch(`/api/runs/${encodeURIComponent(runId)}`);
      const view = await response.json();
      currentRun = { requestId: view.auditEvents.at(-1)?.requestId || "—", replayed: false, run: view };
      renderRun(currentRun);
      await loadReport(runId);
      document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      if (error.code === "network") {
        await enterBrowserPreview(true);
      } else {
        setConnectionStatus(`${t("loadRunFailed")} ${error.message}`, "error");
      }
    }
  }

  async function loadRuns() {
    if (mode === "preview") {
      renderPreviewHistory();
      return;
    }
    elements.refreshRuns.disabled = true;
    try {
      const response = await apiFetch("/api/runs?limit=10&offset=0");
      const payload = await response.json();
      renderHistory(payload.items || []);
    } catch (error) {
      if (error.code === "network") {
        await enterBrowserPreview(true);
      } else {
        elements.historyList.replaceChildren();
        const empty = document.createElement("div");
        empty.className = "history-empty";
        empty.textContent = t("connectionFailed");
        elements.historyList.append(empty);
      }
    } finally {
      elements.refreshRuns.disabled = false;
    }
  }

  function renderPreviewHistory() {
    elements.historyList.replaceChildren();
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = t("previewHistory");
    elements.historyList.append(empty);
  }

  function renderHistory(runs) {
    elements.historyList.replaceChildren();
    if (!runs.length) {
      const empty = document.createElement("div");
      empty.className = "history-empty";
      empty.textContent = t("noRuns");
      elements.historyList.append(empty);
      return;
    }
    for (const run of runs) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-row";
      const matched = document.createElement("span");
      matched.className = "history-number";
      matched.textContent = String(run.summary.matchedOrders);
      const identity = document.createElement("span");
      const id = document.createElement("strong");
      id.textContent = run.runId;
      identity.append(id, document.createElement("br"));
      const hashWrap = document.createElement("span");
      hashWrap.className = "history-hash";
      const hash = document.createElement("code");
      hash.textContent = run.inputHash;
      hashWrap.append(hash);
      identity.append(hashWrap);
      const exceptions = document.createElement("span");
      exceptions.className = "history-stat";
      exceptions.textContent = `${t("metricExceptions")}: ${run.summary.exceptionCount}`;
      const mode = document.createElement("span");
      mode.className = "history-stat";
      mode.textContent = run.dryRun ? t("dryRun") : t("simulation");
      const created = document.createElement("span");
      created.className = "history-stat";
      created.textContent = new Date(run.createdAtUtc).toLocaleString(language === "zh" ? "zh-CN" : "en-US");
      const open = document.createElement("span");
      open.setAttribute("aria-hidden", "true");
      open.textContent = "↗";
      button.append(matched, identity, exceptions, mode, created, open);
      button.addEventListener("click", () => void loadRun(run.runId));
      elements.historyList.append(button);
    }
  }

  function selectTab(name) {
    document.querySelectorAll(".tab").forEach(tab => {
      const selected = tab.dataset.tab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    for (const panel of document.querySelectorAll(".tab-panel")) {
      panel.hidden = panel.id !== `panel${name[0].toUpperCase()}${name.slice(1)}`;
    }
  }

  function bindDropzone(kind, input, drop) {
    input.addEventListener("change", () => setFile(kind, input.files?.[0]));
    for (const eventName of ["dragenter", "dragover"]) {
      drop.addEventListener(eventName, event => {
        event.preventDefault();
        drop.classList.add("dragging");
      });
    }
    for (const eventName of ["dragleave", "drop"]) {
      drop.addEventListener(eventName, event => {
        event.preventDefault();
        drop.classList.remove("dragging");
        if (eventName === "drop") {
          setFile(kind, event.dataTransfer?.files?.[0]);
        }
      });
    }
  }

  elements.langZh.addEventListener("click", () => setLanguage("zh"));
  elements.langEn.addEventListener("click", () => setLanguage("en"));
  elements.checkConnection.addEventListener("click", () => void checkConnection());
  elements.loadSample.addEventListener("click", () => void loadSample());
  elements.reconcile.addEventListener("click", () => void reconcile());
  elements.refreshRuns.addEventListener("click", () => mode === "preview" ? checkConnection() : loadRuns());
  elements.exceptionType.addEventListener("change", () => renderExceptions(currentRun?.run.run.exceptions || []));
  elements.exceptionSearch.addEventListener("input", () => renderExceptions(currentRun?.run.run.exceptions || []));
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => selectTab(tab.dataset.tab));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...document.querySelectorAll(".tab")];
      const index = tabs.indexOf(tab);
      const next = tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(next.dataset.tab);
      next.focus();
    });
  });
  bindDropzone("orders", elements.ordersFile, elements.ordersDrop);
  bindDropzone("payments", elements.paymentsFile, elements.paymentsDrop);

  const queryApi = new URLSearchParams(location.search).get("api");
  if (queryApi) elements.apiBase.value = queryApi;
  else elements.apiBase.value = localStorage.getItem("legacy-bridge-api") || "http://127.0.0.1:5087";
  elements.nextRequestId.textContent = `${t("request")}: ${newRequestId()}`;
  setLanguage(language);
  selectTab("exceptions");
  updateRunButton();
  void initializeMode();
})();
