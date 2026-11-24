using System.Globalization;
using System.Text;

namespace LegacyBridge.Core.Reconciliation;

public static class ReportRenderer
{
    private static readonly IReadOnlyDictionary<string, (string English, string Chinese)> ExceptionNames =
        new Dictionary<string, (string, string)>(StringComparer.Ordinal)
        {
            [RuleCatalog.DuplicateOrder] = ("Duplicate order", "重复订单"),
            [RuleCatalog.AmountMismatch] = ("Amount mismatch", "金额不符"),
            [RuleCatalog.MissingField] = ("Missing field", "缺字段"),
            [RuleCatalog.InvalidField] = ("Invalid field", "字段无效"),
            [RuleCatalog.UnpaidOrder] = ("Unpaid order", "未回款"),
            [RuleCatalog.PaymentWithoutOrder] = ("Payment without order", "无来源回款"),
            [RuleCatalog.CurrencyMismatch] = ("Currency mismatch", "币种不符"),
            [RuleCatalog.DuplicatePayment] = ("Duplicate payment", "重复回款"),
            [RuleCatalog.CsvStructure] = ("CSV structure", "CSV 结构异常")
        };

    public static string RenderMarkdown(ReconciliationResult result, string language = "both")
    {
        var english = language is "en" or "both";
        var chinese = language is "zh" or "both";
        var builder = new StringBuilder();
        builder.AppendLine(english ? "# Reconciliation daily report" : "# 对账日报");
        if (english && chinese)
        {
            builder.AppendLine("# Reconciliation daily report / 对账日报");
        }

        builder.AppendLine();
        AppendLine(builder, english, chinese, "Run", "运行编号", result.RunId);
        AppendLine(builder, english, chinese, "Created at (UTC)", "创建时间（UTC）", result.CreatedAtUtc.ToString("O", CultureInfo.InvariantCulture));
        AppendLine(builder, english, chinese, "Rule version", "规则版本", result.RuleVersion);
        AppendLine(builder, english, chinese, "Input hash", "输入哈希", result.InputHash);
        AppendLine(builder, english, chinese, "Mode", "模式", result.DryRun ? "dry-run / 预演" : "simulation only / 仅模拟");
        builder.AppendLine();
        builder.AppendLine(english && chinese
            ? "## Daily summary / 每日汇总"
            : english ? "## Daily summary" : "## 每日汇总");
        builder.AppendLine();
        builder.AppendLine(english && chinese
            ? "| Date | Currency | Orders | Matched | Unpaid | Exceptions | Order amount | Paid amount | Outstanding | 日期 | 币种 |"
            : english
                ? "| Date | Currency | Orders | Matched | Unpaid | Exceptions | Order amount | Paid amount | Outstanding |"
                : "| 日期 | 币种 | 订单数 | 已匹配 | 未回款 | 异常数 | 订单金额 | 回款金额 | 未回款金额 |");
        builder.AppendLine(english && chinese
            ? "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |"
            : "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");

        var exceptionRowsByOrder = result.Exceptions
            .Where(exception => exception.SourceRow > 0)
            .SelectMany(exception => new[] { exception.SourceRow }.Concat(exception.RelatedRows))
            .ToHashSet();
        var dailyRows = result.Matches
            .GroupBy(match => (match.OrderDate, match.Currency))
            .OrderBy(group => group.Key.OrderDate)
            .ThenBy(group => group.Key.Currency, StringComparer.Ordinal);
        foreach (var group in dailyRows)
        {
            var rows = group.ToList();
            var exceptionCount = rows.Count(match => exceptionRowsByOrder.Contains(match.OrderRow));
            var cells = new[]
            {
                group.Key.OrderDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                group.Key.Currency,
                rows.Count.ToString(CultureInfo.InvariantCulture),
                rows.Count(match => match.Status == "matched").ToString(CultureInfo.InvariantCulture),
                rows.Count(match => match.Status is "unpaid" or "amount_mismatch" or "currency_mismatch").ToString(CultureInfo.InvariantCulture),
                exceptionCount.ToString(CultureInfo.InvariantCulture),
                Money.Format(rows.Sum(match => match.OrderAmount)),
                Money.Format(rows.Sum(match => match.PaidAmount)),
                Money.Format(rows.Where(match => match.RemainingAmount > 0m).Sum(match => match.RemainingAmount))
            };
            builder.AppendLine("| " + string.Join(" | ", cells) + " |");
        }

        builder.AppendLine();
        builder.AppendLine(english && chinese
            ? "## Exception queue / 异常队列"
            : english ? "## Exception queue" : "## 异常队列");
        builder.AppendLine();
        builder.AppendLine(english && chinese
            ? "| Type | Count | English | 中文 |"
            : english ? "| Type | Count | Meaning |" : "| 类型 | 数量 | 含义 |");
        builder.AppendLine("| --- | ---: | --- | --- |");
        foreach (var group in result.Summary.ExceptionsByType.OrderBy(pair => pair.Key, StringComparer.Ordinal))
        {
            var names = ExceptionNames.GetValueOrDefault(group.Key, (group.Key, group.Key));
            builder.AppendLine(english && chinese
                ? $"| `{group.Key}` | {group.Value} | {names.Item1} | {names.Item2} |"
                : english
                    ? $"| `{group.Key}` | {group.Value} | {names.Item1} |"
                    : $"| `{group.Key}` | {group.Value} | {names.Item2} |");
        }

        builder.AppendLine();
        builder.AppendLine(english && chinese
            ? "## Reconciliation totals / 对账合计"
            : english ? "## Reconciliation totals" : "## 对账合计");
        builder.AppendLine();
        builder.AppendLine(english && chinese
            ? "| Currency | Orders | Payments | Matched | Outstanding | Overpaid | Unallocated payments | 币种 |"
            : english
                ? "| Currency | Orders | Payments | Matched | Outstanding | Overpaid | Unallocated payments |"
                : "| 币种 | 订单 | 回款 | 已匹配 | 未回款 | 多付 | 未分配回款 |");
        builder.AppendLine("| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
        foreach (var totals in result.Summary.CurrencyTotals)
        {
            var cells = new[]
            {
                totals.Currency,
                Money.Format(totals.OrderAmount),
                Money.Format(totals.PaymentAmount),
                Money.Format(totals.MatchedAmount),
                Money.Format(totals.OutstandingAmount),
                Money.Format(totals.OverpaidAmount),
                Money.Format(totals.UnmatchedPaymentAmount)
            };
            builder.AppendLine("| " + string.Join(" | ", cells) + " |");
        }

        builder.AppendLine();
        builder.AppendLine(english && chinese
            ? "## Safety boundary / 安全边界"
            : english ? "## Safety boundary" : "## 安全边界");
        builder.AppendLine();
        AppendLine(builder, english, chinese, "Production writes", "生产写入", "0 (no ERP, bank, ledger, or production database adapter is installed)");
        AppendLine(builder, english, chinese, "Accounting / payment", "记账 / 付款", "not performed / 不执行");
        AppendLine(builder, english, chinese, "Data", "数据", "synthetic CSV only / 仅合成 CSV");
        builder.AppendLine();
        AppendLine(builder, english, chinese, "Matching policy", "匹配策略",
            "Match by company_code + order_id; sum same-currency payments to two decimals. Duplicate orders provisionally use the earliest date, then the lowest row number, and remain exceptions. No FX conversion.");
        AppendLine(builder, english, chinese, "Exceptions", "异常",
            $"{result.Summary.ExceptionCount} item(s); see exceptions.csv. / {result.Summary.ExceptionCount} 项；详见 exceptions.csv。");
        return builder.ToString();
    }

    public static string RenderExceptionsCsv(ReconciliationResult result)
    {
        var builder = new StringBuilder();
        builder.AppendLine("exception_id,type,severity,company_code,order_id,payment_id,source_row,related_rows,field,expected,actual,message_en,message_zh");
        foreach (var exception in result.Exceptions)
        {
            var values = new[]
            {
                exception.ExceptionId,
                exception.Type,
                exception.Severity,
                exception.CompanyCode,
                exception.OrderId,
                exception.PaymentId,
                exception.SourceRow.ToString(CultureInfo.InvariantCulture),
                string.Join(";", exception.RelatedRows),
                exception.Field,
                exception.Expected,
                exception.Actual,
                exception.Message,
                exception.MessageZh
            };
            builder.AppendLine(string.Join(",", values.Select(Escape)));
        }

        return builder.ToString();
    }

    private static void AppendLine(StringBuilder builder, bool english, bool chinese, string labelEn, string labelZh, string value)
    {
        builder.AppendLine(english && chinese
            ? $"- **{labelEn} / {labelZh}**: {value}"
            : english
                ? $"- **{labelEn}**: {value}"
                : $"- **{labelZh}**: {value}");
    }

    private static string Escape(string value)
    {
        if (!value.Contains(',', StringComparison.Ordinal)
            && !value.Contains('"', StringComparison.Ordinal)
            && !value.Contains('\r', StringComparison.Ordinal)
            && !value.Contains('\n', StringComparison.Ordinal))
        {
            return value;
        }

        return "\"" + value.Replace("\"", "\"\"", StringComparison.Ordinal) + "\"";
    }
}
