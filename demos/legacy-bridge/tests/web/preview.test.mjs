import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CsvFormatException,
  RULE_VERSION,
  parseCsv,
  reconcileCsv,
  renderExceptionsCsv,
  renderMarkdown
} from "../../web/reconcile.js";

const ORDER_HEADER = "order_id,company_code,order_date,currency,amount,customer_ref,status";
const PAYMENT_HEADER = "payment_id,company_code,order_id,payment_date,currency,amount,reference";
const orders = rows => `${ORDER_HEADER}\n${rows.join("\n")}\n`;
const payments = rows => `${PAYMENT_HEADER}\n${rows.join("\n")}\n`;
const order = (id = "ORD-1", company = "SYN-A", date = "2026-11-17", currency = "CNY", amount = "100.00") =>
  `${id},${company},${date},${currency},${amount},SYN-CUSTOMER,confirmed`;
const payment = (id = "PAY-1", company = "SYN-A", orderId = "ORD-1", date = "2026-11-18", currency = "CNY", amount = "100.00") =>
  `${id},${company},${orderId},${date},${currency},${amount},SYN-REF`;

async function fixtures() {
  const [ordersCsv, paymentsCsv] = await Promise.all([
    readFile(new URL("../../fixtures/orders.csv", import.meta.url), "utf8"),
    readFile(new URL("../../fixtures/payments.csv", import.meta.url), "utf8")
  ]);
  return { ordersCsv, paymentsCsv };
}

test("synthetic fixture matches the API rule totals and SHA-256 input hash", async () => {
  const { ordersCsv, paymentsCsv } = await fixtures();
  const result = await reconcileCsv(ordersCsv, paymentsCsv);

  assert.equal(result.ruleVersion, RULE_VERSION);
  assert.equal(result.inputHash, "08203c44c3b98b9a2d72eb6199c32936d8a5b039b512ee09579bac002dda0873");
  assert.match(result.runId, /^preview-[a-f0-9]{24}$/);
  assert.equal(result.summary.totalOrderRows, 100);
  assert.equal(result.summary.totalPaymentRows, 70);
  assert.equal(result.summary.validOrderRows, 97);
  assert.equal(result.summary.validPaymentRows, 68);
  assert.equal(result.summary.uniqueOrders, 96);
  assert.equal(result.summary.matchedOrders, 63);
  assert.equal(result.summary.unpaidOrders, 32);
  assert.equal(result.summary.amountMismatchOrders, 1);
  assert.equal(result.summary.duplicateOrderGroups, 1);
  assert.equal(result.summary.exceptionCount, 41);
  assert.equal(result.summary.exceptionsByType.DUPLICATE_ORDER, 1);
  assert.equal(result.summary.exceptionsByType.AMOUNT_MISMATCH, 1);
  assert.equal(result.summary.exceptionsByType.MISSING_FIELD, 5);
  assert.equal(result.summary.exceptionsByType.UNPAID_ORDER, 32);
  assert.equal(result.summary.exceptionsByType.PAYMENT_WITHOUT_ORDER, 2);
  assert.equal(result.execution.productionWrites, 0);
  assert.equal(result.plannedActions.length, 98);
});

test("exact and split payments match without crossing company boundaries", async () => {
  const result = await reconcileCsv(
    orders([order("ORD-1", "SYN-A", "2026-11-17", "CNY", "100.00"), order("ORD-1", "SYN-B", "2026-11-17", "CNY", "200.00")]),
    payments([
      payment("PAY-1", "SYN-A", "ORD-1", "2026-11-18", "CNY", "30.10"),
      payment("PAY-2", "SYN-A", "ORD-1", "2026-11-19", "CNY", "69.90"),
      payment("PAY-3", "SYN-B", "ORD-1", "2026-11-18", "CNY", "200.00")
    ])
  );

  assert.equal(result.summary.matchedOrders, 2);
  assert.equal(result.summary.exceptionCount, 0);
  assert.equal(result.matches.find(match => match.companyCode === "SYN-A").paidAmount, 100);
  assert.equal(result.matches.find(match => match.companyCode === "SYN-A").paymentIds.length, 2);
});

test("duplicate, overpayment, unpaid, orphan, and missing-field rules are enforced", async () => {
  const result = await reconcileCsv(
    orders([
      order("ORD-DUP", "SYN-A", "2026-11-19", "CNY", "100.00"),
      order("ORD-DUP", "SYN-A", "2026-11-17", "CNY", "100.00"),
      order("ORD-OVER", "SYN-A", "2026-11-17", "CNY", "100.00"),
      order("ORD-PART", "SYN-A", "2026-11-17", "CNY", "200.00"),
      order("ORD-MISSING", "SYN-A", "2026-11-17", "CNY", "")
    ]),
    payments([
      payment("PAY-DUP", "SYN-A", "ORD-DUP", "2026-11-18", "CNY", "100.00"),
      payment("PAY-OVER", "SYN-A", "ORD-OVER", "2026-11-18", "CNY", "125.50"),
      payment("PAY-PART", "SYN-A", "ORD-PART", "2026-11-18", "CNY", "40.00"),
      payment("PAY-ORPHAN", "SYN-A", "ORD-NONE", "2026-11-18", "CNY", "77.00")
    ])
  );

  assert.equal(result.summary.duplicateOrderGroups, 1);
  assert.equal(result.summary.amountMismatchOrders, 1);
  assert.equal(result.summary.unpaidOrders, 1);
  assert.equal(result.summary.exceptionsByType.PAYMENT_WITHOUT_ORDER, 1);
  assert.equal(result.summary.exceptionsByType.MISSING_FIELD, 1);
  assert.equal(result.matches.find(match => match.orderId === "ORD-OVER").remainingAmount, -25.5);
  assert.equal(result.matches.find(match => match.orderId === "ORD-PART").remainingAmount, 160);
});

test("identical input has identical business output and preview id", async () => {
  const ordersCsv = orders([order()]);
  const paymentsCsv = payments([payment()]);
  const first = await reconcileCsv(ordersCsv, paymentsCsv);
  const second = await reconcileCsv(ordersCsv, paymentsCsv);

  assert.equal(first.runId, second.runId);
  assert.equal(first.inputHash, second.inputHash);
  assert.deepEqual(first.summary, second.summary);
  assert.deepEqual(first.matches, second.matches);
  assert.deepEqual(first.exceptions, second.exceptions);
  assert.equal(first.execution.simulationOnly, true);
  assert.equal((await reconcileCsv(ordersCsv, paymentsCsv, false)).execution.productionWrites, 0);
});

test("CSV parser handles quoted commas, escaped quotes, newlines, and malformed widths", () => {
  const parsed = parseCsv(
    `${ORDER_HEADER}\nORD-1,SYN-A,2026-11-17,CNY,100.00,"Customer, ""North""",confirmed\n` +
      "ORD-2,SYN-A,2026-11-18,CNY,200.00,\"line one\nline two\",confirmed,extra\n",
    ["order_id", "company_code", "order_date", "currency", "amount"]
  );
  assert.equal(parsed.rows[0].get("customer_ref"), "Customer, \"North\"");
  assert.equal(parsed.rows[1].get("customer_ref"), "line one\nline two");
  assert.equal(parsed.rows[1].rowNumber, 3);
  assert.match(parsed.rows[1].structuralErrors[0], /CSV_COLUMN_COUNT/);
  assert.throws(() => parseCsv("order_id,company_code\nORD-1,SYN-A\n", ["order_id", "amount"]), CsvFormatException);
});

test("browser exports are bilingual and disclose preview boundaries", async () => {
  const result = await reconcileCsv(orders([order()]), payments([payment("PAY-MISSING", "SYN-A", "ORD-1", "2026-11-18", "CNY", "")]));
  const report = renderMarkdown(result, "both");
  const csv = renderExceptionsCsv(result);

  assert.match(report, /Reconciliation daily report \/ 对账日报/);
  assert.match(report, /Browser preview mode · no server audit\/persistence/);
  assert.match(report, /生产写入/);
  assert.match(csv, /^exception_id,type,severity/);
  assert.match(csv, /UNPAID_ORDER/);
  assert.match(csv, /未回款/);
});
