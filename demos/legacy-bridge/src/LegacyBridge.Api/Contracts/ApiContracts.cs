namespace LegacyBridge.Api.Contracts;

public sealed record ReconcileJsonRequest(
    string? OrdersCsv,
    string? PaymentsCsv,
    bool? DryRun,
    string? RequestId);

public sealed record ReconcileResponse(
    string RequestId,
    bool Replayed,
    string RunUrl,
    string ExceptionsCsvUrl,
    string ReportUrl,
    Persistence.RunView Run);

public sealed record RunListResponse(
    IReadOnlyList<Persistence.RunListItem> Items,
    int Limit,
    int Offset);

public sealed record HealthResponse(
    string Status,
    string RuleVersion,
    bool DryRunDefault,
    int ProductionWrites,
    string Storage,
    DateTimeOffset CheckedAtUtc);
