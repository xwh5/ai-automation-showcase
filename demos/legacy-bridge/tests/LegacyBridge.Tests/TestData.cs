using LegacyBridge.Core.Reconciliation;

namespace LegacyBridge.Tests;

internal static class TestData
{
    public const string OrderHeader = "order_id,company_code,order_date,currency,amount,customer_ref,status";
    public const string PaymentHeader = "payment_id,company_code,order_id,payment_date,currency,amount,reference";

    public static string Orders(params string[] rows) => OrderHeader + "\n" + string.Join("\n", rows) + "\n";

    public static string Payments(params string[] rows) => PaymentHeader + "\n" + string.Join("\n", rows) + "\n";

    public static string Order(
        string id = "ORD-1",
        string company = "SYN-A",
        string date = "2026-11-17",
        string currency = "CNY",
        string amount = "100.00",
        string customer = "SYN-CUSTOMER",
        string status = "confirmed") =>
        $"{id},{company},{date},{currency},{amount},{customer},{status}";

    public static string Payment(
        string id = "PAY-1",
        string company = "SYN-A",
        string orderId = "ORD-1",
        string date = "2026-11-18",
        string currency = "CNY",
        string amount = "100.00",
        string reference = "SYN-REF") =>
        $"{id},{company},{orderId},{date},{currency},{amount},{reference}";

    public static (string Orders, string Payments) LoadFixtures()
    {
        var root = FindRepositoryRoot();
        return (
            File.ReadAllText(Path.Combine(root, "fixtures", "orders.csv")),
            File.ReadAllText(Path.Combine(root, "fixtures", "payments.csv")));
    }

    public static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            if (File.Exists(Path.Combine(directory.FullName, "LegacyBridge.slnx"))
                && File.Exists(Path.Combine(directory.FullName, "fixtures", "orders.csv")))
            {
                return directory.FullName;
            }

            directory = directory.Parent;
        }

        throw new InvalidOperationException("Could not locate the legacy-bridge fixture directory.");
    }

    public static ReconciliationResult Reconcile(string orders, string payments, bool dryRun = true) =>
        new ReconciliationEngine().Reconcile(orders, payments, dryRun);
}
