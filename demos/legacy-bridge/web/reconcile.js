export const RULE_VERSION = "legacy-reconcile/1.0.0";

const ORDER_REQUIRED = ["order_id", "company_code", "order_date", "currency", "amount"];
const PAYMENT_REQUIRED = ["payment_id", "company_code", "order_id", "payment_date", "currency", "amount"];
const ENCODER = new TextEncoder();

const RULES = {
  DUPLICATE_ORDER: "DUPLICATE_ORDER",
  AMOUNT_MISMATCH: "AMOUNT_MISMATCH",
  MISSING_FIELD: "MISSING_FIELD",
  INVALID_FIELD: "INVALID_FIELD",
  UNPAID_ORDER: "UNPAID_ORDER",
  PAYMENT_WITHOUT_ORDER: "PAYMENT_WITHOUT_ORDER",
  CURRENCY_MISMATCH: "CURRENCY_MISMATCH",
  DUPLICATE_PAYMENT: "DUPLICATE_PAYMENT",
  CSV_STRUCTURE: "CSV_STRUCTURE"
};

export class CsvFormatException extends Error {
  constructor(message) {
    super(message);
    this.name = "CsvFormatException";
  }
}

export function parseCsv(text, requiredHeaders, maxRows = 10_000) {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new CsvFormatException("CSV content is empty. / CSV 内容为空。");
  }

  const document = text.replace(/^\uFEFF+/, "");
  const rawRows = parseRawRows(document);
  if (rawRows.length === 0) {
    throw new CsvFormatException("CSV must contain a header. / CSV 必须包含表头。");
  }

  const headers = rawRows[0].fields.map(value => value.trim().toLowerCase());
  if (headers.some(value => value.length === 0) || new Set(headers).size !== headers.length) {
    throw new CsvFormatException("CSV headers must be non-empty and unique. / CSV 表头不能为空或重复。");
  }

  const required = requiredHeaders.map(value => value.trim().toLowerCase());
  const missing = required.filter(value => !headers.includes(value));
  if (missing.length > 0) {
    throw new CsvFormatException(`CSV is missing required headers: ${missing.join(", ")}. / CSV 缺少必需表头：${missing.join(", ")}。`);
  }
  if (rawRows.length - 1 > maxRows) {
    throw new CsvFormatException(`CSV exceeds the ${maxRows} row limit. / CSV 超过 ${maxRows} 行限制。`);
  }
  if (rawRows.length === 1) {
    throw new CsvFormatException("CSV has no data rows. / CSV 没有数据行。");
  }

  const rows = rawRows.slice(1).map(raw => {
    const fields = Object.create(null);
    headers.forEach((header, index) => {
      fields[header] = index < raw.fields.length ? raw.fields[index] : "";
    });
    const structuralErrors = [];
    if (raw.fields.length !== headers.length) {
      structuralErrors.push(`CSV_COLUMN_COUNT: expected ${headers.length}, got ${raw.fields.length}`);
    }
    return {
      rowNumber: raw.startLine,
      fields,
      structuralErrors,
      rawText: raw.rawText,
      get(name) {
        return this.fields[name] ?? "";
      }
    };
  });

  return { headers, rows, errors: [] };
}

function parseRawRows(document) {
  const rows = [];
  let fields = [];
  let field = "";
  let rowStart = 0;
  let line = 1;
  let rowLine = 1;
  let inQuotes = false;
  let afterQuote = false;
  let hasRowContent = false;

  const finishField = () => {
    fields.push(field);
    field = "";
  };
  const finishRow = end => {
    finishField();
    if (hasRowContent) {
      rows.push({ startLine: rowLine, fields: [...fields], rawText: document.slice(rowStart, end) });
    }
    fields = [];
  };

  for (let index = 0; index < document.length; index++) {
    const character = document[index];
    if (inQuotes) {
      if (character === '"') {
        if (index + 1 < document.length && document[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        field += character === "\r" && index + 1 < document.length && document[index + 1] === "\n" ? "\n" : character;
        if (character === "\r" || character === "\n") {
          if (character === "\r" && index + 1 < document.length && document[index + 1] === "\n") index++;
          line++;
        }
      }
      continue;
    }

    if (character === '"' && !afterQuote) {
      if (field.length !== 0) {
        throw new CsvFormatException(`Unexpected quote at line ${line}. / 第 ${line} 行出现非法引号。`);
      }
      inQuotes = true;
      hasRowContent = true;
      continue;
    }

    if (character === ",") {
      finishField();
      afterQuote = false;
      hasRowContent = true;
      continue;
    }

    if (character === "\r" || character === "\n") {
      finishRow(index);
      if (character === "\r" && index + 1 < document.length && document[index + 1] === "\n") index++;
      line++;
      rowStart = index + 1;
      rowLine = line;
      hasRowContent = false;
      afterQuote = false;
      continue;
    }

    if (afterQuote && !/\s/.test(character)) {
      throw new CsvFormatException(`Unexpected character after closing quote at line ${line}. / 第 ${line} 行闭合引号后存在非法字符。`);
    }
    field += character;
    hasRowContent = true;
  }

  if (inQuotes) {
    throw new CsvFormatException(`Unterminated quoted field at line ${rowLine}. / 第 ${rowLine} 行引号未闭合。`);
  }
  if (hasRowContent || fields.length > 0 || field.length > 0) {
    finishRow(document.length);
  }
  return rows;
}

export async function reconcileCsv(ordersCsv, paymentsCsv, dryRun = true) {
  const ordersDocument = parseCsv(ordersCsv, ORDER_REQUIRED);
  const paymentsDocument = parseCsv(paymentsCsv, PAYMENT_REQUIRED);
  const collector = new ExceptionCollector();
  const parsedOrders = ordersDocument.rows.map(row => parseOrder(row, collector)).filter(Boolean);
  const parsedPayments = paymentsDocument.rows.map(row => parsePayment(row, collector)).filter(Boolean);
  const canonicalOrders = selectCanonicalOrders(parsedOrders, collector);
  const canonicalPayments = selectCanonicalPayments(parsedPayments, collector);
  const matches = [];
  const actions = [];

  const orderedOrders = [...canonicalOrders.values()].sort((left, right) =>
    left.companyCode.localeCompare(right.companyCode) || left.orderId.localeCompare(right.orderId));
  for (const order of orderedOrders) {
    const candidates = [...canonicalPayments.values()]
      .filter(payment => payment.key === order.key)
      .sort((left, right) => left.paymentDate.localeCompare(right.paymentDate) || left.sourceRow - right.sourceRow);
    const sameCurrency = candidates.filter(payment => payment.currency === order.currency);
    const foreignCurrency = candidates.filter(payment => payment.currency !== order.currency);

    for (const foreign of foreignCurrency) {
      collector.add({
        type: RULES.CURRENCY_MISMATCH,
        severity: "error",
        companyCode: foreign.companyCode,
        orderId: foreign.orderId,
        paymentId: foreign.paymentId,
        sourceRow: foreign.sourceRow,
        relatedRows: [],
        field: "currency",
        expected: order.currency,
        actual: foreign.currency,
        message: `Payment ${foreign.paymentId} uses ${foreign.currency}; order ${order.orderId} uses ${order.currency}. No FX conversion is performed.`,
        messageZh: `回款 ${foreign.paymentId} 使用 ${foreign.currency}，订单 ${order.orderId} 使用 ${order.currency}；不执行汇率换算。`
      });
      actions.push(buildAction("WOULD_QUEUE_REVIEW", order.companyCode, order.orderId, foreign.paymentId,
        "Review a cross-currency payment manually.", "人工复核跨币种回款。"));
    }

    const paidCents = sameCurrency.reduce((sum, payment) => sum + payment.amountCents, 0);
    const differenceCents = order.amountCents - paidCents;
    const status = paidCents === 0 && foreignCurrency.length > 0
      ? "currency_mismatch"
      : differenceCents < 0 ? "amount_mismatch" : differenceCents === 0 ? "matched" : "unpaid";

    if (status === "amount_mismatch") {
      collector.add({
        type: RULES.AMOUNT_MISMATCH,
        severity: "error",
        companyCode: order.companyCode,
        orderId: order.orderId,
        paymentId: "",
        sourceRow: order.sourceRow,
        relatedRows: sameCurrency.map(payment => payment.sourceRow),
        field: "amount",
        expected: formatCents(order.amountCents),
        actual: formatCents(paidCents),
        message: `Order ${order.orderId} is ${order.currency} ${formatCents(order.amountCents)}, but allocated payments total ${formatCents(paidCents)} (overpaid by ${formatCents(-differenceCents)}).`,
        messageZh: `订单 ${order.orderId} 金额为 ${order.currency} ${formatCents(order.amountCents)}，已分配回款合计 ${formatCents(paidCents)}，多付 ${formatCents(-differenceCents)}。`
      });
    } else if (status === "unpaid") {
      collector.add({
        type: RULES.UNPAID_ORDER,
        severity: "warning",
        companyCode: order.companyCode,
        orderId: order.orderId,
        paymentId: "",
        sourceRow: order.sourceRow,
        relatedRows: sameCurrency.map(payment => payment.sourceRow),
        field: "amount",
        expected: formatCents(order.amountCents),
        actual: formatCents(paidCents),
        message: `Order ${order.orderId} has an outstanding balance of ${order.currency} ${formatCents(differenceCents)}.`,
        messageZh: `订单 ${order.orderId} 尚有 ${order.currency} ${formatCents(differenceCents)} 未回款。`
      });
    }

    matches.push({
      matchId: stableId("match-", order.key),
      companyCode: order.companyCode,
      orderId: order.orderId,
      orderRow: order.sourceRow,
      orderDate: order.orderDate,
      currency: order.currency,
      orderAmount: order.amountCents / 100,
      paidAmount: paidCents / 100,
      remainingAmount: differenceCents / 100,
      status,
      paymentIds: sameCurrency.map(payment => payment.paymentId),
      paymentRows: sameCurrency.map(payment => payment.sourceRow),
      duplicateOrderRows: Math.max(0, order.groupSize - 1)
    });
    actions.push(status === "matched"
      ? buildAction("WOULD_CREATE_ERP_ORDER", order.companyCode, order.orderId, "",
        "Stage a matched order for a future bridge adapter; no ERP write is executed.",
        "将已匹配订单暂存给未来桥接适配器；不执行 ERP 写入。")
      : buildAction("WOULD_QUEUE_REVIEW", order.companyCode, order.orderId, "",
        "Queue the order for manual reconciliation review.", "将订单加入人工对账复核队列。"));
  }

  const orphanPayments = [...canonicalPayments.values()]
    .filter(payment => !canonicalOrders.has(payment.key))
    .sort((left, right) => left.companyCode.localeCompare(right.companyCode) || left.paymentId.localeCompare(right.paymentId));
  for (const payment of orphanPayments) {
    collector.add({
      type: RULES.PAYMENT_WITHOUT_ORDER,
      severity: "error",
      companyCode: payment.companyCode,
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      sourceRow: payment.sourceRow,
      relatedRows: [],
      field: "order_id",
      expected: "an existing order in the same company",
      actual: payment.key,
      message: `Payment ${payment.paymentId} has no source order ${payment.orderId} in company ${payment.companyCode}.`,
      messageZh: `回款 ${payment.paymentId} 在公司 ${payment.companyCode} 中找不到来源订单 ${payment.orderId}。`
    });
    actions.push(buildAction("WOULD_QUEUE_REVIEW", payment.companyCode, payment.orderId, payment.paymentId,
      "Investigate a payment with no source order; do not auto-post it.", "核查无来源订单的回款；不自动入账。"));
  }

  for (const payment of parsedPayments.filter(value => value.duplicateGroupSize > 1)) {
    actions.push(buildAction("WOULD_QUEUE_REVIEW", payment.companyCode, payment.orderId, payment.paymentId,
      "Review a duplicate payment before allocation.", "分配前复核重复回款。"));
  }

  const [ordersHash, paymentsHash, inputHash] = await Promise.all([
    sha256Text(ordersCsv),
    sha256Text(paymentsCsv),
    sha256Pair(ordersCsv, paymentsCsv)
  ]);
  const summary = buildSummary(
    ordersDocument.rows.length,
    parsedOrders,
    canonicalOrders,
    paymentsDocument.rows.length,
    parsedPayments,
    canonicalPayments,
    matches,
    collector.exceptions
  );

  return {
    runId: `preview-${inputHash.slice(0, 24)}`,
    inputHash,
    ordersHash,
    paymentsHash,
    ruleVersion: RULE_VERSION,
    createdAtUtc: new Date().toISOString(),
    dryRun: Boolean(dryRun),
    summary,
    matches,
    exceptions: collector.exceptions,
    plannedActions: actions,
    execution: {
      dryRun: Boolean(dryRun),
      simulationOnly: true,
      productionWrites: 0,
      message: dryRun
        ? "Browser preview: fixed rules ran locally; no server audit or persistence and no production writes."
        : "Browser simulation only: fixed rules ran locally; no server audit or persistence and no production writes.",
      messageZh: dryRun
        ? "浏览器预览：固定规则在本地运行；无服务端审计或持久化，未写入生产系统。"
        : "浏览器仅模拟：固定规则在本地运行；无服务端审计或持久化，未写入生产系统。"
    },
    stagedOrders: ordersDocument.rows,
    stagedPayments: paymentsDocument.rows
  };
}

function parseOrder(row, collector) {
  addStructuralExceptions(row, collector, "", "");
  let hasError = row.structuralErrors.length > 0;
  for (const field of ORDER_REQUIRED) {
    if (row.get(field).trim().length === 0) {
      hasError = true;
      collector.add({
        type: RULES.MISSING_FIELD,
        severity: "error",
        companyCode: row.get("company_code"),
        orderId: row.get("order_id"),
        paymentId: "",
        sourceRow: row.rowNumber,
        relatedRows: [],
        field,
        expected: "a non-empty value",
        actual: "",
        message: `Order row ${row.rowNumber} is missing ${field}.`,
        messageZh: `订单第 ${row.rowNumber} 行缺少字段 ${field}。`
      });
    }
  }

  const companyCode = row.get("company_code").trim().toUpperCase();
  const orderId = row.get("order_id").trim().toUpperCase();
  const currency = row.get("currency").trim().toUpperCase();
  if (row.get("currency").trim() && !/^[A-Z]{3}$/.test(currency)) {
    hasError = true;
    collector.add(invalidField(row, companyCode, orderId, "", "currency", "a three-letter ISO currency code", currency,
      `Order row ${row.rowNumber} has an invalid currency.`, `订单第 ${row.rowNumber} 行币种格式无效。`));
  }
  if (row.get("order_date").trim() && !isIsoDate(row.get("order_date").trim())) {
    hasError = true;
    collector.add(invalidField(row, companyCode, orderId, "", "order_date", "yyyy-MM-dd", row.get("order_date"),
      `Order row ${row.rowNumber} has an invalid date.`, `订单第 ${row.rowNumber} 行日期格式无效。`));
  }
  const amountCents = row.get("amount").trim() ? parseAmount(row.get("amount"), 0) : null;
  if (row.get("amount").trim() && amountCents === null) {
    hasError = true;
    collector.add(invalidField(row, companyCode, orderId, "", "amount", "a non-negative amount with at most two decimals", row.get("amount"),
      `Order row ${row.rowNumber} has an invalid amount.`, `订单第 ${row.rowNumber} 行金额格式无效。`));
  }
  if (hasError) return null;
  return {
    key: `${companyCode}|${orderId}`,
    orderId,
    companyCode,
    orderDate: row.get("order_date").trim(),
    currency,
    amountCents,
    sourceRow: row.rowNumber,
    groupSize: 1
  };
}

function parsePayment(row, collector) {
  addStructuralExceptions(row, collector, row.get("order_id"), row.get("payment_id"));
  let hasError = row.structuralErrors.length > 0;
  for (const field of PAYMENT_REQUIRED) {
    if (row.get(field).trim().length === 0) {
      hasError = true;
      collector.add({
        type: RULES.MISSING_FIELD,
        severity: "error",
        companyCode: row.get("company_code"),
        orderId: row.get("order_id"),
        paymentId: row.get("payment_id"),
        sourceRow: row.rowNumber,
        relatedRows: [],
        field,
        expected: "a non-empty value",
        actual: "",
        message: `Payment row ${row.rowNumber} is missing ${field}.`,
        messageZh: `回款第 ${row.rowNumber} 行缺少字段 ${field}。`
      });
    }
  }

  const companyCode = row.get("company_code").trim().toUpperCase();
  const orderId = row.get("order_id").trim().toUpperCase();
  const paymentId = row.get("payment_id").trim().toUpperCase();
  const currency = row.get("currency").trim().toUpperCase();
  if (row.get("currency").trim() && !/^[A-Z]{3}$/.test(currency)) {
    hasError = true;
    collector.add(invalidField(row, companyCode, orderId, paymentId, "currency", "a three-letter ISO currency code", currency,
      `Payment row ${row.rowNumber} has an invalid currency.`, `回款第 ${row.rowNumber} 行币种格式无效。`));
  }
  if (row.get("payment_date").trim() && !isIsoDate(row.get("payment_date").trim())) {
    hasError = true;
    collector.add(invalidField(row, companyCode, orderId, paymentId, "payment_date", "yyyy-MM-dd", row.get("payment_date"),
      `Payment row ${row.rowNumber} has an invalid date.`, `回款第 ${row.rowNumber} 行日期格式无效。`));
  }
  const amountCents = row.get("amount").trim() ? parseAmount(row.get("amount"), 1) : null;
  if (row.get("amount").trim() && amountCents === null) {
    hasError = true;
    collector.add(invalidField(row, companyCode, orderId, paymentId, "amount", "a positive amount with at most two decimals", row.get("amount"),
      `Payment row ${row.rowNumber} has an invalid amount.`, `回款第 ${row.rowNumber} 行金额格式无效。`));
  }
  if (hasError) return null;
  return {
    paymentId,
    key: `${companyCode}|${orderId}`,
    orderId,
    companyCode,
    paymentDate: row.get("payment_date").trim(),
    currency,
    amountCents,
    sourceRow: row.rowNumber,
    duplicateGroupSize: 1
  };
}

function invalidField(row, companyCode, orderId, paymentId, field, expected, actual, message, messageZh) {
  return {
    type: RULES.INVALID_FIELD,
    severity: "error",
    companyCode,
    orderId,
    paymentId,
    sourceRow: row.rowNumber,
    relatedRows: [],
    field,
    expected,
    actual,
    message,
    messageZh
  };
}

function addStructuralExceptions(row, collector, orderId, paymentId) {
  for (const error of row.structuralErrors) {
    collector.add({
      type: RULES.CSV_STRUCTURE,
      severity: "error",
      companyCode: row.get("company_code"),
      orderId,
      paymentId,
      sourceRow: row.rowNumber,
      relatedRows: [],
      field: "csv",
      expected: "one value per header column",
      actual: error,
      message: "The CSV row does not match the header width.",
      messageZh: "CSV 行列数与表头不一致。"
    });
  }
}

function selectCanonicalOrders(orders, collector) {
  const canonical = new Map();
  for (const group of groupBy(orders, order => order.key).values()) {
    const ordered = [...group].sort((left, right) => left.orderDate.localeCompare(right.orderDate) || left.sourceRow - right.sourceRow);
    const winner = { ...ordered[0], groupSize: ordered.length };
    canonical.set(winner.key, winner);
    if (ordered.length <= 1) continue;
    collector.add({
      type: RULES.DUPLICATE_ORDER,
      severity: "error",
      companyCode: winner.companyCode,
      orderId: winner.orderId,
      paymentId: "",
      sourceRow: winner.sourceRow,
      relatedRows: ordered.slice(1).map(order => order.sourceRow),
      field: "order_id",
      expected: "one row per company and order",
      actual: `${ordered.length} rows`,
      message: `Order ${winner.orderId} appears ${ordered.length} times. Row ${winner.sourceRow} (earliest date, then lowest row) is the provisional match basis; all duplicates require review.`,
      messageZh: `订单 ${winner.orderId} 出现 ${ordered.length} 次。暂以第 ${winner.sourceRow} 行（日期最早、其次行号最小）作为匹配基准；全部重复项均需复核。`
    });
  }
  return canonical;
}

function selectCanonicalPayments(payments, collector) {
  const canonical = new Map();
  for (const group of groupBy(payments, payment => payment.paymentId).values()) {
    const ordered = [...group].sort((left, right) => left.paymentDate.localeCompare(right.paymentDate) || left.sourceRow - right.sourceRow);
    const winner = { ...ordered[0], duplicateGroupSize: ordered.length };
    canonical.set(winner.paymentId, winner);
    if (ordered.length <= 1) continue;
    collector.add({
      type: RULES.DUPLICATE_PAYMENT,
      severity: "error",
      companyCode: winner.companyCode,
      orderId: winner.orderId,
      paymentId: winner.paymentId,
      sourceRow: winner.sourceRow,
      relatedRows: ordered.slice(1).map(payment => payment.sourceRow),
      field: "payment_id",
      expected: "one row per payment ID",
      actual: `${ordered.length} rows`,
      message: `Payment ${winner.paymentId} appears ${ordered.length} times. Row ${winner.sourceRow} is provisionally allocated; duplicates require review.`,
      messageZh: `回款 ${winner.paymentId} 出现 ${ordered.length} 次。暂分配第 ${winner.sourceRow} 行；重复项需复核。`
    });
  }
  return canonical;
}

function buildSummary(totalOrderRows, parsedOrders, canonicalOrders, totalPaymentRows, parsedPayments, canonicalPayments, matches, exceptions) {
  const currencies = [...new Set([
    ...[...canonicalOrders.values()].map(order => order.currency),
    ...parsedPayments.map(payment => payment.currency)
  ])].sort();
  const currencyTotals = currencies.map(currency => {
    const orders = [...canonicalOrders.values()].filter(order => order.currency === currency);
    const payments = parsedPayments.filter(payment => payment.currency === currency);
    const currencyMatches = matches.filter(match => match.currency === currency);
    const orphanCents = [...canonicalPayments.values()]
      .filter(payment => payment.currency === currency && !canonicalOrders.has(payment.key))
      .reduce((sum, payment) => sum + payment.amountCents, 0);
    const foreignCents = [...canonicalPayments.values()]
      .filter(payment => payment.currency === currency
        && canonicalOrders.has(payment.key)
        && canonicalOrders.get(payment.key).currency !== currency)
      .reduce((sum, payment) => sum + payment.amountCents, 0);
    const duplicateCents = parsedPayments
      .filter(payment => payment.currency === currency && payment.duplicateGroupSize > 1)
      .reduce((sum, payment) => sum + payment.amountCents, 0);
    return {
      currency,
      orderAmount: orders.reduce((sum, order) => sum + order.amountCents, 0) / 100,
      paymentAmount: payments.reduce((sum, payment) => sum + payment.amountCents, 0) / 100,
      matchedAmount: currencyMatches.filter(match => match.status === "matched").reduce((sum, match) => sum + toCents(match.paidAmount), 0) / 100,
      outstandingAmount: currencyMatches.filter(match => match.status === "unpaid").reduce((sum, match) => sum + toCents(match.remainingAmount), 0) / 100,
      overpaidAmount: currencyMatches.filter(match => match.status === "amount_mismatch").reduce((sum, match) => sum - toCents(match.remainingAmount), 0) / 100,
      unmatchedPaymentAmount: (orphanCents + foreignCents + duplicateCents) / 100
    };
  });
  const exceptionsByType = Object.create(null);
  for (const exception of exceptions) {
    exceptionsByType[exception.type] = (exceptionsByType[exception.type] ?? 0) + 1;
  }
  return {
    totalOrderRows,
    validOrderRows: parsedOrders.length,
    uniqueOrders: canonicalOrders.size,
    totalPaymentRows,
    validPaymentRows: parsedPayments.length,
    matchedOrders: matches.filter(match => match.status === "matched").length,
    unpaidOrders: matches.filter(match => match.status === "unpaid").length,
    amountMismatchOrders: matches.filter(match => match.status === "amount_mismatch").length,
    currencyMismatchOrders: matches.filter(match => match.status === "currency_mismatch").length,
    duplicateOrderGroups: [...canonicalOrders.values()].filter(order => order.groupSize > 1).length,
    exceptionCount: exceptions.length,
    exceptionsByType,
    currencyTotals
  };
}

class ExceptionCollector {
  constructor() {
    this.ids = new Set();
    this.exceptions = [];
  }

  add(value) {
    const identity = [value.type, value.companyCode, value.orderId, value.paymentId, value.sourceRow,
      value.relatedRows.join(","), value.field, value.expected, value.actual].join("|");
    const exceptionId = stableId("exc-", identity);
    if (this.ids.has(exceptionId)) return;
    this.ids.add(exceptionId);
    this.exceptions.push({ exceptionId, ...value });
  }
}

function buildAction(type, companyCode, orderId, paymentId, description, descriptionZh) {
  return {
    actionId: stableId("action-", `${type}|${companyCode}|${orderId}|${paymentId}|${description}`),
    type,
    companyCode,
    orderId,
    paymentId,
    status: "planned_not_executed",
    description,
    descriptionZh
  };
}

function groupBy(values, keySelector) {
  const groups = new Map();
  for (const value of values) {
    const key = keySelector(value);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(value);
  }
  return groups;
}

function parseAmount(value, minimumCents) {
  const normalized = value.trim().replace(/,/g, "");
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  let cents = Number(whole || "0") * 100 + Number((fraction + "00").slice(0, 2));
  if (fraction.length > 2 && Number(fraction[2]) >= 5) cents++;
  if (!Number.isSafeInteger(cents) || cents < minimumCents || cents > 999_999_999_999) return null;
  return cents;
}

function formatCents(cents) {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}

function toCents(value) {
  return Math.round(Number(value) * 100);
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function stableId(prefix, value) {
  return prefix + stableHash(value, 2166136261) + stableHash(`${value}|2`, 2246822519) + stableHash(`${value}|3`, 3266489917);
}

function stableHash(value, seed) {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

async function sha256Text(value) {
  return hex(await crypto.subtle.digest("SHA-256", ENCODER.encode(value)));
}

async function sha256Pair(ordersCsv, paymentsCsv) {
  const chunks = [];
  for (const [label, value] of [["orders", ordersCsv], ["payments", paymentsCsv]]) {
    const labelBytes = ENCODER.encode(label);
    chunks.push(encodeSevenBitLength(labelBytes.length), labelBytes);
    const valueBytes = ENCODER.encode(value);
    const length = new Uint8Array(4);
    new DataView(length.buffer).setInt32(0, valueBytes.length, true);
    chunks.push(length, valueBytes);
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}

function encodeSevenBitLength(value) {
  const bytes = [];
  let remaining = value;
  while (remaining >= 128) {
    bytes.push((remaining & 127) | 128);
    remaining >>>= 7;
  }
  bytes.push(remaining);
  return Uint8Array.from(bytes);
}

function hex(bytes) {
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, "0")).join("");
}

const EXCEPTION_NAMES = {
  DUPLICATE_ORDER: ["Duplicate order", "重复订单"],
  AMOUNT_MISMATCH: ["Amount mismatch", "金额不符"],
  MISSING_FIELD: ["Missing field", "缺字段"],
  INVALID_FIELD: ["Invalid field", "字段无效"],
  UNPAID_ORDER: ["Unpaid order", "未回款"],
  PAYMENT_WITHOUT_ORDER: ["Payment without order", "无来源回款"],
  CURRENCY_MISMATCH: ["Currency mismatch", "币种不符"],
  DUPLICATE_PAYMENT: ["Duplicate payment", "重复回款"],
  CSV_STRUCTURE: ["CSV structure", "CSV 结构异常"]
};

export function renderMarkdown(result, language = "both") {
  const english = language === "en" || language === "both";
  const chinese = language === "zh" || language === "both";
  const lines = [];
  lines.push(english && chinese ? "# Reconciliation daily report / 对账日报" : english ? "# Reconciliation daily report" : "# 对账日报", "");
  appendLine(lines, english, chinese, "Run", "运行编号", result.runId);
  appendLine(lines, english, chinese, "Created at (UTC)", "创建时间（UTC）", result.createdAtUtc);
  appendLine(lines, english, chinese, "Rule version", "规则版本", result.ruleVersion);
  appendLine(lines, english, chinese, "Input hash", "输入哈希", result.inputHash);
  appendLine(lines, english, chinese, "Mode", "模式", "browser preview / 浏览器预览");
  lines.push("", english && chinese ? "## Daily summary / 每日汇总" : english ? "## Daily summary" : "## 每日汇总", "");
  lines.push(english && chinese
    ? "| Date | Currency | Orders | Matched | Unpaid | Exceptions | Order amount | Paid amount | Outstanding | 日期 | 币种 |"
    : english
      ? "| Date | Currency | Orders | Matched | Unpaid | Exceptions | Order amount | Paid amount | Outstanding |"
      : "| 日期 | 币种 | 订单数 | 已匹配 | 未回款 | 异常数 | 订单金额 | 回款金额 | 未回款金额 |");
  lines.push(english && chinese ? "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |" : "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");

  const exceptionRows = new Set(result.exceptions.flatMap(exception => [exception.sourceRow, ...exception.relatedRows]));
  const daily = groupBy(result.matches, match => `${match.orderDate}|${match.currency}`);
  const dailyGroups = [...daily.values()].sort((left, right) =>
    left[0].orderDate.localeCompare(right[0].orderDate) || left[0].currency.localeCompare(right[0].currency));
  for (const group of dailyGroups) {
    const cells = [
      group[0].orderDate,
      group[0].currency,
      group.length,
      group.filter(match => match.status === "matched").length,
      group.filter(match => ["unpaid", "amount_mismatch", "currency_mismatch"].includes(match.status)).length,
      group.filter(match => exceptionRows.has(match.orderRow)).length,
      formatCents(group.reduce((sum, match) => sum + toCents(match.orderAmount), 0)),
      formatCents(group.reduce((sum, match) => sum + toCents(match.paidAmount), 0)),
      formatCents(group.filter(match => match.remainingAmount > 0).reduce((sum, match) => sum + toCents(match.remainingAmount), 0))
    ];
    lines.push(`| ${cells.join(" | ")} |`);
  }

  lines.push("", english && chinese ? "## Exception queue / 异常队列" : english ? "## Exception queue" : "## 异常队列", "");
  lines.push(english && chinese ? "| Type | Count | English | 中文 |" : english ? "| Type | Count | Meaning |" : "| 类型 | 数量 | 含义 |");
  lines.push("| --- | ---: | --- | --- |");
  for (const type of Object.keys(result.summary.exceptionsByType).sort()) {
    const names = EXCEPTION_NAMES[type] ?? [type, type];
    lines.push(english && chinese
      ? `| \`${type}\` | ${result.summary.exceptionsByType[type]} | ${names[0]} | ${names[1]} |`
      : english
        ? `| \`${type}\` | ${result.summary.exceptionsByType[type]} | ${names[0]} |`
        : `| \`${type}\` | ${result.summary.exceptionsByType[type]} | ${names[1]} |`);
  }

  lines.push("", english && chinese ? "## Reconciliation totals / 对账合计" : english ? "## Reconciliation totals" : "## 对账合计", "");
  lines.push(english && chinese
    ? "| Currency | Orders | Payments | Matched | Outstanding | Overpaid | Unallocated payments | 币种 |"
    : english
      ? "| Currency | Orders | Payments | Matched | Outstanding | Overpaid | Unallocated payments |"
      : "| 币种 | 订单 | 回款 | 已匹配 | 未回款 | 多付 | 未分配回款 |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const totals of result.summary.currencyTotals) {
    lines.push(`| ${[totals.currency, formatCents(toCents(totals.orderAmount)), formatCents(toCents(totals.paymentAmount)),
      formatCents(toCents(totals.matchedAmount)), formatCents(toCents(totals.outstandingAmount)),
      formatCents(toCents(totals.overpaidAmount)), formatCents(toCents(totals.unmatchedPaymentAmount))].join(" | ")} |`);
  }

  lines.push("", english && chinese ? "## Safety boundary / 安全边界" : english ? "## Safety boundary" : "## 安全边界", "");
  appendLine(lines, english, chinese, "Mode", "模式", "Browser preview mode · no server audit/persistence");
  appendLine(lines, english, chinese, "Production writes", "生产写入", "0 (no ERP, bank, ledger, or production database adapter is installed)");
  appendLine(lines, english, chinese, "Accounting / payment", "记账 / 付款", "not performed / 不执行");
  appendLine(lines, english, chinese, "Data", "数据", "synthetic CSV only / 仅合成 CSV");
  lines.push("");
  appendLine(lines, english, chinese, "Matching policy", "匹配策略",
    "Match by company_code + order_id; sum same-currency payments to two decimals. Duplicate orders provisionally use the earliest date, then the lowest row number, and remain exceptions. No FX conversion.");
  appendLine(lines, english, chinese, "Exceptions", "异常", `${result.summary.exceptionCount} item(s); generated locally. / ${result.summary.exceptionCount} 项；本地生成。`);
  return lines.join("\n");
}

export function renderExceptionsCsv(result) {
  const lines = ["exception_id,type,severity,company_code,order_id,payment_id,source_row,related_rows,field,expected,actual,message_en,message_zh"];
  for (const exception of result.exceptions) {
    lines.push([
      exception.exceptionId,
      exception.type,
      exception.severity,
      exception.companyCode,
      exception.orderId,
      exception.paymentId,
      exception.sourceRow,
      exception.relatedRows.join(";"),
      exception.field,
      exception.expected,
      exception.actual,
      exception.message,
      exception.messageZh
    ].map(escapeCsv).join(","));
  }
  return lines.join("\n");
}

function appendLine(lines, english, chinese, labelEn, labelZh, value) {
  lines.push(english && chinese ? `- **${labelEn} / ${labelZh}**: ${value}` : english ? `- **${labelEn}**: ${value}` : `- **${labelZh}**: ${value}`);
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
