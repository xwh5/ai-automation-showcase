using System.Text.Json.Serialization;

namespace LegacyBridge.Core.Reconciliation;

public sealed record StagedCsvRow(
    int RowNumber,
    IReadOnlyDictionary<string, string> Fields,
    IReadOnlyList<string> StructuralErrors,
    string RawText)
{
    public string Get(string field) => Fields.TryGetValue(field, out var value) ? value : string.Empty;
}

public sealed record ParsedCsv(
    IReadOnlyList<string> Headers,
    IReadOnlyList<StagedCsvRow> Rows,
    IReadOnlyList<string> Errors);

public sealed record ParsedOrder(
    string Key,
    string OrderId,
    string CompanyCode,
    DateOnly OrderDate,
    string Currency,
    decimal Amount,
    int SourceRow,
    int GroupSize)
{
    public string MatchId => "match-" + Fingerprint.HashText(Key)[..20];
}

public sealed record ParsedPayment(
    string PaymentId,
    string Key,
    string OrderId,
    string CompanyCode,
    DateOnly PaymentDate,
    string Currency,
    decimal Amount,
    int SourceRow,
    int DuplicateGroupSize);

public sealed record ReconciliationMatch(
    string MatchId,
    string CompanyCode,
    string OrderId,
    int OrderRow,
    DateOnly OrderDate,
    string Currency,
    decimal OrderAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    string Status,
    IReadOnlyList<string> PaymentIds,
    IReadOnlyList<int> PaymentRows,
    int DuplicateOrderRows);

public sealed record ReconciliationException(
    string ExceptionId,
    string Type,
    string Severity,
    string CompanyCode,
    string OrderId,
    string PaymentId,
    int SourceRow,
    IReadOnlyList<int> RelatedRows,
    string Field,
    string Expected,
    string Actual,
    string Message,
    string MessageZh);

public sealed record PlannedAction(
    string ActionId,
    string Type,
    string CompanyCode,
    string OrderId,
    string PaymentId,
    string Status,
    string Description,
    string DescriptionZh);

public sealed record CurrencyTotals(
    string Currency,
    decimal OrderAmount,
    decimal PaymentAmount,
    decimal MatchedAmount,
    decimal OutstandingAmount,
    decimal OverpaidAmount,
    decimal UnmatchedPaymentAmount);

public sealed record ReconciliationSummary(
    int TotalOrderRows,
    int ValidOrderRows,
    int UniqueOrders,
    int TotalPaymentRows,
    int ValidPaymentRows,
    int MatchedOrders,
    int UnpaidOrders,
    int AmountMismatchOrders,
    int CurrencyMismatchOrders,
    int DuplicateOrderGroups,
    int ExceptionCount,
    IReadOnlyDictionary<string, int> ExceptionsByType,
    IReadOnlyList<CurrencyTotals> CurrencyTotals);

public sealed record ExecutionSummary(
    bool DryRun,
    bool SimulationOnly,
    int ProductionWrites,
    string Message,
    string MessageZh);

public sealed record ReconciliationResult(
    string RunId,
    string InputHash,
    string OrdersHash,
    string PaymentsHash,
    string RuleVersion,
    DateTimeOffset CreatedAtUtc,
    bool DryRun,
    ReconciliationSummary Summary,
    IReadOnlyList<ReconciliationMatch> Matches,
    IReadOnlyList<ReconciliationException> Exceptions,
    IReadOnlyList<PlannedAction> PlannedActions,
    ExecutionSummary Execution,
    [property: JsonIgnore] IReadOnlyList<StagedCsvRow> StagedOrders,
    [property: JsonIgnore] IReadOnlyList<StagedCsvRow> StagedPayments);

public sealed class CsvFormatException(string message) : Exception(message);
