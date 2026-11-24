# Legacy Bridge · 遗留系统对账桥

> **7 天公司资产底座 / Day 07 company asset foundation — legacy systems demo**
> A runnable, testable, bilingual reconciliation bridge built entirely from synthetic CSV data.
> 一个可运行、可测试、双语的对账桥 demo，全部使用合成 CSV 数据。

**Safety boundary / 安全边界:** this demo does **not** connect to ERP, banking, production databases, or payment systems. It does **not** post accounting entries or send payments. Dry-run is the default; even `dryRun=false` is simulation-only and reports `productionWrites: 0`.
**安全边界：** 本 demo **不连接** ERP、银行、生产数据库或支付系统，**不自动记账、不付款**。默认预演；即使 `dryRun=false` 也只是模拟，`productionWrites` 始终为 `0`。

---

## 1. What it does / 功能

- Accepts two UTF-8 CSV files: orders and payments.
  接收两份 UTF-8 CSV：订单与回款。
- Parses and stages every row in local SQLite, including malformed or incomplete rows.
  将每一行（含格式错误或缺字段行）解析并暂存到本地 SQLite。
- Produces deterministic match results, an exception queue, planned actions, and a daily Markdown report.
  生成确定性匹配结果、异常队列、未来动作计划与每日 Markdown 日报。
- Records request id, rule version, input hash, and append-only audit events.
  记录请求标识、规则版本、输入哈希与追加式审计事件。
- Reuses the same business run for byte-identical input, while auditing every submission.
  字节完全相同的输入复用同一业务运行，同时审计每次提交。
- Provides a standalone static page that can be hosted separately from the local API.
  提供可与本地 API 分离托管的独立静态页面。

## 2. Architecture / 架构

```text
Browser / Pages static page
          |
          | API mode (primary): multipart/form-data or application/json
          v
.NET 10 Minimal API  -----> Reconciliation engine (pure, deterministic)
          |                         |
          |                         +--> matches + exceptions + report
          v
SQLite local staging
  runs / staged_orders / staged_payments / matches /
  exceptions / planned_actions / audit_events
          |
          +--> GET runs, run detail, exceptions.csv, report.md

If the API is unreachable / 若 API 不可达:
Browser / Pages ------> web/reconcile.js + ../fixtures/*.csv
          |
          +--> browser-only matches + exceptions + report
              NO server audit / NO persistence / 无服务端审计或持久化

Production ERP / bank / ledger: NO CONNECTION, NO WRITES
生产 ERP / 银行 / 账务系统：无连接、无写入
```

- `LegacyBridge.Core` contains CSV parsing, validation, matching, hashing, and rendering.
  `LegacyBridge.Core` 包含 CSV 解析、校验、匹配、哈希与报表渲染。
- `LegacyBridge.Api` contains Minimal API endpoints and SQLite persistence.
  `LegacyBridge.Api` 包含 Minimal API 端点与 SQLite 持久化。
- `web/` is plain HTML/CSS/JavaScript with no CDN, framework, or build step. `web/reconcile.js` mirrors rule version `1.0.0` for browser-only preview; Node tests assert fixture parity with the API.
  `web/` 是纯 HTML/CSS/JavaScript，无 CDN、框架或构建步骤。`web/reconcile.js` 为浏览器预览镜像 `1.0.0` 规则；Node 测试断言 fixture 与 API 结果一致。
- SQLite is a local implementation detail, not a production system of record.
  SQLite 是本地实现细节，不是生产记录系统。

## 3. CSV contract / CSV 契约

Headers are case-insensitive; extra columns are preserved in staging. Required columns must exist.
表头不区分大小写；额外列会保留在暂存中。必需列必须存在。

### Orders / 订单

| Column | Required | Meaning |
| --- | --- | --- |
| `order_id` | yes | Order id / 订单号 |
| `company_code` | yes | Company scope / 公司范围 |
| `order_date` | yes | `yyyy-MM-dd` / 订单日期 |
| `currency` | yes | Three-letter code, e.g. `CNY` / 三位币种代码 |
| `amount` | yes | Non-negative decimal / 非负金额 |
| `customer_ref` | no | Synthetic customer reference / 合成客户引用 |
| `status` | no | Synthetic order status / 合成订单状态 |

### Payments / 回款

| Column | Required | Meaning |
| --- | --- | --- |
| `payment_id` | yes | Unique payment id / 回款编号 |
| `company_code` | yes | Company scope / 公司范围 |
| `order_id` | yes | Source order id / 来源订单号 |
| `payment_date` | yes | `yyyy-MM-dd` / 回款日期 |
| `currency` | yes | Three-letter code / 三位币种代码 |
| `amount` | yes | Positive decimal / 正金额 |
| `reference` | no | Synthetic bank reference / 合成银行引用 |

## 4. Rules / 对账规则

Rule version: `legacy-reconcile/1.0.0`.
规则版本：`legacy-reconcile/1.0.0`。

1. Business key is `company_code + order_id`; ids and company codes are trimmed and uppercased.
   业务键为 `company_code + order_id`；编号与公司代码去除首尾空格并转为大写。
2. Same-currency payments are summed per order and rounded to two decimals. No FX conversion is performed.
   按订单汇总同币种回款，保留两位小数；不执行汇率换算。
3. `DUPLICATE_ORDER`: all rows in a duplicate group are queued. The earliest date, then lowest row number, is the provisional match basis.
   `DUPLICATE_ORDER`：重复组全部进入异常；暂以日期最早、其次行号最小的记录作为匹配基准。
4. `AMOUNT_MISMATCH`: allocated payments exceed the order amount.
   `AMOUNT_MISMATCH`：已分配回款超过订单金额。
5. `UNPAID_ORDER`: no payment, a partial payment, or an outstanding positive balance.
   `UNPAID_ORDER`：无回款、部分回款或仍有正差额。
6. `MISSING_FIELD` / `INVALID_FIELD` / `CSV_STRUCTURE`: incomplete, invalid, or structurally malformed rows are staged and queued, never silently dropped.
   `MISSING_FIELD` / `INVALID_FIELD` / `CSV_STRUCTURE`：缺字段、值无效或结构错误行会暂存并进入异常，不会静默丢弃。
7. `PAYMENT_WITHOUT_ORDER`: a valid payment has no canonical source order in the same company.
   `PAYMENT_WITHOUT_ORDER`：有效回款在同一公司中找不到规范来源订单。
8. `CURRENCY_MISMATCH` and `DUPLICATE_PAYMENT` are also detected.
   同时检测 `CURRENCY_MISMATCH`（币种不符）与 `DUPLICATE_PAYMENT`（重复回款）。

### Idempotency / 幂等

- Input hash is SHA-256 over length-prefixed UTF-8 blocks for both CSV documents.
  输入哈希对两份 CSV 的长度前缀 UTF-8 块计算 SHA-256。
- Run id is derived from the input hash. Byte-identical input returns the same run id and business result.
  运行编号由输入哈希派生；字节完全相同的输入返回相同运行编号与业务结果。
- A new `requestId` and audit event are recorded for every submission, including replays.
  每次提交（包括复用）都会记录新的 `requestId` 与审计事件。
- Line-ending or whitespace changes are different input bytes and therefore different hashes.
  换行符或空白变化属于不同输入字节，因此会产生不同哈希。

## 5. Run locally / 本地运行

Prerequisite: .NET 10 SDK. No database server, ERP, bank, API key, or external service is required.
前置条件：.NET 10 SDK。无需数据库服务器、ERP、银行、API 密钥或外部服务。

```bash
cd demos/legacy-bridge
dotnet restore
dotnet run --project src/LegacyBridge.Api/LegacyBridge.Api.csproj
```

Open / 打开:

```text
http://127.0.0.1:5087/index.html
```

The API defaults to `http://127.0.0.1:5087`. SQLite is created at `src/LegacyBridge.Api/data/legacy-bridge.db`; runtime databases are git-ignored.
API 默认地址为 `http://127.0.0.1:5087`。SQLite 创建于 `src/LegacyBridge.Api/data/legacy-bridge.db`，运行时数据库已被 git 忽略。

Use another database path / 使用其他数据库路径:

```bash
LEGACY_BRIDGE_DB=/tmp/legacy-bridge-demo.db dotnet run --project src/LegacyBridge.Api/LegacyBridge.Api.csproj
```

### Host the static page on Pages / 在 Pages 托管静态页

API mode is primary. Publish `web/` as static assets and also publish `fixtures/` at the relative `../fixtures/` path expected by the preview fallback. The page itself does not need .NET.
API 模式为主。将 `web/` 作为静态资源发布，并在预览降级所需的相对 `../fixtures/` 路径发布 `fixtures/`。页面本身不需要 .NET。

1. Start the API locally for full audit/persistence mode.
   本地启动 API 可使用完整审计/持久化模式。
2. Open the Pages URL and set the API address to `http://127.0.0.1:5087`, or append `?api=http%3A%2F%2F127.0.0.1%3A5087`.
   打开 Pages 地址，将 API 地址设为 `http://127.0.0.1:5087`，或追加 `?api=http%3A%2F%2F127.0.0.1%3A5087`。
3. If the browser blocks requests to a local network service, allow local-network access for the Pages origin. The API sends permissive demo CORS headers and supports private-network preflight.
   若浏览器阻止访问本地网络服务，请为 Pages 来源允许本地网络访问。API 提供 demo 用的宽松 CORS 头并支持私网预检。
4. If the API is unreachable, the page loads `../fixtures/orders.csv` and `../fixtures/payments.csv`, runs the same fixed rule version in browser memory, and displays **“Browser preview mode · no server audit/persistence”**. Preview run ids use `preview-`, no server request id is issued, and exports are local Blob downloads.
   若 API 不可达，页面从 `../fixtures/orders.csv` 与 `../fixtures/payments.csv` 载入样本，在浏览器内存执行同版本固定规则，并显示 **“Browser preview mode · no server audit/persistence”**。预览运行编号使用 `preview-`，不签发服务端请求标识，导出为本地 Blob 下载。
5. Use synthetic data only.
   仅使用合成数据。

Pure static preview / 纯静态预览:

```bash
python3 -m http.server 4173 --directory demos/legacy-bridge
# Open http://127.0.0.1:4173/web/index.html
# 打开 http://127.0.0.1:4173/web/index.html
```

## 6. API / 接口

### Upload two CSV files / 上传两份 CSV

```bash
curl -i -X POST http://127.0.0.1:5087/api/reconcile \
  -H 'X-Request-Id: smoke-001' \
  -F 'orders=@fixtures/orders.csv' \
  -F 'payments=@fixtures/payments.csv' \
  -F 'dryRun=true'
```

`dryRun` defaults to `true`.
`dryRun` 默认为 `true`。

### Submit JSON / 提交 JSON

```json
{
  "ordersCsv": "order_id,company_code,order_date,currency,amount\nORD-1,SYN-A,2026-11-17,CNY,100.00\n",
  "paymentsCsv": "payment_id,company_code,order_id,payment_date,currency,amount\nPAY-1,SYN-A,ORD-1,2026-11-18,CNY,100.00\n",
  "dryRun": true,
  "requestId": "json-001"
}
```

### Endpoints / 端点

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/reconcile` | Upload or submit synthetic CSV data / 上传或提交合成 CSV |
| `GET` | `/api/runs?limit=20&offset=0` | List runs / 运行列表 |
| `GET` | `/api/runs/{id}` | Run detail, matches, exceptions, staging, audit / 运行详情、匹配、异常、暂存、审计 |
| `GET` | `/api/runs/{id}/exceptions.csv` | UTF-8 BOM CSV export / 带 BOM 的 CSV 导出 |
| `GET` | `/api/runs/{id}/report.md?lang=both` | Daily report; `lang=zh`, `en`, or `both` / 日报语言 |
| `GET` | `/api/health` | Health and rule version / 健康检查与规则版本 |
| `GET` | `/api/sample/orders.csv` | Synthetic sample / 合成订单样本 |
| `GET` | `/api/sample/payments.csv` | Synthetic sample / 合成回款样本 |

Response headers include `X-Request-Id`, `X-Rule-Version`, `X-Input-Hash`, and `Idempotency-Replayed`. New runs return `201`; replays return `200`.
响应头包含 `X-Request-Id`、`X-Rule-Version`、`X-Input-Hash` 与 `Idempotency-Replayed`。新运行返回 `201`，幂等复用返回 `200`。

## 7. Acceptance / 验收

Fixtures: `fixtures/orders.csv` has **100 data rows**; `fixtures/payments.csv` has **70 data rows**.
Fixture：`fixtures/orders.csv` 有 **100 条数据**；`fixtures/payments.csv` 有 **70 条数据**。

Expected fixture result / fixture 预期结果:

| Metric | Value |
| --- | ---: |
| Valid order rows / 有效订单行 | 97 |
| Valid payment rows / 有效回款行 | 68 |
| Unique orders / 唯一订单 | 96 |
| Fully matched / 完全匹配 | 63 |
| Unpaid / 未回款 | 32 |
| Amount mismatch / 金额不符 | 1 |
| Duplicate order groups / 重复订单组 | 1 |
| Missing-field exceptions / 缺字段异常 | 5 |
| Payments without order / 无来源回款 | 2 |
| Total exceptions / 异常总数 | 41 |
| Production writes / 生产写入 | 0 |

Acceptance checks / 验收检查:

```bash
dotnet build LegacyBridge.slnx --configuration Release
dotnet test LegacyBridge.slnx --configuration Release
npm test
node --check web/app.js
node --check web/reconcile.js
```

- Submit the same fixture twice in API mode: the second response has the same `runId` and `replayed: true`.
  API 模式同一 fixture 提交两次：第二次 `runId` 相同且 `replayed: true`。
- Confirm every API run has a request id, rule version, input hash, and audit event. Browser preview explicitly has none of these server-side records.
  确认每个 API 运行都有请求标识、规则版本、输入哈希与审计事件；浏览器预览明确不生成这些服务端记录。
- Confirm `productionWrites` is always `0`.
  确认 `productionWrites` 始终为 `0`。
- Confirm API mode remains primary when `/api/health` is reachable.
  确认 `/api/health` 可达时 API 模式优先。
- With the API unreachable, confirm the preview banner, relative fixture loading, 63/32/41 results, local report, and Blob exports work without port `5087`.
  API 不可达时，确认预览横幅、相对 fixture 载入、63/32/41 结果、本地日报与 Blob 导出在无 `5087` 情况下工作。

## 8. Tests / 测试

The .NET suite covers money rounding and split payments, duplicate orders, amount mismatch, unpaid orders, payments without source orders, missing fields, cross-currency handling, CSV quoting, deterministic hashes, dry-run behavior, fixture totals, multipart/JSON APIs, SQLite staging, audit, idempotent replay, exports, pagination, and static/sample endpoints.
.NET 测试覆盖金额舍入与拆分回款、重复订单、金额不符、未回款、无来源回款、缺字段、跨币种、CSV 引号、确定性哈希、预演行为、fixture 总数、multipart/JSON API、SQLite 暂存、审计、幂等复用、导出、分页与静态/样本端点。

The Node suite covers the browser preview core: exact API fixture hash and totals, split payments, duplicates, overpayment, unpaid/orphan/missing-field rules, deterministic preview ids, CSV quoting, bilingual exports, and zero production writes.
Node 测试覆盖浏览器预览核心：与 API 一致的 fixture 哈希与总数、拆分回款、重复、多付、未回款/无来源/缺字段、确定性预览编号、CSV 引号、双语导出与零生产写入。

See [TEST_RESULTS.md](TEST_RESULTS.md) for recorded commands and results.
记录的命令与结果见 [TEST_RESULTS.md](TEST_RESULTS.md)。

### Demo video / 演示视频

- [MP4 · 53 seconds](verification/demo.mp4)
- [WebM · 53 seconds](verification/demo.webm)
- [Lightweight GIF preview](verification/demo-preview.gif)
- [Recording script](verification/record-demo.js)

## 9. Known limitations / 已知限制

- This is an offline showcase, not a production reconciliation service.
  这是离线作品集 demo，不是生产对账服务。
- No authentication, tenant isolation, encryption at rest, backup, or retention policy is implemented. Bind to loopback and use synthetic data only.
  未实现认证、租户隔离、静态加密、备份或保留策略。仅绑定回环地址并使用合成数据。
- SQLite is single-node local staging; it is not a distributed ledger or production system of record.
  SQLite 是单机本地暂存，不是分布式账本或生产记录系统。
- CSV inputs are limited to 2 MiB per file and 10,000 data rows per file.
  每个 CSV 限制为 2 MiB、10,000 条数据行。
- Amounts are rounded to two decimals; there is no FX conversion, fee, tax, refund, or chargeback model.
  金额保留两位小数；无汇率换算、手续费、税费、退款或拒付模型。
- Duplicate-order matching is provisional and always requires human review.
  重复订单匹配仅为临时基准，始终需要人工复核。
- CORS is intentionally permissive for local/Pages demo use. Do not expose this API to untrusted networks.
  为本地/Pages demo 刻意采用宽松 CORS；不要暴露给不可信网络。
- Pages over HTTPS may require browser permission for local-network access.
  HTTPS Pages 可能需要浏览器授予本地网络访问权限。
- Browser preview mirrors the C# rules but has no server audit, persistence, run history, or request id. It requires Web Crypto and a static host that publishes `fixtures/` at `../fixtures/`.
  浏览器预览镜像 C# 规则，但无服务端审计、持久化、运行历史或请求标识；需要 Web Crypto，并要求静态托管在 `../fixtures/` 发布 `fixtures/`。
- A failed API health probe can appear as a network error in browser developer tools before preview fallback; it is expected and not a preview processing failure.
  API 健康检查失败在浏览器降级前可能显示为网络错误；这是预期探测行为，不是预览处理失败。

## 10. File map / 文件清单

```text
demos/legacy-bridge/
  global.json
  package.json
  LegacyBridge.slnx
  README.md
  TEST_RESULTS.md
  fixtures/orders.csv
  fixtures/payments.csv
  src/LegacyBridge.Core/Reconciliation/
  src/LegacyBridge.Api/
  tests/LegacyBridge.Tests/
  tests/web/preview.test.mjs
  web/index.html
  web/styles.css
  web/app.js
  web/reconcile.js
```

No real customer data, credentials, bank details, or production connection strings are included.
不包含真实客户数据、凭据、银行明细或生产连接串。
