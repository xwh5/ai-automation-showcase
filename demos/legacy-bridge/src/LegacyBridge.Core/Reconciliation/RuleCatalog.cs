using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace LegacyBridge.Core.Reconciliation;

public static class RuleCatalog
{
    public const string Version = "legacy-reconcile/1.0.0";

    public const string DuplicateOrder = "DUPLICATE_ORDER";
    public const string AmountMismatch = "AMOUNT_MISMATCH";
    public const string MissingField = "MISSING_FIELD";
    public const string InvalidField = "INVALID_FIELD";
    public const string UnpaidOrder = "UNPAID_ORDER";
    public const string PaymentWithoutOrder = "PAYMENT_WITHOUT_ORDER";
    public const string CurrencyMismatch = "CURRENCY_MISMATCH";
    public const string DuplicatePayment = "DUPLICATE_PAYMENT";
    public const string CsvStructure = "CSV_STRUCTURE";
}

public static class Money
{
    public static decimal Round(decimal value) => decimal.Round(value, 2, MidpointRounding.AwayFromZero);

    public static bool TryParse(string? value, decimal minimum, out decimal amount)
    {
        amount = 0m;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        if (!decimal.TryParse(value.Trim(), NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed)
            || parsed < minimum
            || parsed > 9_999_999_999.99m)
        {
            return false;
        }

        amount = Round(parsed);
        return true;
    }

    public static string Format(decimal value) => value.ToString("F2", CultureInfo.InvariantCulture);
}

public static class Fingerprint
{
    public static string HashText(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexStringLower(bytes);
    }

    public static string HashPair(string ordersCsv, string paymentsCsv)
    {
        using var stream = new MemoryStream();
        using (var writer = new BinaryWriter(stream, Encoding.UTF8, leaveOpen: true))
        {
            WriteBlock(writer, "orders", ordersCsv);
            WriteBlock(writer, "payments", paymentsCsv);
        }

        return Convert.ToHexStringLower(SHA256.HashData(stream.ToArray()));
    }

    private static void WriteBlock(BinaryWriter writer, string label, string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value);
        writer.Write(label);
        writer.Write(bytes.Length);
        writer.Write(bytes);
    }
}
