using System.Globalization;
using System.Text;

namespace LegacyBridge.Core.Reconciliation;

public static class CsvParser
{
    public static ParsedCsv Parse(string? text, IEnumerable<string> requiredHeaders, int maxRows = 10_000)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            throw new CsvFormatException("CSV content is empty. / CSV 内容为空。");
        }

        var document = text.TrimStart('\uFEFF');
        var rawRows = ParseRawRows(document);
        if (rawRows.Count == 0)
        {
            throw new CsvFormatException("CSV must contain a header. / CSV 必须包含表头。");
        }

        var headers = rawRows[0].Fields
            .Select(value => value.Trim().ToLowerInvariant())
            .ToArray();
        if (headers.Any(string.IsNullOrWhiteSpace) || headers.Distinct(StringComparer.Ordinal).Count() != headers.Length)
        {
            throw new CsvFormatException("CSV headers must be non-empty and unique. / CSV 表头不能为空或重复。");
        }

        var required = requiredHeaders.Select(value => value.Trim().ToLowerInvariant()).ToArray();
        var missing = required.Except(headers, StringComparer.Ordinal).ToArray();
        if (missing.Length > 0)
        {
            throw new CsvFormatException(
                $"CSV is missing required headers: {string.Join(", ", missing)}. / CSV 缺少必需表头：{string.Join(", ", missing)}。");
        }

        if (rawRows.Count - 1 > maxRows)
        {
            throw new CsvFormatException($"CSV exceeds the {maxRows} row limit. / CSV 超过 {maxRows} 行限制。");
        }

        var rows = new List<StagedCsvRow>(rawRows.Count - 1);
        for (var index = 1; index < rawRows.Count; index++)
        {
            var raw = rawRows[index];
            var fields = new Dictionary<string, string>(StringComparer.Ordinal);
            for (var column = 0; column < headers.Length; column++)
            {
                fields[headers[column]] = column < raw.Fields.Count ? raw.Fields[column] : string.Empty;
            }

            var structuralErrors = new List<string>();
            if (raw.Fields.Count != headers.Length)
            {
                structuralErrors.Add($"CSV_COLUMN_COUNT: expected {headers.Length}, got {raw.Fields.Count}");
            }

            rows.Add(new StagedCsvRow(raw.StartLine, fields, structuralErrors, raw.RawText));
        }

        if (rows.Count == 0)
        {
            throw new CsvFormatException("CSV has no data rows. / CSV 没有数据行。");
        }

        return new ParsedCsv(headers, rows, []);
    }

    private sealed record RawCsvRow(int StartLine, IReadOnlyList<string> Fields, string RawText);

    private static List<RawCsvRow> ParseRawRows(string document)
    {
        var rows = new List<RawCsvRow>();
        var fields = new List<string>();
        var field = new StringBuilder();
        var rowStart = 0;
        var line = 1;
        var rowLine = 1;
        var inQuotes = false;
        var afterQuote = false;
        var hasRowContent = false;

        for (var index = 0; index < document.Length; index++)
        {
            var character = document[index];

            if (inQuotes)
            {
                if (character == '"')
                {
                    if (index + 1 < document.Length && document[index + 1] == '"')
                    {
                        field.Append('"');
                        index++;
                    }
                    else
                    {
                        inQuotes = false;
                        afterQuote = true;
                    }
                }
                else
                {
                    field.Append(character == '\r' && index + 1 < document.Length && document[index + 1] == '\n'
                        ? '\n'
                        : character);
                    if (character is '\r' or '\n')
                    {
                        if (character == '\r' && index + 1 < document.Length && document[index + 1] == '\n')
                        {
                            index++;
                        }
                        line++;
                    }
                }

                continue;
            }

            if (character == '"' && !afterQuote)
            {
                if (field.Length != 0)
                {
                    throw new CsvFormatException($"Unexpected quote at line {line}. / 第 {line} 行出现非法引号。");
                }

                inQuotes = true;
                hasRowContent = true;
                continue;
            }

            if (character == ',')
            {
                fields.Add(field.ToString());
                field.Clear();
                afterQuote = false;
                hasRowContent = true;
                continue;
            }

            if (character is '\r' or '\n')
            {
                if (afterQuote)
                {
                    afterQuote = false;
                }

                fields.Add(field.ToString());
                field.Clear();
                if (hasRowContent)
                {
                    var end = index;
                    rows.Add(new RawCsvRow(rowLine, fields.ToArray(), document[rowStart..end]));
                    fields = [];
                }

                if (character == '\r' && index + 1 < document.Length && document[index + 1] == '\n')
                {
                    index++;
                }

                line++;
                rowStart = index + 1;
                rowLine = line;
                hasRowContent = false;
                continue;
            }

            if (afterQuote && !char.IsWhiteSpace(character))
            {
                throw new CsvFormatException($"Unexpected character after closing quote at line {line}. / 第 {line} 行闭合引号后存在非法字符。");
            }

            field.Append(character);
            hasRowContent = true;
        }

        if (inQuotes)
        {
            throw new CsvFormatException($"Unterminated quoted field at line {rowLine}. / 第 {rowLine} 行引号未闭合。");
        }

        if (hasRowContent || fields.Count > 0 || field.Length > 0)
        {
            fields.Add(field.ToString());
            rows.Add(new RawCsvRow(rowLine, fields.ToArray(), document[rowStart..]));
        }

        return rows;
    }
}
