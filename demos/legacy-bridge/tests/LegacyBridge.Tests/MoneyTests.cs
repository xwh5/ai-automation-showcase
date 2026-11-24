using LegacyBridge.Core.Reconciliation;
using Xunit;

namespace LegacyBridge.Tests;

public sealed class MoneyTests
{
    [Theory]
    [InlineData("100.00", 100.00)]
    [InlineData("1,234.56", 1234.56)]
    [InlineData("1.005", 1.01)]
    [InlineData("0", 0.00)]
    public void Parses_and_rounds_invariant_amounts(string input, double expected)
    {
        Assert.True(Money.TryParse(input, 0m, out var amount));
        Assert.Equal((decimal)expected, amount);
    }

    [Theory]
    [InlineData("")]
    [InlineData("-0.01")]
    [InlineData("abc")]
    [InlineData("10000000000.00")]
    public void Rejects_invalid_order_amounts(string input)
    {
        Assert.False(Money.TryParse(input, 0m, out _));
    }

    [Fact]
    public void Split_payments_sum_to_exact_two_decimal_total()
    {
        Assert.True(Money.TryParse("30.10", 0.01m, out var first));
        Assert.True(Money.TryParse("69.90", 0.01m, out var second));
        Assert.Equal(100m, Money.Round(first + second));
    }

    [Fact]
    public void Payment_amount_must_be_positive()
    {
        Assert.False(Money.TryParse("0.00", 0.01m, out _));
    }
}
