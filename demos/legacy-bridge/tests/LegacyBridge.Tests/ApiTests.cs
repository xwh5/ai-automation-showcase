using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using LegacyBridge.Api;
using LegacyBridge.Api.Contracts;
using LegacyBridge.Api.Persistence;
using LegacyBridge.Core.Reconciliation;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace LegacyBridge.Tests;

public sealed class ApiTests
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public async Task Json_submission_defaults_to_dry_run_and_writes_sqlite_audit()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Request-Id", "req-dry-run");

        using var response = await PostJsonAsync(client, TestData.Orders(TestData.Order()), TestData.Payments(TestData.Payment()));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("req-dry-run", response.Headers.GetValues("X-Request-Id").Single());
        Assert.Equal(RuleCatalog.Version, response.Headers.GetValues("X-Rule-Version").Single());
        Assert.Equal("false", response.Headers.GetValues("Idempotency-Replayed").Single());
        var body = await ReadAsync<ReconcileResponse>(response);
        Assert.False(body.Replayed);
        Assert.True(body.Run.Run.DryRun);
        Assert.Equal(0, body.Run.Run.Execution.ProductionWrites);
        Assert.Equal("req-dry-run", body.Run.AuditEvents.Single().RequestId);
        Assert.Equal("created", body.Run.AuditEvents.Single().Outcome);

        await using var connection = new SqliteConnection($"Data Source={factory.DatabasePath}");
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                (SELECT COUNT(*) FROM runs),
                (SELECT COUNT(*) FROM staged_orders),
                (SELECT COUNT(*) FROM staged_payments),
                (SELECT COUNT(*) FROM audit_events),
                (SELECT COUNT(*) FROM planned_actions);
            """;
        await using var reader = await command.ExecuteReaderAsync();
        Assert.True(await reader.ReadAsync());
        Assert.Equal(1L, reader.GetInt64(0));
        Assert.Equal(1L, reader.GetInt64(1));
        Assert.Equal(1L, reader.GetInt64(2));
        Assert.Equal(1L, reader.GetInt64(3));
        Assert.Equal(1L, reader.GetInt64(4));
    }

    [Fact]
    public async Task Repeated_input_reuses_run_and_appends_request_audit()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();
        var orders = TestData.Orders(TestData.Order());
        var payments = TestData.Payments(TestData.Payment());

        using var first = await PostJsonAsync(client, orders, payments, "req-first");
        using var second = await PostJsonAsync(client, orders, payments, "req-second");
        var firstBody = await ReadAsync<ReconcileResponse>(first);
        var secondBody = await ReadAsync<ReconcileResponse>(second);

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        Assert.False(firstBody.Replayed);
        Assert.True(secondBody.Replayed);
        Assert.Equal(firstBody.Run.Run.RunId, secondBody.Run.Run.RunId);
        Assert.Equal(firstBody.Run.Run.InputHash, secondBody.Run.Run.InputHash);
        Assert.Equal(JsonSerializer.Serialize(firstBody.Run.Run.Summary), JsonSerializer.Serialize(secondBody.Run.Run.Summary));
        Assert.Equal(JsonSerializer.Serialize(firstBody.Run.Run.Matches), JsonSerializer.Serialize(secondBody.Run.Run.Matches));
        Assert.Equal(JsonSerializer.Serialize(firstBody.Run.Run.Exceptions), JsonSerializer.Serialize(secondBody.Run.Run.Exceptions));

        using var detail = await client.GetAsync($"/api/runs/{firstBody.Run.Run.RunId}");
        var view = await ReadAsync<RunView>(detail);
        Assert.Equal(2, view.AuditEvents.Count);
        Assert.Equal(["req-first", "req-second"], view.AuditEvents.Select(item => item.RequestId));
        Assert.Equal(["created", "replayed"], view.AuditEvents.Select(item => item.Outcome));

        using var list = await client.GetAsync("/api/runs?limit=10&offset=0");
        var runs = await ReadAsync<RunListResponse>(list);
        Assert.Single(runs.Items);
    }

    [Fact]
    public async Task Multipart_upload_and_exports_work()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();
        using var form = new MultipartFormDataContent();
        form.Add(CsvContent(TestData.Orders(TestData.Order())), "orders", "orders.csv");
        form.Add(CsvContent(TestData.Payments(TestData.Payment())), "payments", "payments.csv");
        form.Add(new StringContent("true"), "dryRun");
        form.Add(new StringContent("req-multipart"), "requestId");

        using var response = await client.PostAsync("/api/reconcile", form);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await ReadAsync<ReconcileResponse>(response);
        Assert.Equal("req-multipart", body.RequestId);

        using var exceptions = await client.GetAsync($"/api/runs/{body.Run.Run.RunId}/exceptions.csv");
        Assert.Equal(HttpStatusCode.OK, exceptions.StatusCode);
        Assert.Equal("text/csv", exceptions.Content.Headers.ContentType?.MediaType);
        Assert.Equal($"{body.Run.Run.RunId}-exceptions.csv", exceptions.Content.Headers.ContentDisposition?.FileName);
        var exceptionsText = await exceptions.Content.ReadAsStringAsync();
        Assert.Contains("exception_id,type,severity", exceptionsText);

        using var report = await client.GetAsync($"/api/runs/{body.Run.Run.RunId}/report.md?lang=zh");
        Assert.Equal(HttpStatusCode.OK, report.StatusCode);
        Assert.Equal("text/markdown", report.Content.Headers.ContentType?.MediaType);
        Assert.Contains("# 对账日报", await report.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Full_synthetic_fixture_reconciles_through_api()
    {
        var (orders, payments) = TestData.LoadFixtures();
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();

        using var response = await PostJsonAsync(client, orders, payments);
        var body = await ReadAsync<ReconcileResponse>(response);

        Assert.Equal(100, body.Run.Run.Summary.TotalOrderRows);
        Assert.Equal(70, body.Run.Run.Summary.TotalPaymentRows);
        Assert.Equal(63, body.Run.Run.Summary.MatchedOrders);
        Assert.Equal(32, body.Run.Run.Summary.UnpaidOrders);
        Assert.Equal(41, body.Run.Run.Summary.ExceptionCount);
        Assert.Equal(0, body.Run.Run.Execution.ProductionWrites);
    }

    [Fact]
    public async Task Simulation_mode_still_performs_zero_production_writes()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();

        using var response = await PostJsonAsync(client,
            TestData.Orders(TestData.Order()), TestData.Payments(TestData.Payment()), dryRun: false);
        var body = await ReadAsync<ReconcileResponse>(response);

        Assert.False(body.Run.Run.DryRun);
        Assert.True(body.Run.Run.Execution.SimulationOnly);
        Assert.Equal(0, body.Run.Run.Execution.ProductionWrites);
        Assert.All(body.Run.Run.PlannedActions, action => Assert.Equal("planned_not_executed", action.Status));
    }

    [Fact]
    public async Task Invalid_csv_and_unknown_run_return_useful_errors()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();

        using var invalid = await PostJsonAsync(client, "order_id,company_code\nORD-1,SYN-A\n", TestData.Payments(TestData.Payment()));
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        Assert.Contains("CSV", await invalid.Content.ReadAsStringAsync());

        using var missing = await client.GetAsync("/api/runs/run-does-not-exist");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);

        using var badLanguage = await client.GetAsync("/api/runs/run-does-not-exist/report.md?lang=fr");
        Assert.Equal(HttpStatusCode.BadRequest, badLanguage.StatusCode);
    }

    [Fact]
    public async Task Run_list_pagination_is_stable()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();
        using var first = await PostJsonAsync(client, TestData.Orders(TestData.Order("ORD-1")), TestData.Payments(TestData.Payment(orderId: "ORD-1")));
        using var second = await PostJsonAsync(client, TestData.Orders(TestData.Order("ORD-2")), TestData.Payments(TestData.Payment(orderId: "ORD-2")));
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.Created, second.StatusCode);

        using var response = await client.GetAsync("/api/runs?limit=1&offset=0");
        var page = await ReadAsync<RunListResponse>(response);
        Assert.Single(page.Items);
        Assert.Equal(1, page.Limit);
    }

    [Fact]
    public async Task Static_page_and_synthetic_sample_endpoints_are_available()
    {
        using var factory = new TestApiFactory();
        using var client = factory.CreateClient();

        using var health = await client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, health.StatusCode);
        using var page = await client.GetAsync("/index.html");
        Assert.Equal(HttpStatusCode.OK, page.StatusCode);
        using var sample = await client.GetAsync("/api/sample/orders.csv");
        Assert.Equal(HttpStatusCode.OK, sample.StatusCode);
        Assert.Equal(101, (await sample.Content.ReadAsStringAsync()).Split('\n').Count(line => line.Length > 0));
    }

    private static ByteArrayContent CsvContent(string value)
    {
        var content = new ByteArrayContent(Encoding.UTF8.GetBytes(value));
        content.Headers.ContentType = new MediaTypeHeaderValue("text/csv") { CharSet = "utf-8" };
        return content;
    }

    private static async Task<HttpResponseMessage> PostJsonAsync(
        HttpClient client,
        string orders,
        string payments,
        string? requestId = null,
        bool dryRun = true)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/reconcile")
        {
            Content = new StringContent(JsonSerializer.Serialize(new
            {
                ordersCsv = orders,
                paymentsCsv = payments,
                dryRun,
                requestId
            }, JsonOptions), Encoding.UTF8, "application/json")
        };
        if (!string.IsNullOrWhiteSpace(requestId))
        {
            request.Headers.Add("X-Request-Id", requestId);
        }

        return await client.SendAsync(request);
    }

    private static async Task<T> ReadAsync<T>(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json, JsonOptions)
            ?? throw new InvalidOperationException($"Response JSON was null: {json}");
    }

    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly string _databasePath = Path.Combine(
            Path.GetTempPath(), "legacy-bridge-tests", $"legacy-{Guid.NewGuid():N}.db");

        public string DatabasePath => _databasePath;

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseContentRoot(Path.Combine(TestData.FindRepositoryRoot(), "src", "LegacyBridge.Api"));
            builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
                new Dictionary<string, string?> { ["Database:Path"] = _databasePath }));
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (!disposing)
            {
                return;
            }

            SqliteConnection.ClearAllPools();
            foreach (var suffix in new[] { "", "-shm", "-wal" })
            {
                var path = _databasePath + suffix;
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
            }
        }
    }
}
