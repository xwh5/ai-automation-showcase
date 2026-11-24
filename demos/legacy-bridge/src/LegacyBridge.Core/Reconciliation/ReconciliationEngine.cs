using System.Globalization;

namespace LegacyBridge.Core.Reconciliation;

public sealed class ReconciliationEngine
{
    private static readonly string[] OrderHeaders =
        ["order_id", "company_code", "order_date", "currency", "amount", "customer_ref", "status"];

    private static readonly string[] OrderRequiredHeaders =
        ["order_id", "company_code", "order_date", "currency", "amount"];

    private static readonly string[] PaymentHeaders =
        ["payment_id", "company_code", "order_id", "payment_date", "currency", "amount", "reference"];

    private static readonly string[] PaymentRequiredHeaders =
        ["payment_id", "company_code", "order_id", "payment_date", "currency", "amount"];

    public ReconciliationResult Reconcile(string ordersCsv, string paymentsCsv, bool dryRun)
    {
        var ordersDocument = CsvParser.Parse(ordersCsv, OrderRequiredHeaders);
        var paymentsDocument = CsvParser.Parse(paymentsCsv, PaymentRequiredHeaders);
        var collector = new ExceptionCollector();

        var parsedOrders = ordersDocument.Rows
            .Select(row => ParseOrder(row, collector))
            .Where(order => order is not null)
            .Select(order => order!)
            .ToList();

        var parsedPayments = paymentsDocument.Rows
            .Select(row => ParsePayment(row, collector))
            .Where(payment => payment is not null)
            .Select(payment => payment!)
            .ToList();

        var canonicalOrders = SelectCanonicalOrders(parsedOrders, collector);
        var canonicalPayments = SelectCanonicalPayments(parsedPayments, collector);
        var matches = new List<ReconciliationMatch>();
        var actions = new List<PlannedAction>();

        foreach (var order in canonicalOrders.Values.OrderBy(value => value.CompanyCode).ThenBy(value => value.OrderId))
        {
            var candidatePayments = canonicalPayments.Values
                .Where(payment => payment.Key == order.Key)
                .OrderBy(payment => payment.PaymentDate)
                .ThenBy(payment => payment.SourceRow)
                .ToList();
            var sameCurrencyPayments = candidatePayments
                .Where(payment => payment.Currency == order.Currency)
                .ToList();
            var foreignCurrencyPayments = candidatePayments
                .Where(payment => payment.Currency != order.Currency)
                .ToList();

            foreach (var foreign in foreignCurrencyPayments)
            {
                collector.Add(
                    RuleCatalog.CurrencyMismatch,
                    "error",
                    foreign.CompanyCode,
                    foreign.OrderId,
                    foreign.PaymentId,
                    foreign.SourceRow,
                    [],
                    "currency",
                    order.Currency,
                    foreign.Currency,
                    $"Payment {foreign.PaymentId} uses {foreign.Currency}; order {order.OrderId} uses {order.Currency}. No FX conversion is performed.",
                    $"回款 {foreign.PaymentId} 使用 {foreign.Currency}，订单 {order.OrderId} 使用 {order.Currency}；不执行汇率换算。");
                actions.Add(BuildAction("WOULD_QUEUE_REVIEW", order.CompanyCode, order.OrderId, foreign.PaymentId,
                    "Review a cross-currency payment manually.", "人工复核跨币种回款。"));
            }

            var paidAmount = Money.Round(sameCurrencyPayments.Sum(payment => payment.Amount));
            var difference = Money.Round(order.Amount - paidAmount);
            var status = paidAmount == 0m && foreignCurrencyPayments.Count > 0
                ? "currency_mismatch"
                : difference switch
                {
                    < 0m => "amount_mismatch",
                    0m => "matched",
                    _ => "unpaid"
                };

            if (status == "amount_mismatch")
            {
                collector.Add(
                    RuleCatalog.AmountMismatch,
                    "error",
                    order.CompanyCode,
                    order.OrderId,
                    string.Empty,
                    order.SourceRow,
                    sameCurrencyPayments.Select(payment => payment.SourceRow).ToArray(),
                    "amount",
                    Money.Format(order.Amount),
                    Money.Format(paidAmount),
                    $"Order {order.OrderId} is {order.Currency} {Money.Format(order.Amount)}, but allocated payments total {Money.Format(paidAmount)} (overpaid by {Money.Format(-difference)}).",
                    $"订单 {order.OrderId} 金额为 {order.Currency} {Money.Format(order.Amount)}，已分配回款合计 {Money.Format(paidAmount)}，多付 {Money.Format(-difference)}。");
            }
            else if (status == "unpaid")
            {
                collector.Add(
                    RuleCatalog.UnpaidOrder,
                    "warning",
                    order.CompanyCode,
                    order.OrderId,
                    string.Empty,
                    order.SourceRow,
                    sameCurrencyPayments.Select(payment => payment.SourceRow).ToArray(),
                    "amount",
                    Money.Format(order.Amount),
                    Money.Format(paidAmount),
                    $"Order {order.OrderId} has an outstanding balance of {order.Currency} {Money.Format(difference)}.",
                    $"订单 {order.OrderId} 尚有 {order.Currency} {Money.Format(difference)} 未回款。");
            }

            matches.Add(new ReconciliationMatch(
                order.MatchId,
                order.CompanyCode,
                order.OrderId,
                order.SourceRow,
                order.OrderDate,
                order.Currency,
                order.Amount,
                paidAmount,
                difference,
                status,
                sameCurrencyPayments.Select(payment => payment.PaymentId).ToArray(),
                sameCurrencyPayments.Select(payment => payment.SourceRow).ToArray(),
                Math.Max(0, order.GroupSize - 1)));

            actions.Add(status == "matched"
                ? BuildAction("WOULD_CREATE_ERP_ORDER", order.CompanyCode, order.OrderId, string.Empty,
                    "Stage a matched order for a future bridge adapter; no ERP write is executed.",
                    "将已匹配订单暂存给未来桥接适配器；不执行 ERP 写入。")
                : BuildAction("WOULD_QUEUE_REVIEW", order.CompanyCode, order.OrderId, string.Empty,
                    "Queue the order for manual reconciliation review.", "将订单加入人工对账复核队列。"));
        }

        foreach (var payment in canonicalPayments.Values
                     .Where(payment => !canonicalOrders.ContainsKey(payment.Key))
                     .OrderBy(value => value.CompanyCode)
                     .ThenBy(value => value.PaymentId))
        {
            collector.Add(
                RuleCatalog.PaymentWithoutOrder,
                "error",
                payment.CompanyCode,
                payment.OrderId,
                payment.PaymentId,
                payment.SourceRow,
                [],
                "order_id",
                "an existing order in the same company",
                payment.Key,
                $"Payment {payment.PaymentId} has no source order {payment.OrderId} in company {payment.CompanyCode}.",
                $"回款 {payment.PaymentId} 在公司 {payment.CompanyCode} 中找不到来源订单 {payment.OrderId}。");
            actions.Add(BuildAction("WOULD_QUEUE_REVIEW", payment.CompanyCode, payment.OrderId, payment.PaymentId,
                "Investigate a payment with no source order; do not auto-post it.", "核查无来源订单的回款；不自动入账。"));
        }

        foreach (var payment in parsedPayments.Where(payment => payment.DuplicateGroupSize > 1))
        {
            actions.Add(BuildAction("WOULD_QUEUE_REVIEW", payment.CompanyCode, payment.OrderId, payment.PaymentId,
                "Review a duplicate payment before allocation.", "分配前复核重复回款。"));
        }

        var ordersHash = Fingerprint.HashText(ordersCsv);
        var paymentsHash = Fingerprint.HashText(paymentsCsv);
        var inputHash = Fingerprint.HashPair(ordersCsv, paymentsCsv);
        var summary = BuildSummary(
            ordersDocument.Rows.Count,
            parsedOrders,
            canonicalOrders,
            paymentsDocument.Rows.Count,
            parsedPayments,
            canonicalPayments,
            matches,
            collector.Exceptions);

        return new ReconciliationResult(
            "run-" + inputHash[..24],
            inputHash,
            ordersHash,
            paymentsHash,
            RuleCatalog.Version,
            DateTimeOffset.UtcNow,
            dryRun,
            summary,
            matches,
            collector.Exceptions,
            actions,
            new ExecutionSummary(
                dryRun,
                true,
                0,
                dryRun
                    ? "Dry-run: reconciliation ran against local SQLite staging only; no production writes were attempted."
                    : "Simulation only: the future-write plan was recorded, but this demo has no production adapter and performed zero writes.",
                dryRun
                    ? "预演模式：仅使用本地 SQLite 暂存执行对账，未尝试写入生产系统。"
                    : "仅模拟：已记录未来写入计划，但本 demo 没有生产适配器，实际写入数为 0。"),
            ordersDocument.Rows,
            paymentsDocument.Rows);
    }

    private static ParsedOrder? ParseOrder(StagedCsvRow row, ExceptionCollector collector)
    {
        foreach (var error in row.StructuralErrors)
        {
            collector.Add(RuleCatalog.CsvStructure, "error", row.Get("company_code"), row.Get("order_id"), string.Empty,
                row.RowNumber, [], "csv", "one value per header column", error,
                "The CSV row does not match the header width.", "CSV 行列数与表头不一致。");
        }

        var required = new[] { "order_id", "company_code", "order_date", "currency", "amount" };
        var hasError = row.StructuralErrors.Count > 0;
        foreach (var field in required)
        {
            if (!string.IsNullOrWhiteSpace(row.Get(field)))
            {
                continue;
            }

            hasError = true;
            collector.Add(RuleCatalog.MissingField, "error", row.Get("company_code"), row.Get("order_id"), string.Empty,
                row.RowNumber, [], field, "a non-empty value", string.Empty,
                $"Order row {row.RowNumber} is missing {field}.", $"订单第 {row.RowNumber} 行缺少字段 {field}。");
        }

        var company = row.Get("company_code").Trim().ToUpperInvariant();
        var orderId = row.Get("order_id").Trim().ToUpperInvariant();
        var currency = row.Get("currency").Trim().ToUpperInvariant();
        if (!string.IsNullOrWhiteSpace(row.Get("currency"))
            && (currency.Length != 3 || !currency.All(char.IsAsciiLetter)))
        {
            hasError = true;
            collector.Add(RuleCatalog.InvalidField, "error", company, orderId, string.Empty, row.RowNumber, [], "currency",
                "a three-letter ISO currency code", currency,
                $"Order row {row.RowNumber} has an invalid currency.", $"订单第 {row.RowNumber} 行币种格式无效。");
        }

        if (!string.IsNullOrWhiteSpace(row.Get("order_date"))
            && !DateOnly.TryParseExact(row.Get("order_date").Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out _))
        {
            hasError = true;
            collector.Add(RuleCatalog.InvalidField, "error", company, orderId, string.Empty, row.RowNumber, [], "order_date",
                "yyyy-MM-dd", row.Get("order_date"),
                $"Order row {row.RowNumber} has an invalid date.", $"订单第 {row.RowNumber} 行日期格式无效。");
        }

        if (!string.IsNullOrWhiteSpace(row.Get("amount")) && !Money.TryParse(row.Get("amount"), 0m, out _))
        {
            hasError = true;
            collector.Add(RuleCatalog.InvalidField, "error", company, orderId, string.Empty, row.RowNumber, [], "amount",
                "a non-negative amount with at most two decimals", row.Get("amount"),
                $"Order row {row.RowNumber} has an invalid amount.", $"订单第 {row.RowNumber} 行金额格式无效。");
        }

        if (hasError)
        {
            return null;
        }

        var date = DateOnly.ParseExact(row.Get("order_date").Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture);
        Money.TryParse(row.Get("amount"), 0m, out var amount);
        return new ParsedOrder($"{company}|{orderId}", orderId, company, date, currency, amount, row.RowNumber, 1);
    }

    private static ParsedPayment? ParsePayment(StagedCsvRow row, ExceptionCollector collector)
    {
        foreach (var error in row.StructuralErrors)
        {
            collector.Add(RuleCatalog.CsvStructure, "error", row.Get("company_code"), row.Get("order_id"), row.Get("payment_id"),
                row.RowNumber, [], "csv", "one value per header column", error,
                "The CSV row does not match the header width.", "CSV 行列数与表头不一致。");
        }

        var required = new[] { "payment_id", "company_code", "order_id", "payment_date", "currency", "amount" };
        var hasError = row.StructuralErrors.Count > 0;
        foreach (var field in required)
        {
            if (!string.IsNullOrWhiteSpace(row.Get(field)))
            {
                continue;
            }

            hasError = true;
            collector.Add(RuleCatalog.MissingField, "error", row.Get("company_code"), row.Get("order_id"), row.Get("payment_id"),
                row.RowNumber, [], field, "a non-empty value", string.Empty,
                $"Payment row {row.RowNumber} is missing {field}.", $"回款第 {row.RowNumber} 行缺少字段 {field}。");
        }

        var company = row.Get("company_code").Trim().ToUpperInvariant();
        var orderId = row.Get("order_id").Trim().ToUpperInvariant();
        var paymentId = row.Get("payment_id").Trim().ToUpperInvariant();
        var currency = row.Get("currency").Trim().ToUpperInvariant();
        if (!string.IsNullOrWhiteSpace(row.Get("currency"))
            && (currency.Length != 3 || !currency.All(char.IsAsciiLetter)))
        {
            hasError = true;
            collector.Add(RuleCatalog.InvalidField, "error", company, orderId, paymentId, row.RowNumber, [], "currency",
                "a three-letter ISO currency code", currency,
                $"Payment row {row.RowNumber} has an invalid currency.", $"回款第 {row.RowNumber} 行币种格式无效。");
        }

        if (!string.IsNullOrWhiteSpace(row.Get("payment_date"))
            && !DateOnly.TryParseExact(row.Get("payment_date").Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out _))
        {
            hasError = true;
            collector.Add(RuleCatalog.InvalidField, "error", company, orderId, paymentId, row.RowNumber, [], "payment_date",
                "yyyy-MM-dd", row.Get("payment_date"),
                $"Payment row {row.RowNumber} has an invalid date.", $"回款第 {row.RowNumber} 行日期格式无效。");
        }

        if (!string.IsNullOrWhiteSpace(row.Get("amount")) && !Money.TryParse(row.Get("amount"), 0.01m, out _))
        {
            hasError = true;
            collector.Add(RuleCatalog.InvalidField, "error", company, orderId, paymentId, row.RowNumber, [], "amount",
                "a positive amount with at most two decimals", row.Get("amount"),
                $"Payment row {row.RowNumber} has an invalid amount.", $"回款第 {row.RowNumber} 行金额格式无效。");
        }

        if (hasError)
        {
            return null;
        }

        var date = DateOnly.ParseExact(row.Get("payment_date").Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture);
        Money.TryParse(row.Get("amount"), 0.01m, out var amount);
        return new ParsedPayment(paymentId, $"{company}|{orderId}", orderId, company, date, currency, amount, row.RowNumber, 1);
    }

    private static Dictionary<string, ParsedOrder> SelectCanonicalOrders(
        IReadOnlyList<ParsedOrder> orders,
        ExceptionCollector collector)
    {
        var canonical = new Dictionary<string, ParsedOrder>(StringComparer.Ordinal);
        foreach (var group in orders.GroupBy(order => order.Key).OrderBy(group => group.Key, StringComparer.Ordinal))
        {
            var ordered = group.OrderBy(order => order.OrderDate).ThenBy(order => order.SourceRow).ToList();
            var winner = ordered[0];
            canonical[group.Key] = winner with { GroupSize = ordered.Count };
            if (ordered.Count <= 1)
            {
                continue;
            }

            collector.Add(
                RuleCatalog.DuplicateOrder,
                "error",
                winner.CompanyCode,
                winner.OrderId,
                string.Empty,
                winner.SourceRow,
                ordered.Skip(1).Select(order => order.SourceRow).ToArray(),
                "order_id",
                "one row per company and order",
                $"{ordered.Count} rows",
                $"Order {winner.OrderId} appears {ordered.Count} times. Row {winner.SourceRow} (earliest date, then lowest row) is the provisional match basis; all duplicates require review.",
                $"订单 {winner.OrderId} 出现 {ordered.Count} 次。暂以第 {winner.SourceRow} 行（日期最早、其次行号最小）作为匹配基准；全部重复项均需复核。");
        }

        return canonical;
    }

    private static Dictionary<string, ParsedPayment> SelectCanonicalPayments(
        IReadOnlyList<ParsedPayment> payments,
        ExceptionCollector collector)
    {
        var canonical = new Dictionary<string, ParsedPayment>(StringComparer.Ordinal);
        foreach (var group in payments.GroupBy(payment => payment.PaymentId).OrderBy(group => group.Key, StringComparer.Ordinal))
        {
            var ordered = group.OrderBy(payment => payment.PaymentDate).ThenBy(payment => payment.SourceRow).ToList();
            var winner = ordered[0];
            canonical[group.Key] = winner with { DuplicateGroupSize = ordered.Count };
            if (ordered.Count <= 1)
            {
                continue;
            }

            collector.Add(
                RuleCatalog.DuplicatePayment,
                "error",
                winner.CompanyCode,
                winner.OrderId,
                winner.PaymentId,
                winner.SourceRow,
                ordered.Skip(1).Select(payment => payment.SourceRow).ToArray(),
                "payment_id",
                "one row per payment ID",
                $"{ordered.Count} rows",
                $"Payment {winner.PaymentId} appears {ordered.Count} times. Row {winner.SourceRow} is provisionally allocated; duplicates require review.",
                $"回款 {winner.PaymentId} 出现 {ordered.Count} 次。暂分配第 {winner.SourceRow} 行；重复项需复核。");
        }

        return canonical;
    }

    private static ReconciliationSummary BuildSummary(
        int totalOrderRows,
        IReadOnlyList<ParsedOrder> parsedOrders,
        IReadOnlyDictionary<string, ParsedOrder> canonicalOrders,
        int totalPaymentRows,
        IReadOnlyList<ParsedPayment> parsedPayments,
        IReadOnlyDictionary<string, ParsedPayment> canonicalPayments,
        IReadOnlyList<ReconciliationMatch> matches,
        IReadOnlyList<ReconciliationException> exceptions)
    {
        var currencies = canonicalOrders.Values.Select(order => order.Currency)
            .Union(parsedPayments.Select(payment => payment.Currency), StringComparer.Ordinal)
            .OrderBy(currency => currency, StringComparer.Ordinal)
            .ToArray();
        var currencyTotals = currencies.Select(currency =>
        {
            var orders = canonicalOrders.Values.Where(order => order.Currency == currency).ToList();
            var payments = parsedPayments.Where(payment => payment.Currency == currency).ToList();
            var currencyMatches = matches.Where(match => match.Currency == currency).ToList();
            var orphanAmount = canonicalPayments.Values
                .Where(payment => payment.Currency == currency && !canonicalOrders.ContainsKey(payment.Key))
                .Sum(payment => payment.Amount);
            var foreignAmount = canonicalPayments.Values
                .Where(payment => payment.Currency == currency
                    && canonicalOrders.TryGetValue(payment.Key, out var order)
                    && order.Currency != currency)
                .Sum(payment => payment.Amount);
            var duplicateAmount = parsedPayments
                .Where(payment => payment.Currency == currency && payment.DuplicateGroupSize > 1)
                .Sum(payment => payment.Amount);

            return new CurrencyTotals(
                currency,
                Money.Round(orders.Sum(order => order.Amount)),
                Money.Round(payments.Sum(payment => payment.Amount)),
                Money.Round(currencyMatches.Where(match => match.Status == "matched").Sum(match => match.PaidAmount)),
                Money.Round(currencyMatches.Where(match => match.Status == "unpaid").Sum(match => match.RemainingAmount)),
                Money.Round(currencyMatches.Where(match => match.Status == "amount_mismatch").Sum(match => -match.RemainingAmount)),
                Money.Round(orphanAmount + foreignAmount + duplicateAmount));
        }).ToArray();

        return new ReconciliationSummary(
            totalOrderRows,
            parsedOrders.Count,
            canonicalOrders.Count,
            totalPaymentRows,
            parsedPayments.Count,
            matches.Count(match => match.Status == "matched"),
            matches.Count(match => match.Status == "unpaid"),
            matches.Count(match => match.Status == "amount_mismatch"),
            matches.Count(match => match.Status == "currency_mismatch"),
            canonicalOrders.Values.Count(order => order.GroupSize > 1),
            exceptions.Count,
            exceptions.GroupBy(exception => exception.Type)
                .ToDictionary(group => group.Key, group => group.Count(), StringComparer.Ordinal),
            currencyTotals);
    }

    private static PlannedAction BuildAction(
        string type,
        string companyCode,
        string orderId,
        string paymentId,
        string description,
        string descriptionZh)
    {
        var identity = $"{type}|{companyCode}|{orderId}|{paymentId}|{description}";
        return new PlannedAction("action-" + Fingerprint.HashText(identity)[..20], type, companyCode, orderId, paymentId,
            "planned_not_executed", description, descriptionZh);
    }

    private sealed class ExceptionCollector
    {
        private readonly HashSet<string> _ids = new(StringComparer.Ordinal);
        public List<ReconciliationException> Exceptions { get; } = [];

        public void Add(
            string type,
            string severity,
            string companyCode,
            string orderId,
            string paymentId,
            int sourceRow,
            IReadOnlyList<int> relatedRows,
            string field,
            string expected,
            string actual,
            string message,
            string messageZh)
        {
            var identity = string.Join("|", type, companyCode, orderId, paymentId, sourceRow,
                string.Join(",", relatedRows), field, expected, actual);
            var id = "exc-" + Fingerprint.HashText(identity)[..20];
            if (!_ids.Add(id))
            {
                return;
            }

            Exceptions.Add(new ReconciliationException(id, type, severity, companyCode, orderId, paymentId,
                sourceRow, relatedRows, field, expected, actual, message, messageZh));
        }
    }
}
