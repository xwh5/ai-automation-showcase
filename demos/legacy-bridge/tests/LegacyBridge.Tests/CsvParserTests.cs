using LegacyBridge.Core.Reconciliation;
using Xunit;

namespace LegacyBridge.Tests;

public sealed class CsvParserTests
{
    [Fact]
    public void Handles_quoted_commas_and_escaped_quotes()
    {
        var parsed = CsvParser.Parse(
            "\uFEFForder_id,company_code,order_date,currency,amount,customer_ref,status\n" +
            "ORD-1,SYN-A,2026-11-17,CNY,100.00,\"Customer, \"\"North\"\"\",confirmed\n",
            ["order_id", "company_code", "order_date", "currency", "amount"]);

        var row = Assert.Single(parsed.Rows);
        Assert.Equal("Customer, \"North\"", row.Get("customer_ref"));
        Assert.Equal(2, row.RowNumber);
    }

    [Fact]
    public void Handles_quoted_newlines_and_keeps_starting_line()
    {
        var parsed = CsvParser.Parse(
            "order_id,company_code,order_date,currency,amount,customer_ref,status\n" +
            "ORD-1,SYN-A,2026-11-17,CNY,100.00,\"line one\nline two\",confirmed\n" +
            "ORD-2,SYN-A,2026-11-18,CNY,200.00,SYN-2,confirmed\n",
            ["order_id", "company_code", "order_date", "currency", "amount"]);

        Assert.Equal(2, parsed.Rows.Count);
        Assert.Equal("line one\nline two", parsed.Rows[0].Get("customer_ref"));
        Assert.Equal(4, parsed.Rows[1].RowNumber);
    }

    [Fact]
    public void Rejects_missing_required_headers()
    {
        var exception = Assert.Throws<CsvFormatException>(() => CsvParser.Parse(
            "order_id,company_code\nORD-1,SYN-A\n",
            ["order_id", "company_code", "amount"]));
        Assert.Contains("amount", exception.Message);
    }

    [Fact]
    public void Records_extra_columns_as_structural_errors()
    {
        var parsed = CsvParser.Parse(
            "order_id,company_code,order_date,currency,amount\nORD-1,SYN-A,2026-11-17,CNY,100.00,extra\n",
            ["order_id", "company_code", "order_date", "currency", "amount"]);

        var row = Assert.Single(parsed.Rows);
        Assert.Contains("CSV_COLUMN_COUNT", Assert.Single(row.StructuralErrors));
    }

    [Fact]
    public void Rejects_unterminated_quotes()
    {
        Assert.Throws<CsvFormatException>(() => CsvParser.Parse(
            "order_id,company_code,order_date,currency,amount\n\"ORD-1,SYN-A,2026-11-17,CNY,100.00\n",
            ["order_id", "company_code", "order_date", "currency", "amount"]));
    }
}
