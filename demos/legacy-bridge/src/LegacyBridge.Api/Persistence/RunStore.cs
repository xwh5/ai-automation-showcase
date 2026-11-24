using System.Globalization;
using System.Reflection;
using System.Text.Json;
using LegacyBridge.Core.Reconciliation;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace LegacyBridge.Api.Persistence;

public sealed record AuditEvent(
    string EventId,
    string RunId,
    string RequestId,
    DateTimeOffset OccurredAtUtc,
    string Outcome,
    bool DryRun,
    string InputHash,
    string RuleVersion,
    string Actor,
    string DetailJson);

public sealed record RunView(
    ReconciliationResult Run,
    IReadOnlyList<AuditEvent> AuditEvents);

public sealed record RunListItem(
    string RunId,
    DateTimeOffset CreatedAtUtc,
    string InputHash,
    string RuleVersion,
    bool DryRun,
    ReconciliationSummary Summary);

public sealed record SaveOutcome(RunView View, bool Replayed, AuditEvent AuditEvent);

public sealed class RunStore(IConfiguration configuration, IHostEnvironment environment)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly string _connectionString = BuildConnectionString(configuration, environment);
    private readonly SemaphoreSlim _initializationGate = new(1, 1);
    private bool _initialized;

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        if (_initialized)
        {
            return;
        }

        await _initializationGate.WaitAsync(cancellationToken);
        try
        {
            if (_initialized)
            {
                return;
            }

            await using var connection = await OpenConnectionAsync(_connectionString, cancellationToken);
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "LegacyBridge.Api.Persistence.Schema.sql";
            await using var stream = assembly.GetManifestResourceStream(resourceName)
                ?? throw new InvalidOperationException($"Embedded resource {resourceName} was not found.");
            using var reader = new StreamReader(stream);
            var schema = await reader.ReadToEndAsync(cancellationToken);
            await using var command = connection.CreateCommand();
            command.CommandText = schema;
            await command.ExecuteNonQueryAsync(cancellationToken);
            _initialized = true;
        }
        finally
        {
            _initializationGate.Release();
        }
    }

    public async Task<SaveOutcome> SaveIfAbsentAsync(
        ReconciliationResult result,
        string requestId,
        bool requestDryRun,
        string actor,
        CancellationToken cancellationToken = default)
    {
        await InitializeAsync(cancellationToken);
        var existing = await FindByHashAsync(result.InputHash, cancellationToken);
        if (existing is not null)
        {
            var audit = await AppendAuditAsync(existing.Run.RunId, requestId, "replayed", requestDryRun, actor,
                new { orderRows = result.Summary.TotalOrderRows, paymentRows = result.Summary.TotalPaymentRows, productionWrites = 0 },
                cancellationToken);
            var view = await LoadRunViewAsync(existing.Run.RunId, cancellationToken)
                ?? throw new InvalidOperationException("A replayed run disappeared during audit insertion.");
            return new SaveOutcome(view, true, audit);
        }

        await using var connection = await OpenConnectionAsync(_connectionString, cancellationToken);
        await using var transaction = connection.BeginTransaction();
        try
        {
            await InsertRunAsync(connection, transaction, result, cancellationToken);
            await InsertStagedRowsAsync(connection, transaction, "staged_orders", result.RunId, result.StagedOrders, cancellationToken);
            await InsertStagedRowsAsync(connection, transaction, "staged_payments", result.RunId, result.StagedPayments, cancellationToken);
            await InsertJsonRowsAsync(connection, transaction, "matches", "match_id", result.RunId,
                result.Matches.Cast<object>().ToArray(), cancellationToken);
            await InsertJsonRowsAsync(connection, transaction, "exceptions", "exception_id", result.RunId,
                result.Exceptions.Cast<object>().ToArray(), cancellationToken);
            await InsertJsonRowsAsync(connection, transaction, "planned_actions", "action_id", result.RunId,
                result.PlannedActions.Cast<object>().ToArray(), cancellationToken);
            var audit = await AppendAuditAsync(connection, transaction, result.RunId, requestId, "created", requestDryRun,
                actor,
                new
                {
                    orderRows = result.Summary.TotalOrderRows,
                    paymentRows = result.Summary.TotalPaymentRows,
                    exceptionCount = result.Summary.ExceptionCount,
                    productionWrites = 0
                },
                cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return new SaveOutcome(new RunView(result, [audit]), false, audit);
        }
        catch (SqliteException exception) when (exception.SqliteExtendedErrorCode is 1555 or 2067)
        {
            await transaction.RollbackAsync(cancellationToken);
            var winner = await FindByHashAsync(result.InputHash, cancellationToken)
                ?? throw new InvalidOperationException("Concurrent run insert failed without a matching input hash.", exception);
            var audit = await AppendAuditAsync(winner.Run.RunId, requestId, "replayed", requestDryRun, actor,
                new { orderRows = result.Summary.TotalOrderRows, paymentRows = result.Summary.TotalPaymentRows, productionWrites = 0 },
                cancellationToken);
            var view = await LoadRunViewAsync(winner.Run.RunId, cancellationToken)
                ?? throw new InvalidOperationException("A concurrent run disappeared during audit insertion.");
            return new SaveOutcome(view, true, audit);
        }
    }

    public async Task<IReadOnlyList<RunListItem>> ListRunsAsync(int limit, int offset, CancellationToken cancellationToken = default)
    {
        await InitializeAsync(cancellationToken);
        await using var connection = await OpenConnectionAsync(_connectionString, cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT run_id, created_at_utc, input_hash, rule_version, dry_run, summary_json
            FROM runs
            ORDER BY created_at_utc DESC, run_id ASC
            LIMIT $limit OFFSET $offset;
            """;
        command.Parameters.AddWithValue("$limit", limit);
        command.Parameters.AddWithValue("$offset", offset);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var runs = new List<RunListItem>();
        while (await reader.ReadAsync(cancellationToken))
        {
            runs.Add(new RunListItem(
                reader.GetString(0),
                DateTimeOffset.Parse(reader.GetString(1), CultureInfo.InvariantCulture),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetInt64(4) == 1,
                Deserialize<ReconciliationSummary>(reader.GetString(5))));
        }

        return runs;
    }

    public async Task<RunView?> GetRunAsync(string runId, CancellationToken cancellationToken = default)
    {
        await InitializeAsync(cancellationToken);
        return await LoadRunViewAsync(runId, cancellationToken);
    }

    private async Task<RunView?> FindByHashAsync(string inputHash, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(_connectionString, cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT run_id FROM runs WHERE input_hash = $hash;";
        command.Parameters.AddWithValue("$hash", inputHash);
        var value = await command.ExecuteScalarAsync(cancellationToken);
        return value is null ? null : await LoadRunViewAsync((string)value, cancellationToken);
    }

    private async Task<RunView?> LoadRunViewAsync(string runId, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(_connectionString, cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT result_json FROM runs WHERE run_id = $runId;";
        command.Parameters.AddWithValue("$runId", runId);
        var json = await command.ExecuteScalarAsync(cancellationToken);
        if (json is null)
        {
            return null;
        }

        var run = Deserialize<ReconciliationResult>((string)json);
        await using var auditCommand = connection.CreateCommand();
        auditCommand.CommandText = """
            SELECT event_id, run_id, request_id, occurred_at_utc, outcome, dry_run, input_hash, rule_version, actor, detail_json
            FROM audit_events
            WHERE run_id = $runId
            ORDER BY occurred_at_utc ASC, event_id ASC;
            """;
        auditCommand.Parameters.AddWithValue("$runId", runId);
        await using var reader = await auditCommand.ExecuteReaderAsync(cancellationToken);
        var auditEvents = new List<AuditEvent>();
        while (await reader.ReadAsync(cancellationToken))
        {
            auditEvents.Add(new AuditEvent(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                DateTimeOffset.Parse(reader.GetString(3), CultureInfo.InvariantCulture),
                reader.GetString(4),
                reader.GetInt64(5) == 1,
                reader.GetString(6),
                reader.GetString(7),
                reader.GetString(8),
                reader.GetString(9)));
        }

        return new RunView(run, auditEvents);
    }

    private static async Task InsertRunAsync(
        SqliteConnection connection,
        SqliteTransaction transaction,
        ReconciliationResult result,
        CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = """
            INSERT INTO runs(run_id, input_hash, orders_hash, payments_hash, rule_version, created_at_utc, dry_run, summary_json, result_json)
            VALUES($runId, $inputHash, $ordersHash, $paymentsHash, $ruleVersion, $createdAt, $dryRun, $summary, $result);
            """;
        command.Parameters.AddWithValue("$runId", result.RunId);
        command.Parameters.AddWithValue("$inputHash", result.InputHash);
        command.Parameters.AddWithValue("$ordersHash", result.OrdersHash);
        command.Parameters.AddWithValue("$paymentsHash", result.PaymentsHash);
        command.Parameters.AddWithValue("$ruleVersion", result.RuleVersion);
        command.Parameters.AddWithValue("$createdAt", result.CreatedAtUtc.ToString("O", CultureInfo.InvariantCulture));
        command.Parameters.AddWithValue("$dryRun", result.DryRun ? 1 : 0);
        command.Parameters.AddWithValue("$summary", Serialize(result.Summary));
        command.Parameters.AddWithValue("$result", Serialize(result));
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task InsertStagedRowsAsync(
        SqliteConnection connection,
        SqliteTransaction transaction,
        string table,
        string runId,
        IReadOnlyList<StagedCsvRow> rows,
        CancellationToken cancellationToken)
    {
        if (rows.Count == 0)
        {
            return;
        }

        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = $"INSERT INTO {table}(run_id, row_number, payload_json) VALUES($runId, $rowNumber, $payload);";
        command.Parameters.AddWithValue("$runId", runId);
        var rowParameter = command.Parameters.Add("$rowNumber", SqliteType.Integer);
        var payloadParameter = command.Parameters.Add("$payload", SqliteType.Text);
        foreach (var row in rows)
        {
            rowParameter.Value = row.RowNumber;
            payloadParameter.Value = Serialize(row);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
    }

    private static async Task InsertJsonRowsAsync(
        SqliteConnection connection,
        SqliteTransaction transaction,
        string table,
        string idColumn,
        string runId,
        IReadOnlyList<object> rows,
        CancellationToken cancellationToken)
    {
        if (rows.Count == 0)
        {
            return;
        }

        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        var isExceptionTable = table == "exceptions";
        command.CommandText = isExceptionTable
            ? $"INSERT INTO {table}(run_id, {idColumn}, exception_type, payload_json) VALUES($runId, $id, $type, $payload);"
            : $"INSERT INTO {table}(run_id, {idColumn}, payload_json) VALUES($runId, $id, $payload);";
        command.Parameters.AddWithValue("$runId", runId);
        var idParameter = command.Parameters.Add("$id", SqliteType.Text);
        var typeParameter = isExceptionTable ? command.Parameters.Add("$type", SqliteType.Text) : null;
        var payloadParameter = command.Parameters.Add("$payload", SqliteType.Text);
        foreach (var row in rows)
        {
            var id = row switch
            {
                ReconciliationMatch match => match.MatchId,
                ReconciliationException exception => exception.ExceptionId,
                PlannedAction action => action.ActionId,
                _ => throw new InvalidOperationException($"Unsupported result row type: {row.GetType().Name}")
            };
            idParameter.Value = id;
            if (row is ReconciliationException typedException && typeParameter is not null)
            {
                typeParameter.Value = typedException.Type;
            }
            payloadParameter.Value = Serialize(row);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
    }

    private async Task<AuditEvent> AppendAuditAsync(
        string runId,
        string requestId,
        string outcome,
        bool dryRun,
        string actor,
        object detail,
        CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(_connectionString, cancellationToken);
        await using var transaction = connection.BeginTransaction();
        var audit = await AppendAuditAsync(connection, transaction, runId, requestId, outcome, dryRun, actor, detail,
            cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return audit;
    }

    private static async Task<AuditEvent> AppendAuditAsync(
        SqliteConnection connection,
        SqliteTransaction transaction,
        string runId,
        string requestId,
        string outcome,
        bool dryRun,
        string actor,
        object detail,
        CancellationToken cancellationToken)
    {
        var audit = new AuditEvent(
            "audit-" + Guid.NewGuid().ToString("N"),
            runId,
            requestId,
            DateTimeOffset.UtcNow,
            outcome,
            dryRun,
            string.Empty,
            RuleCatalog.Version,
            actor,
            Serialize(detail));
        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = """
            INSERT INTO audit_events(event_id, run_id, request_id, occurred_at_utc, outcome, dry_run, input_hash, rule_version, actor, detail_json)
            VALUES($eventId, $runId, $requestId, $occurredAt, $outcome, $dryRun,
                   (SELECT input_hash FROM runs WHERE run_id = $runId), $ruleVersion, $actor, $detail);
            """;
        command.Parameters.AddWithValue("$eventId", audit.EventId);
        command.Parameters.AddWithValue("$runId", audit.RunId);
        command.Parameters.AddWithValue("$requestId", audit.RequestId);
        command.Parameters.AddWithValue("$occurredAt", audit.OccurredAtUtc.ToString("O", CultureInfo.InvariantCulture));
        command.Parameters.AddWithValue("$outcome", audit.Outcome);
        command.Parameters.AddWithValue("$dryRun", dryRun ? 1 : 0);
        command.Parameters.AddWithValue("$ruleVersion", audit.RuleVersion);
        command.Parameters.AddWithValue("$actor", actor);
        command.Parameters.AddWithValue("$detail", audit.DetailJson);
        await command.ExecuteNonQueryAsync(cancellationToken);
        return audit with { InputHash = await ReadInputHashAsync(connection, transaction, runId, cancellationToken) };
    }

    private static async Task<string> ReadInputHashAsync(
        SqliteConnection connection,
        SqliteTransaction transaction,
        string runId,
        CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = "SELECT input_hash FROM runs WHERE run_id = $runId;";
        command.Parameters.AddWithValue("$runId", runId);
        return (string)(await command.ExecuteScalarAsync(cancellationToken)
            ?? throw new InvalidOperationException("Audit run was not found."));
    }

    private static async Task<SqliteConnection> OpenConnectionAsync(string connectionString, CancellationToken cancellationToken)
    {
        var connection = new SqliteConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }

    private static string Serialize<T>(T value) => JsonSerializer.Serialize(value, JsonOptions);

    private static T Deserialize<T>(string json) =>
        JsonSerializer.Deserialize<T>(json, JsonOptions)
        ?? throw new InvalidOperationException($"Stored JSON for {typeof(T).Name} was null.");

    private static string BuildConnectionString(IConfiguration configuration, IHostEnvironment environment)
    {
        var configuredPath = Environment.GetEnvironmentVariable("LEGACY_BRIDGE_DB")
            ?? configuration["Database:Path"]
            ?? "data/legacy-bridge.db";
        var path = Path.IsPathRooted(configuredPath)
            ? configuredPath
            : Path.GetFullPath(Path.Combine(environment.ContentRootPath, configuredPath));
        if (path != ":memory:")
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        }

        return new SqliteConnectionStringBuilder
        {
            DataSource = path,
            Mode = SqliteOpenMode.ReadWriteCreate,
            Cache = SqliteCacheMode.Shared,
            Pooling = true,
            DefaultTimeout = 30
        }.ToString();
    }
}
