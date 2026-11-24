using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using LegacyBridge.Api.Contracts;
using LegacyBridge.Api.Persistence;
using LegacyBridge.Core.Reconciliation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

namespace LegacyBridge.Api;

public partial class Program
{
    private const long MaxCsvBytes = 2 * 1024 * 1024;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 5 * 1024 * 1024);
        builder.Services.Configure<FormOptions>(options =>
        {
            options.MultipartBodyLengthLimit = 5 * 1024 * 1024;
            options.ValueLengthLimit = (int)MaxCsvBytes;
        });
        builder.Services.AddCors(options => options.AddPolicy("DemoStaticOrigins", policy => policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .WithMethods("GET", "POST", "OPTIONS")
            .WithExposedHeaders("X-Request-Id", "X-Rule-Version", "X-Input-Hash", "Idempotency-Replayed")));
        builder.Services.AddSingleton<ReconciliationEngine>();
        builder.Services.AddSingleton<RunStore>();

        var app = builder.Build();
        app.Use(async (context, next) =>
        {
            if (string.Equals(context.Request.Headers["Access-Control-Request-Private-Network"], "true", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Headers["Access-Control-Allow-Private-Network"] = "true";
            }
            await next(context);
        });
        app.UseCors("DemoStaticOrigins");
        app.Use(async (context, next) =>
        {
            try
            {
                await next(context);
            }
            catch (InputException exception)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await Results.Problem(new ProblemDetails
                {
                    Title = "Invalid reconciliation request",
                    Detail = exception.Message,
                    Status = StatusCodes.Status400BadRequest
                }).ExecuteAsync(context);
            }
            catch (CsvFormatException exception)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await Results.Problem(new ProblemDetails
                {
                    Title = "Invalid CSV",
                    Detail = exception.Message,
                    Status = StatusCodes.Status400BadRequest
                }).ExecuteAsync(context);
            }
        });
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(Path.Combine(AppContext.BaseDirectory, "web"))
        });
        app.MapGet("/", () => Results.Redirect("/index.html"));

        var store = app.Services.GetRequiredService<RunStore>();
        var engine = app.Services.GetRequiredService<ReconciliationEngine>();
        await store.InitializeAsync();

        app.MapGet("/api/health", () => Results.Ok(new HealthResponse(
            "ok",
            RuleCatalog.Version,
            true,
            0,
            "SQLite local staging",
            DateTimeOffset.UtcNow)));

        app.MapPost("/api/reconcile", async (HttpContext context) =>
        {
            var (ordersCsv, paymentsCsv, dryRun, requestedId) = await ReadSubmissionAsync(context);
            var requestId = NormalizeRequestId(requestedId);
            var actor = context.Connection.RemoteIpAddress?.ToString() ?? "in-process";
            if (!string.IsNullOrWhiteSpace(context.Request.Headers.UserAgent))
            {
                actor += " | " + context.Request.Headers.UserAgent.ToString()[..Math.Min(160, context.Request.Headers.UserAgent.ToString().Length)];
            }

            var result = engine.Reconcile(ordersCsv, paymentsCsv, dryRun);
            var saved = await store.SaveIfAbsentAsync(result, requestId, dryRun, actor, context.RequestAborted);
            context.Response.Headers["X-Request-Id"] = requestId;
            context.Response.Headers["X-Rule-Version"] = result.RuleVersion;
            context.Response.Headers["X-Input-Hash"] = result.InputHash;
            context.Response.Headers["Idempotency-Replayed"] = saved.Replayed ? "true" : "false";
            var response = new ReconcileResponse(
                requestId,
                saved.Replayed,
                $"/api/runs/{saved.View.Run.RunId}",
                $"/api/runs/{saved.View.Run.RunId}/exceptions.csv",
                $"/api/runs/{saved.View.Run.RunId}/report.md",
                saved.View);
            return saved.Replayed ? Results.Ok(response) : Results.Created($"/api/runs/{saved.View.Run.RunId}", response);
        });

        app.MapGet("/api/runs", async (HttpContext context, RunStore runStore) =>
        {
            var limit = ParseBoundedInt(context, "limit", 20, 1, 100);
            var offset = ParseBoundedInt(context, "offset", 0, 0, 100_000);
            var items = await runStore.ListRunsAsync(limit, offset, context.RequestAborted);
            return Results.Ok(new RunListResponse(items, limit, offset));
        });

        app.MapGet("/api/runs/{id}", async (string id, RunStore runStore, CancellationToken cancellationToken) =>
        {
            var view = await runStore.GetRunAsync(id, cancellationToken);
            return view is null ? Results.NotFound() : Results.Ok(view);
        });

        app.MapGet("/api/runs/{id}/exceptions.csv", async (string id, RunStore runStore, CancellationToken cancellationToken) =>
        {
            var view = await runStore.GetRunAsync(id, cancellationToken);
            if (view is null)
            {
                return Results.NotFound();
            }

            var csv = ReportRenderer.RenderExceptionsCsv(view.Run);
            return Results.Bytes(Encoding.UTF8.GetBytes("\uFEFF" + csv), "text/csv; charset=utf-8", $"{id}-exceptions.csv");
        });

        app.MapGet("/api/runs/{id}/report.md", async (string id, HttpContext context, RunStore runStore, CancellationToken cancellationToken) =>
        {
            var language = context.Request.Query["lang"].ToString();
            if (string.IsNullOrWhiteSpace(language))
            {
                language = "both";
            }

            if (language is not ("both" or "zh" or "en"))
            {
                return Results.BadRequest(new { error = "invalid_language", message = "lang must be zh, en, or both." });
            }

            var view = await runStore.GetRunAsync(id, cancellationToken);
            if (view is null)
            {
                return Results.NotFound();
            }

            return Results.Text(ReportRenderer.RenderMarkdown(view.Run, language), "text/markdown; charset=utf-8", Encoding.UTF8);
        });

        app.MapGet("/api/sample/{fileName}", (string fileName) =>
        {
            if (fileName is not ("orders.csv" or "payments.csv"))
            {
                return Results.NotFound();
            }

            var path = Path.Combine(AppContext.BaseDirectory, "fixtures", fileName);
            return File.Exists(path) ? Results.File(path, "text/csv; charset=utf-8", fileName) : Results.NotFound();
        });

        await app.RunAsync();
    }

    private static async Task<(string OrdersCsv, string PaymentsCsv, bool DryRun, string? RequestId)> ReadSubmissionAsync(
        HttpContext context)
    {
        if (context.Request.HasJsonContentType())
        {
            if (context.Request.ContentLength > MaxCsvBytes * 2 + 4096)
            {
                throw new InputException("JSON request exceeds the synthetic-data size limit.");
            }

            var json = await new StreamReader(context.Request.Body, Encoding.UTF8).ReadToEndAsync(context.RequestAborted);
            var request = JsonSerializer.Deserialize<ReconcileJsonRequest>(json, JsonOptions)
                ?? throw new InputException("A JSON request body is required.");
            var orders = RequireCsv(request.OrdersCsv, "ordersCsv");
            var payments = RequireCsv(request.PaymentsCsv, "paymentsCsv");
            var requestId = string.IsNullOrWhiteSpace(request.RequestId)
                ? context.Request.Headers["X-Request-Id"].ToString()
                : request.RequestId;
            return (orders, payments, request.DryRun ?? true, NullIfEmpty(requestId));
        }

        if (context.Request.HasFormContentType)
        {
            var form = await context.Request.ReadFormAsync(context.RequestAborted);
            var ordersFile = form.Files.GetFile("orders")
                ?? throw new InputException("Multipart field 'orders' must contain a CSV file.");
            var paymentsFile = form.Files.GetFile("payments")
                ?? throw new InputException("Multipart field 'payments' must contain a CSV file.");
            if (ordersFile.Length > MaxCsvBytes || paymentsFile.Length > MaxCsvBytes)
            {
                throw new InputException($"Each CSV file must be at most {MaxCsvBytes / (1024 * 1024)} MiB.");
            }

            var orders = await ReadFormFileAsync(ordersFile, context.RequestAborted);
            var payments = await ReadFormFileAsync(paymentsFile, context.RequestAborted);
            var dryRunValue = form["dryRun"].ToString();
            bool dryRun;
            if (string.IsNullOrWhiteSpace(dryRunValue))
            {
                dryRun = true;
            }
            else if (!bool.TryParse(dryRunValue, out dryRun))
            {
                throw new InputException("dryRun must be true or false.");
            }

            var requestId = string.IsNullOrWhiteSpace(form["requestId"].ToString())
                ? context.Request.Headers["X-Request-Id"].ToString()
                : form["requestId"].ToString();
            return (orders, payments, dryRun, NullIfEmpty(requestId));
        }

        throw new InputException("Use application/json or multipart/form-data.");
    }

    private static async Task<string> ReadFormFileAsync(IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);
        var content = await reader.ReadToEndAsync(cancellationToken);
        return RequireCsv(content, file.Name);
    }

    private static string RequireCsv(string? content, string field)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InputException($"{field} must contain non-empty CSV text.");
        }

        if (Encoding.UTF8.GetByteCount(content) > MaxCsvBytes)
        {
            throw new InputException($"{field} exceeds the {MaxCsvBytes / (1024 * 1024)} MiB limit.");
        }

        return content;
    }

    private static string NormalizeRequestId(string? requestedId)
    {
        if (string.IsNullOrWhiteSpace(requestedId))
        {
            return "req-" + Guid.NewGuid().ToString("N");
        }

        var value = requestedId.Trim();
        if (value.Length > 128 || !value.All(character => char.IsAsciiLetterOrDigit(character)
            || character is '-' or '_' or ':' or '.'))
        {
            throw new InputException("Request id must be 1-128 ASCII letters, digits, '-', '_', ':', or '.'.");
        }

        return value;
    }

    private static int ParseBoundedInt(HttpContext context, string key, int fallback, int minimum, int maximum)
    {
        var value = context.Request.Query[key].ToString();
        if (string.IsNullOrWhiteSpace(value))
        {
            return fallback;
        }

        if (!int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
        {
            throw new InputException($"{key} must be an integer.");
        }

        return Math.Clamp(parsed, minimum, maximum);
    }

    private static string? NullIfEmpty(string? value) => string.IsNullOrWhiteSpace(value) ? null : value;

    private sealed class InputException(string message) : Exception(message);
}
