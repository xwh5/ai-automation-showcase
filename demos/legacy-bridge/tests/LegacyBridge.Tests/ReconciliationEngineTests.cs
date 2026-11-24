using System.Text.Json;
using LegacyBridge.Core.Reconciliation;
using Xunit;

namespace LegacyBridge.Tests;

public sealed class ReconciliationEngineTests
{
    [Fact]
    public void Matches_exact_and_split_payments_without_mixing_companies()
    {
        var orders = TestData.Orders(
            TestData.Order("ORD-1", "SYN-A", amount: "100.00"),
            TestData.Order("ORD-1", "SYN-B", amount: "200.00"),
            TestData.Order("ORD-2", "SYN-A", amount: "50.00"));
        var payments = TestData.Payments(
            TestData.Payment("PAY-1", "SYN-A", "ORD-1", amount: "30.10"),
            TestData.Payment("PAY-2", "SYN-A", "ORD-1", amount: "69.90"),
            TestData.Payment("PAY-3", "SYN-B", "ORD-1", amount: "200.00"),
            TestData.Payment("PAY-4", "SYN-A", "ORD-2", amount: "20.00"),
            TestData.Payment("PAY-5", "SYN-A", "ORD-2", amount: "30.00"));

        var result = TestData.Reconcile(orders, payments);

        Assert.Equal(3, result.Summary.UniqueOrders);
        Assert.Equal(3, result.Summary.MatchedOrders);
        Assert.Equal(0, result.Summary.ExceptionCount);
        Assert.Equal(100m, Assert.Single(result.Matches, match => match.CompanyCode == "SYN-A" && match.OrderId == "ORD-1").PaidAmount);
        Assert.Equal(2, Assert.Single(result.Matches, match => match.OrderId == "ORD-2").PaymentIds.Count);
    }

    [Fact]
    public void Duplicate_orders_use_earliest_row_provisionally_and_raise_exception()
    {
        var orders = TestData.Orders(
            TestData.Order("ORD-DUP", "SYN-A", date: "2026-11-19", amount: "100.00"),
            TestData.Order("ORD-DUP", "SYN-A", date: "2026-11-17", amount: "100.00"));
        var payments = TestData.Payments(TestData.Payment(orderId: "ORD-DUP", amount: "100.00"));

        var result = TestData.Reconcile(orders, payments);

        var exception = Assert.Single(result.Exceptions, item => item.Type == RuleCatalog.DuplicateOrder);
        Assert.Equal(3, exception.SourceRow);
        Assert.Equal([2], exception.RelatedRows);
        var match = Assert.Single(result.Matches);
        Assert.Equal("matched", match.Status);
        Assert.Equal(1, match.DuplicateOrderRows);
        Assert.Equal(1, result.Summary.DuplicateOrderGroups);
    }

    [Fact]
    public void Overpayment_is_an_amount_mismatch()
    {
        var result = TestData.Reconcile(
            TestData.Orders(TestData.Order(amount: "100.00")),
            TestData.Payments(TestData.Payment(amount: "125.50")));

        var match = Assert.Single(result.Matches);
        Assert.Equal("amount_mismatch", match.Status);
        Assert.Equal(-25.50m, match.RemainingAmount);
        var exception = Assert.Single(result.Exceptions, item => item.Type == RuleCatalog.AmountMismatch);
        Assert.Equal("100.00", exception.Expected);
        Assert.Equal("125.50", exception.Actual);
        Assert.Equal(25.50m, Assert.Single(result.Summary.CurrencyTotals).OverpaidAmount);
    }

    [Fact]
    public void Missing_and_partial_payments_are_unpaid()
    {
        var result = TestData.Reconcile(
            TestData.Orders(
                TestData.Order("ORD-NONE", amount: "100.00"),
                TestData.Order("ORD-PART", amount: "200.00")),
            TestData.Payments(TestData.Payment(orderId: "ORD-PART", amount: "40.00")));

        Assert.Equal(2, result.Summary.UnpaidOrders);
        Assert.Equal(100m, Assert.Single(result.Matches, match => match.OrderId == "ORD-NONE").RemainingAmount);
        Assert.Equal(160m, Assert.Single(result.Matches, match => match.OrderId == "ORD-PART").RemainingAmount);
        Assert.Equal(2, result.Exceptions.Count(item => item.Type == RuleCatalog.UnpaidOrder));
        Assert.Equal(260m, Assert.Single(result.Summary.CurrencyTotals).OutstandingAmount);
    }

    [Fact]
    public void Payment_without_source_order_is_not_allocated()
    {
        var result = TestData.Reconcile(
            TestData.Orders(TestData.Order()),
            TestData.Payments(TestData.Payment("PAY-ORPHAN", orderId: "ORD-MISSING", amount: "77.00")));

        var exception = Assert.Single(result.Exceptions, item => item.Type == RuleCatalog.PaymentWithoutOrder);
        Assert.Equal("PAY-ORPHAN", exception.PaymentId);
        Assert.Equal(77m, Assert.Single(result.Summary.CurrencyTotals).UnmatchedPaymentAmount);
        Assert.Equal(0m, Assert.Single(result.Matches).PaidAmount);
    }

    [Fact]
    public void Missing_required_fields_are_queued_and_not_matched()
    {
        var result = TestData.Reconcile(
            TestData.Orders(TestData.Order("ORD-MISSING-AMOUNT", amount: "")),
            TestData.Payments(TestData.Payment(orderId: "", amount: "100.00")));

        Assert.Empty(result.Matches);
        Assert.Equal(2, result.Exceptions.Count(item => item.Type == RuleCatalog.MissingField));
        Assert.Contains(result.Exceptions, item => item.Field == "amount");
        Assert.Contains(result.Exceptions, item => item.Field == "order_id");
    }

    [Fact]
    public void Cross_currency_payment_is_not_converted()
    {
        var result = TestData.Reconcile(
            TestData.Orders(TestData.Order(currency: "CNY", amount: "100.00")),
            TestData.Payments(TestData.Payment(currency: "USD", amount: "100.00")));

        Assert.Equal("currency_mismatch", Assert.Single(result.Matches).Status);
        Assert.Contains(result.Exceptions, item => item.Type == RuleCatalog.CurrencyMismatch);
        Assert.Equal(0m, Assert.Single(result.Matches).PaidAmount);
    }

    [Fact]
    public void Duplicate_payment_id_is_queued_and_only_canonical_row_is_allocated()
    {
        var result = TestData.Reconcile(
            TestData.Orders(TestData.Order(amount: "100.00")),
            TestData.Payments(
                TestData.Payment("PAY-DUP", amount: "100.00"),
                TestData.Payment("PAY-DUP", amount: "100.00")));

        Assert.Equal(100m, Assert.Single(result.Matches).PaidAmount);
        Assert.Single(result.Exceptions, item => item.Type == RuleCatalog.DuplicatePayment);
    }

    [Fact]
    public void Identical_input_has_identical_business_result_and_hash()
    {
        var orders = TestData.Orders(TestData.Order());
        var payments = TestData.Payments(TestData.Payment());
        var first = TestData.Reconcile(orders, payments);
        var second = TestData.Reconcile(orders, payments);

        Assert.Equal(first.RunId, second.RunId);
        Assert.Equal(first.InputHash, second.InputHash);
        Assert.Equal(JsonSerializer.Serialize(first.Summary), JsonSerializer.Serialize(second.Summary));
        Assert.Equal(JsonSerializer.Serialize(first.Matches), JsonSerializer.Serialize(second.Matches));
        Assert.Equal(JsonSerializer.Serialize(first.Exceptions), JsonSerializer.Serialize(second.Exceptions));
        Assert.Equal(64, first.InputHash.Length);
        Assert.NotEqual(first.InputHash, TestData.Reconcile(orders + "\n", payments).InputHash);
    }

    [Fact]
    public void Dry_run_and_simulation_mode_never_report_production_writes()
    {
        var orders = TestData.Orders(TestData.Order());
        var payments = TestData.Payments(TestData.Payment());

        Assert.Equal(0, TestData.Reconcile(orders, payments, dryRun: true).Execution.ProductionWrites);
        var simulation = TestData.Reconcile(orders, payments, dryRun: false);
        Assert.Equal(0, simulation.Execution.ProductionWrites);
        Assert.True(simulation.Execution.SimulationOnly);
        Assert.All(simulation.PlannedActions, action => Assert.Equal("planned_not_executed", action.Status));
    }

    [Fact]
    public void Synthetic_fixture_has_expected_volume_and_exception_coverage()
    {
        var (orders, payments) = TestData.LoadFixtures();
        Assert.Equal(101, File.ReadAllLines(Path.Combine(TestData.FindRepositoryRoot(), "fixtures", "orders.csv")).Length);
        Assert.Equal(71, File.ReadAllLines(Path.Combine(TestData.FindRepositoryRoot(), "fixtures", "payments.csv")).Length);

        var result = TestData.Reconcile(orders, payments);

        Assert.Equal(100, result.Summary.TotalOrderRows);
        Assert.Equal(70, result.Summary.TotalPaymentRows);
        Assert.Equal(97, result.Summary.ValidOrderRows);
        Assert.Equal(68, result.Summary.ValidPaymentRows);
        Assert.Equal(96, result.Summary.UniqueOrders);
        Assert.Equal(63, result.Summary.MatchedOrders);
        Assert.Equal(32, result.Summary.UnpaidOrders);
        Assert.Equal(1, result.Summary.AmountMismatchOrders);
        Assert.Equal(1, result.Summary.DuplicateOrderGroups);
        Assert.Equal(41, result.Summary.ExceptionCount);
        Assert.Equal(1, result.Summary.ExceptionsByType[RuleCatalog.DuplicateOrder]);
        Assert.Equal(1, result.Summary.ExceptionsByType[RuleCatalog.AmountMismatch]);
        Assert.Equal(5, result.Summary.ExceptionsByType[RuleCatalog.MissingField]);
        Assert.Equal(32, result.Summary.ExceptionsByType[RuleCatalog.UnpaidOrder]);
        Assert.Equal(2, result.Summary.ExceptionsByType[RuleCatalog.PaymentWithoutOrder]);
        Assert.Equal(0, result.Execution.ProductionWrites);
    }

    [Fact]
    public void Report_and_csv_exports_are_bilingual_and_complete()
    {
        var result = TestData.Reconcile(
            TestData.Orders(TestData.Order()),
            TestData.Payments());

        var report = ReportRenderer.RenderMarkdown(result, "both");
        Assert.Contains("Reconciliation daily report / 对账日报", report);
        Assert.Contains("Safety boundary / 安全边界", report);
        Assert.Contains("Production writes", report);
        Assert.Contains("生产写入", report);
        Assert.Contains("0 (no ERP", report);

        var csv = ReportRenderer.RenderExceptionsCsv(result);
        Assert.StartsWith("exception_id,type,severity", csv);
        Assert.Contains("UNPAID_ORDER", csv);
        Assert.Contains("未回款", csv);
    }
}
