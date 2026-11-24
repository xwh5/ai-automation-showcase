(() => {
  "use strict";

  const C = globalThis.PriceConsoleCore;
  const byId = (id) => document.getElementById(id);
  const state = {
    language: "en",
    fixture: null,
    report: null,
    selectedId: null,
    query: "",
    filter: "all",
    matcherResult: null,
    statusTimer: null,
    lastFocus: null,
  };

  if (!C) {
    document.body.textContent = "Core bundle missing. Run node scripts/build.mjs.";
    return;
  }

  function tr(key, variables) {
    return C.t(state.language, key, variables);
  }

  function text(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value.nameEn || value.nameZh) return state.language === "zh" ? value.nameZh ?? value.nameEn ?? "" : value.nameEn ?? value.nameZh ?? "";
    return C.textFor(state.language, value);
  }

  function make(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined && content !== null) node.textContent = String(content);
    return node;
  }

  function setText(id, value) {
    const node = byId(id);
    if (node) node.textContent = String(value);
  }

  function formatMoney(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
    return new Intl.NumberFormat(state.language === "zh" ? "zh-CN" : "en-GB", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  function formatPercent(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
    return `${(Number(value) * 100).toFixed(2)}%`;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value ?? "");
    return new Intl.DateTimeFormat(state.language === "zh" ? "zh-CN" : "en-GB", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " UTC";
  }

  function statusBadge(status, label) {
    const badge = make("span", `status-badge status-${status}`, label ?? tr(`status${status.charAt(0).toUpperCase()}${status.slice(1)}`));
    return badge;
  }

  function productName(product) {
    return text(product?.nameEn && product?.nameZh ? product : { en: product?.nameEn, zh: product?.nameZh });
  }

  function productById(id) {
    return state.report?.clusters.find((cluster) => cluster.product.id === id)?.product ?? null;
  }

  function productLabel(id) {
    if (!id) return tr("expectedNone");
    const product = productById(id);
    return product ? `${id} · ${product.model}` : id;
  }

  function showStatus(message, isError = false) {
    const node = byId("status-message");
    node.textContent = message;
    node.classList.toggle("is-error", isError);
    node.hidden = false;
    window.clearTimeout(state.statusTimer);
    state.statusTimer = window.setTimeout(() => { node.hidden = true; }, 5200);
  }

  function applyTranslations() {
    document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
    document.title = state.language === "zh" ? "价格证据台 · Price Evidence Desk" : "Price Evidence Desk · 价格证据台";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = tr(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", tr(node.dataset.i18nPlaceholder));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", tr(node.dataset.i18nAriaLabel));
    });
    byId("lang-en").setAttribute("aria-pressed", String(state.language === "en"));
    byId("lang-zh").setAttribute("aria-pressed", String(state.language === "zh"));
    renderAll();
  }

  function loadFixture(announce = true) {
    state.fixture = C.createFixture();
    state.report = C.analyzeFixture(state.fixture);
    state.selectedId = state.report.clusters[0]?.product.id ?? null;
    state.query = "";
    state.filter = "all";
    state.matcherResult = null;
    byId("sku-search").value = "";
    byId("state-filter").value = "all";
    byId("matcher-input").value = "";
    renderAll();
    if (announce) showStatus(tr("fixtureLoaded"));
  }

  function renderAll() {
    if (!state.report) return;
    renderSummary();
    renderLedger();
    renderInspector();
    renderUnmatched();
    renderBlind();
    renderSources();
  }

  function renderSummary() {
    const summary = state.report.summary;
    setText("summary-skus", summary.skuCount);
    setText("summary-sources", summary.sourceCount);
    setText("summary-offers", summary.observationCount);
    setText("summary-conflicts", summary.conflictCount);
    setText("summary-review", summary.reviewCount);
    setText("summary-unmatched", summary.unmatchedCount);
  }

  function clusterMatchesQuery(cluster) {
    if (state.filter !== "all" && cluster.status !== state.filter) return false;
    if (!state.query) return true;
    const product = cluster.product;
    const haystack = C.normalizeText([
      product.id, product.brand, product.model, product.nameEn, product.nameZh,
      product.category, cluster.normalized.key,
    ].join(" "));
    return haystack.includes(C.normalizeText(state.query));
  }

  function comparableRange(cluster) {
    const currencies = cluster.price.currencies;
    const bases = new Set(cluster.offers.map((offer) => offer.basis));
    return cluster.offers.length > 0 && currencies.length === 1 && bases.size === 1 && cluster.price.low !== null;
  }

  function renderLedger() {
    const tbody = byId("sku-rows");
    tbody.replaceChildren();
    const labels = [tr("tableSku"), tr("tableRange"), tr("tableEvidence"), tr("tableState"), tr("tableAction")];
    const clusters = state.report.clusters.filter(clusterMatchesQuery);
    for (const cluster of clusters) {
      const row = make("tr", cluster.product.id === state.selectedId ? "is-selected" : "");
      row.dataset.productId = cluster.product.id;

      const skuCell = make("td");
      skuCell.dataset.label = labels[0];
      skuCell.append(make("span", "sku-model", productName(cluster.product)));
      skuCell.append(make("span", "sku-key", `${cluster.product.id} · ${cluster.product.model} · ${cluster.normalized.variant} · ×${cluster.product.packSize}`));
      skuCell.append(make("span", "sku-category", C.categoryLabel(state.language, cluster.product.category)));

      const rangeCell = make("td");
      rangeCell.dataset.label = labels[1];
      if (comparableRange(cluster)) {
        rangeCell.append(make("span", "price-range", `${formatMoney(cluster.price.low)}–${formatMoney(cluster.price.high)}`));
        rangeCell.append(make("span", "range-note", `${tr("basisRetail")} · Δ ${formatPercent(cluster.price.spread)}`));
      } else {
        rangeCell.append(make("span", "range-note", tr("rangeUnavailable")));
      }

      const evidenceCell = make("td");
      evidenceCell.dataset.label = labels[2];
      evidenceCell.append(make("span", "evidence-count", tr("evidenceCount", { count: cluster.offers.length })));
      evidenceCell.append(make("span", "evidence-sources", [...new Set(cluster.offers.map((offer) => offer.sourceId))].join(" / ") || "—"));

      const statusCell = make("td");
      statusCell.dataset.label = labels[3];
      statusCell.append(statusBadge(cluster.status));
      if (cluster.lowConfidence) statusCell.append(make("span", "range-note", tr("lowConfidence")));

      const actionCell = make("td");
      actionCell.dataset.label = labels[4];
      const action = make("button", "button row-action", tr("viewEvidence"));
      action.type = "button";
      action.setAttribute("aria-label", `${tr("viewEvidence")}: ${productName(cluster.product)}`);
      action.addEventListener("click", (event) => {
        event.stopPropagation();
        selectCluster(cluster.product.id);
        openEvidence(cluster);
      });
      actionCell.append(action);

      row.append(skuCell, rangeCell, evidenceCell, statusCell, actionCell);
      row.addEventListener("click", () => selectCluster(cluster.product.id));
      tbody.append(row);
    }
    byId("ledger-empty").hidden = clusters.length !== 0;
  }

  function selectCluster(id) {
    if (state.selectedId === id) return;
    state.selectedId = id;
    renderLedger();
    renderInspector();
  }

  function renderInspector() {
    const cluster = state.report.clusters.find((item) => item.product.id === state.selectedId) ?? state.report.clusters[0];
    if (!cluster) return;
    state.selectedId = cluster.product.id;
    setText("selected-product-name", productName(cluster.product));
    setText("selected-product-meta", `${cluster.product.id} · ${cluster.product.model} · ${C.categoryLabel(state.language, cluster.product.category)} · ×${cluster.product.packSize}`);
    const selectedStatus = byId("selected-status");
    selectedStatus.replaceChildren(statusBadge(cluster.status));

    setText("price-label", cluster.indicativePrice === null ? tr("noIndicative") : tr("indicative"));
    setText("selected-price", formatMoney(cluster.indicativePrice));
    setText("price-method", cluster.indicativePrice === null ? tr("blockedMethod") : tr("medianMethod"));
    const range = byId("selected-range");
    range.replaceChildren();
    if (comparableRange(cluster)) {
      range.append(make("strong", "", `${formatMoney(cluster.price.low)}–${formatMoney(cluster.price.high)}`));
      range.append(document.createTextNode(`${tr("tableRange")} · Δ ${formatPercent(cluster.price.spread)}`));
    } else {
      range.append(make("strong", "", tr("rangeUnavailable")));
    }

    renderNormalized(cluster);
    renderChart(cluster);
    renderMatcherResult();
  }

  function renderNormalized(cluster) {
    const container = byId("normalized-fields");
    container.replaceChildren();
    const fields = [
      [tr("normalizedBrand"), cluster.normalized.brand || "—"],
      [tr("normalizedModel"), cluster.normalized.model || "—"],
      [tr("normalizedVariant"), cluster.normalized.variant],
      [tr("normalizedPack"), `×${cluster.normalized.packSize}`],
      [tr("normalizedBasis"), C.basisLabel(state.language, cluster.normalized.basis)],
    ];
    for (const [label, value] of fields) {
      const wrapper = make("div");
      wrapper.append(make("dt", "", label), make("dd", "", value));
      container.append(wrapper);
    }
    const keyWrapper = make("div", "key-field");
    keyWrapper.append(make("dt", "", tr("normalizedKey")), make("dd", "", cluster.normalized.key));
    container.append(keyWrapper);
  }

  function renderChart(cluster) {
    const host = byId("price-chart");
    const legend = byId("chart-legend");
    host.replaceChildren();
    legend.replaceChildren();
    if (!cluster.history.length) {
      host.append(make("p", "chart-empty", tr("chartEmpty")));
      return;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 640 250");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `${tr("chartTitle")}: ${productName(cluster.product)}`);
    const title = document.createElementNS(svgNS, "title");
    title.textContent = `${tr("chartTitle")} — ${productName(cluster.product)}`;
    svg.append(title);

    const width = 640;
    const height = 250;
    const margin = { top: 18, right: 16, bottom: 38, left: 55 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const values = cluster.history.map((entry) => entry.price.amount);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = Math.max((rawMax - rawMin) * 0.18, rawMax * 0.025, 1);
    const min = Math.max(0, rawMin - padding);
    const max = rawMax + padding;
    const dates = [...new Set(cluster.history.map((entry) => entry.observedAt.slice(0, 10)))].sort();
    const x = (date) => margin.left + (dates.indexOf(date) / Math.max(1, dates.length - 1)) * plotWidth;
    const y = (value) => margin.top + (1 - (value - min) / (max - min || 1)) * plotHeight;
    const colors = { alpha: "#247c82", beta: "#d69228", gamma: "#ad443a" };

    function svgNode(tag, attributes, content) {
      const node = document.createElementNS(svgNS, tag);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
      if (content !== undefined) node.textContent = String(content);
      return node;
    }

    for (let index = 0; index <= 4; index += 1) {
      const value = min + ((max - min) * index) / 4;
      const gridY = y(value);
      svg.append(svgNode("line", { x1: margin.left, x2: width - margin.right, y1: gridY, y2: gridY, stroke: "#c5d2cc", "stroke-width": 1, "stroke-dasharray": index === 0 ? "0" : "3 5" }));
      svg.append(svgNode("text", { x: margin.left - 8, y: gridY + 4, "text-anchor": "end", fill: "#496365", "font-size": 11 }, `¥${Math.round(value)}`));
    }
    for (const date of dates) {
      svg.append(svgNode("text", { x: x(date), y: height - 12, "text-anchor": "middle", fill: "#496365", "font-size": 10 }, date.slice(5)));
    }

    for (const source of state.report.sources) {
      const points = cluster.history.filter((entry) => entry.sourceId === source.id);
      if (!points.length) continue;
      const path = points.map((entry, index) => `${index === 0 ? "M" : "L"} ${x(entry.observedAt.slice(0, 10)).toFixed(2)} ${y(entry.price.amount).toFixed(2)}`).join(" ");
      svg.append(svgNode("path", { d: path, fill: "none", stroke: colors[source.id] ?? "#496365", "stroke-width": 2.4, "stroke-linejoin": "round", "stroke-linecap": "round" }));
      for (const entry of points) {
        const point = svgNode("circle", { cx: x(entry.observedAt.slice(0, 10)), cy: y(entry.price.amount), r: 3, fill: colors[source.id] ?? "#496365", stroke: "#fffdf8", "stroke-width": 1.2 });
        point.append(svgNode("title", {}, `${text(source.nameEn && source.nameZh ? source : { en: source.nameEn, zh: source.nameZh })} · ${formatDate(entry.observedAt)} · ${formatMoney(entry.price.amount)}`));
        svg.append(point);
      }
      const item = make("span", "legend-item");
      const swatch = make("span", "legend-swatch");
      swatch.style.setProperty("--swatch", colors[source.id] ?? "#496365");
      item.append(swatch, document.createTextNode(text(source)));
      legend.append(item);
    }
    host.append(svg);
  }

  function renderMatcherResult() {
    const container = byId("matcher-result");
    container.replaceChildren();
    if (!state.matcherResult) return;
    const { standardized, candidates } = state.matcherResult;
    const summary = make("div", "normalize-summary");
    summary.append(make("strong", "", standardized.complete ? tr("normalizedComplete") : tr("normalizedIncomplete")));
    summary.append(document.createTextNode(`${tr("normalizedKey")}: `));
    summary.append(make("code", "", standardized.key || "—"));
    container.append(summary);
    container.append(make("h4", "section-label", tr("candidates")));
    const list = make("div", "candidate-list");
    for (const candidate of candidates) {
      const row = make("div", `candidate-row${candidate.accepted ? "" : " is-rejected"}`);
      row.append(make("span", "candidate-name", `${candidate.productId} · ${productName(productById(candidate.productId))}`));
      row.append(make("span", "candidate-score", `${candidate.accepted ? tr("accepted") : tr("rejected")} · ${candidate.score.toFixed(2)}`));
      const reason = candidate.accepted
        ? `${tr("score")} ${candidate.score.toFixed(2)}${candidate.score < C.LOW_CONFIDENCE ? ` · ${tr("lowConfidence")}` : ""}`
        : candidate.hardConflicts.length
          ? `hard conflict: ${candidate.hardConflicts.join(", ")}`
          : `${tr("score")} ${candidate.score.toFixed(2)} < ${C.MATCH_THRESHOLD}`;
      row.append(make("span", "candidate-reason", reason));
      list.append(row);
    }
    container.append(list);
  }

  function renderUnmatched() {
    const container = byId("unmatched-list");
    container.replaceChildren();
    setText("unmatched-count", state.report.unmatched.length);
    for (const offer of state.report.unmatched) {
      const source = state.report.sources.find((item) => item.id === offer.sourceId);
      const item = make("article", "unmatched-item");
      item.append(make("h3", "", offer.title));
      const meta = make("div", "unmatched-meta");
      meta.append(
        make("span", "", source ? text(source) : offer.sourceId),
        make("span", "", formatDate(offer.observedAt)),
        make("span", "", formatMoney(offer.price.amount)),
        make("span", "", C.basisLabel(state.language, offer.basis)),
      );
      item.append(meta);
      item.append(make("p", "unmatched-reason", `${offer.reason} · ${tr("score")} ${offer.matchScore.toFixed(2)}`));
      const button = make("button", "button button-quiet", tr("viewEvidence"));
      button.type = "button";
      button.addEventListener("click", () => openUnmatchedEvidence(offer));
      item.append(button);
      container.append(item);
    }
  }

  function renderBlind() {
    const blind = state.report.blind;
    setText("blind-total", blind.total);
    setText("blind-precision", formatPercent(blind.precision));
    setText("blind-recall", formatPercent(blind.recall));
    setText("blind-tp", blind.counts.truePositives);
    setText("blind-fp", blind.counts.falsePositives);
    setText("blind-fn", blind.counts.falseNegatives);
    setText("blind-tn", blind.counts.trueNegatives);

    const container = byId("blind-results");
    container.replaceChildren();
    if (!blind.rows.length) {
      container.append(make("p", "chart-empty", tr("blindEmpty")));
      return;
    }
    const header = make("div", "blind-row blind-table-head");
    [tr("case"), tr("input"), tr("expected"), tr("predicted"), tr("outcome")].forEach((label) => header.append(make("span", "", label)));
    container.append(header);

    for (const row of blind.rows) {
      const isError = !["true_positive", "true_negative"].includes(row.outcome);
      const item = make("div", `blind-row${isError ? " is-error" : ""}`);
      item.append(make("span", "blind-case", row.id));
      const title = make("span", "blind-title", row.title);
      title.dataset.label = tr("input");
      item.append(title);
      const expected = make("span", "blind-cell", productLabel(row.expectedProductId));
      expected.dataset.label = tr("expected");
      item.append(expected);
      const predicted = make("span", "blind-cell", productLabel(row.predictedProductId));
      predicted.dataset.label = tr("predicted");
      predicted.append(make("small", "", `${tr("score")} ${row.matchScore.toFixed(2)}${row.lowConfidence ? ` · ${tr("lowConfidence")}` : ""}`));
      item.append(predicted);
      const outcome = make("span", "blind-cell blind-outcome", C.outcomeLabel(state.language, row.outcome));
      outcome.dataset.label = tr("outcome");
      const badgeClass = row.outcome === "true_positive" || row.outcome === "true_negative" ? "clear" : "conflict";
      if (isError) outcome.append(statusBadge(badgeClass, tr("mismatch")));
      else outcome.append(make("span", "result-mark", "✓"));
      item.append(outcome);
      container.append(item);
    }
  }

  function renderSources() {
    const container = byId("source-cards");
    container.replaceChildren();
    for (const source of state.report.sources) {
      const card = make("article", "source-card");
      card.append(make("h3", "", text(source)));
      card.append(make("code", "source-url", source.url));
      card.append(make("p", "source-note", text(source.note)));
      card.append(make("p", "source-reliability", `${tr("reliability")} ${formatPercent(source.reliability)}`));
      card.append(make("p", "source-note", tr("syntheticAddress")));
      container.append(card);
    }
  }

  function evidenceField(label, value, wide = false) {
    const wrapper = make("div", wide ? "wide" : "");
    wrapper.append(make("dt", "", label), make("dd", "", value));
    return wrapper;
  }

  function renderMatchedEvidence(cluster) {
    const content = byId("evidence-content");
    content.replaceChildren();
    if (!cluster.offers.length) {
      content.append(make("p", "chart-empty", tr("noOffers")));
      return;
    }
    if (cluster.conflictReasons.length) {
      const conflict = make("div", "normalize-summary");
      conflict.append(make("strong", "", tr("statusConflict")));
      const conflictKeys = { price_spread: "conflictSpread", basis_mismatch: "conflictBasis", currency_mismatch: "conflictCurrency" };
      conflict.append(document.createTextNode(cluster.conflictReasons.map((reason) => tr(conflictKeys[reason] ?? reason)).join(" · ")));
      content.append(conflict);
    }
    for (const offer of cluster.offers) {
      const item = make("article", `evidence-item${offer.lowConfidence ? " is-low" : ""}`);
      item.append(make("h3", "", offer.source ? text(offer.source) : offer.sourceId));
      item.append(statusBadge(offer.lowConfidence ? "review" : "clear", offer.lowConfidence ? tr("lowConfidence") : tr("statusClear")));
      const grid = make("dl", "evidence-grid");
      grid.append(
        evidenceField(tr("observedAt"), formatDate(offer.observedAt)),
        evidenceField(tr("basis"), C.basisLabel(state.language, offer.basis)),
        evidenceField(tr("confidence"), formatPercent(offer.matchConfidence)),
        evidenceField(tr("matchScore"), offer.matchScore.toFixed(2)),
        evidenceField(tr("sourceReliability"), formatPercent(offer.source?.reliability)),
        evidenceField(tr("normalizedPack"), `×${offer.packSize}`),
        evidenceField(tr("sourceUrl"), offer.url, true),
      );
      item.append(grid);
      item.append(make("div", "evidence-raw", `${tr("rawTitle")}: ${offer.title}`));
      item.append(make("div", "evidence-raw", `${tr("rawSku")}: ${offer.rawSku}`));
      const components = make("div", "component-list");
      for (const [name, value] of Object.entries(offer.matchComponents)) {
        components.append(make("span", "component-chip", `${name}: ${Number(value).toFixed(2)}`));
      }
      item.append(components);
      item.append(make("p", "evidence-note", `${text(offer.note)} · ${tr("syntheticAddress")}`));
      content.append(item);
    }
  }

  function openEvidence(cluster) {
    state.lastFocus = document.activeElement;
    setText("evidence-product-name", productName(cluster.product));
    setText("evidence-product-meta", `${cluster.product.id} · ${cluster.product.model} · ${cluster.normalized.key}`);
    renderMatchedEvidence(cluster);
    const dialog = byId("evidence-dialog");
    if (!dialog.open) dialog.showModal();
  }

  function openUnmatchedEvidence(offer) {
    state.lastFocus = document.activeElement;
    const source = state.report.sources.find((item) => item.id === offer.sourceId);
    setText("evidence-product-name", offer.title);
    setText("evidence-product-meta", `${offer.id} · ${tr("statusUnmatched")} · ${offer.reason}`);
    const content = byId("evidence-content");
    content.replaceChildren();
    const item = make("article", `evidence-item${offer.lowSourceConfidence ? " is-low" : ""}`);
    item.append(make("h3", "", source ? text(source) : offer.sourceId));
    item.append(statusBadge("unmatched", tr("statusUnmatched")));
    const grid = make("dl", "evidence-grid");
    grid.append(
      evidenceField(tr("observedAt"), formatDate(offer.observedAt)),
      evidenceField(tr("basis"), C.basisLabel(state.language, offer.basis)),
      evidenceField(tr("confidence"), formatPercent(offer.sourceConfidence)),
      evidenceField(tr("matchScore"), offer.matchScore.toFixed(2)),
      evidenceField(tr("sourceReliability"), formatPercent(source?.reliability)),
      evidenceField(tr("normalizedPack"), `×${offer.packSize}`),
      evidenceField(tr("sourceUrl"), offer.url, true),
    );
    item.append(grid);
    item.append(make("div", "evidence-raw", `${tr("rawTitle")}: ${offer.title}`));
    item.append(make("div", "evidence-raw", `${tr("rawSku")}: ${offer.rawSku}`));
    item.append(make("p", "evidence-note", `${text(offer.note)} · ${tr("syntheticAddress")}`));
    content.append(item);
    const dialog = byId("evidence-dialog");
    if (!dialog.open) dialog.showModal();
  }

  function closeEvidence() {
    const dialog = byId("evidence-dialog");
    if (dialog.open) dialog.close();
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    showStatus(tr("exportReady"));
  }

  async function importFile(file) {
    try {
      const fixture = C.parseFixture(await file.text());
      state.fixture = fixture;
      state.report = C.analyzeFixture(fixture);
      state.selectedId = state.report.clusters[0]?.product.id ?? null;
      state.query = "";
      state.filter = "all";
      state.matcherResult = null;
      byId("sku-search").value = "";
      byId("state-filter").value = "all";
      renderAll();
      showStatus(`${tr("fixtureLoaded")} (${file.name})`);
    } catch (error) {
      showStatus(`${tr("importError")}: ${error.message}`, true);
    } finally {
      byId("fixture-file").value = "";
    }
  }

  byId("lang-en").addEventListener("click", () => {
    state.language = "en";
    applyTranslations();
  });
  byId("lang-zh").addEventListener("click", () => {
    state.language = "zh";
    applyTranslations();
  });
  byId("load-fixture").addEventListener("click", () => loadFixture());
  byId("fixture-file").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) void importFile(file);
  });
  byId("export-json").addEventListener("click", () => {
    downloadFile("price-evidence.json", C.exportJSON(state.report, { exportedAt: new Date().toISOString() }), "application/json;charset=utf-8");
  });
  byId("export-csv").addEventListener("click", () => {
    downloadFile("price-evidence.csv", C.exportCSV(state.report), "text/csv;charset=utf-8");
  });
  byId("sku-search").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderLedger();
  });
  byId("state-filter").addEventListener("change", (event) => {
    state.filter = event.target.value;
    renderLedger();
  });
  byId("matcher-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = byId("matcher-input").value.trim();
    if (!title) {
      byId("matcher-input").focus();
      return;
    }
    state.matcherResult = {
      title,
      standardized: C.standardizeSku({ title }),
      candidates: C.rankMatches({ title }, state.report.clusters.map((cluster) => cluster.product)).slice(0, 3),
    };
    renderMatcherResult();
  });
  byId("close-evidence").addEventListener("click", closeEvidence);
  byId("evidence-dialog").addEventListener("click", (event) => {
    if (event.target === byId("evidence-dialog")) closeEvidence();
  });
  byId("evidence-dialog").addEventListener("close", () => {
    if (state.lastFocus instanceof HTMLElement) state.lastFocus.focus();
  });

  loadFixture(false);
  applyTranslations();
})();
