# Test results · 测试记录

**Recorded:** 2026-11-24 (Asia/Shanghai)
**Scope:** `demos/legacy-bridge/` only
**Environment:** .NET SDK `10.0.401`, .NET runtime `10.0.12`, Node `v24.18.0`, npm `11.16.0`, Ubuntu 24.04, xUnit `2.9.3`
**Rule version:** `legacy-reconcile/1.0.0`

## 1. Build / 构建

Command:

```bash
dotnet build LegacyBridge.slnx --configuration Release --nologo
```

Result / 结果:

```text
LegacyBridge.Core -> .../bin/Release/net10.0/LegacyBridge.Core.dll
LegacyBridge.Api -> .../bin/Release/net10.0/LegacyBridge.Api.dll
LegacyBridge.Tests -> .../bin/Release/net10.0/LegacyBridge.Tests.dll
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

## 2. Automated tests / 自动化测试

Command:

```bash
dotnet test LegacyBridge.slnx --configuration Release --no-build --nologo --logger "console;verbosity=minimal"
```

Result / 结果:

```text
Passed!  - Failed:     0, Passed:    35, Skipped:     0, Total:    35, Duration: ~1 s - LegacyBridge.Tests.dll (net10.0)
```

Coverage / 覆盖:

- Invariant money parsing, two-decimal rounding, split-payment totals, positive payment amounts.
  不变量金额解析、两位小数舍入、拆分回款合计、回款正金额。
- Exact matching and company-scoped keys.
  精确匹配与公司范围业务键。
- Duplicate orders, amount mismatch, unpaid orders, missing fields, payments without source orders.
  重复订单、金额不符、未回款、缺字段、无来源回款。
- Cross-currency handling, duplicate payments, CSV quoting/newlines/structural errors.
  跨币种、重复回款、CSV 引号/换行/结构错误。
- Deterministic input hash and business result; dry-run and simulation-only safety.
  确定性输入哈希与业务结果；预演与仅模拟安全边界。
- Fixture volume and exception totals.
  Fixture 数量与异常总数。
- JSON and multipart API submission, SQLite staging, audit, idempotent replay, list/detail, exports, pagination, static page, and sample endpoints.
  JSON/multipart 提交、SQLite 暂存、审计、幂等复用、列表/详情、导出、分页、静态页与样本端点。

## 3. Browser preview Node tests / 浏览器预览 Node 测试

Command:

```bash
npm test
```

Result / 结果:

```text
tests 6
pass 6
fail 0
cancelled 0
skipped 0
```

The preview module reproduces the API fixture input hash exactly (`08203c44…dda0873`) and the same 100/70 input, 63 matched, 32 unpaid, 41 exception, and 0 production-write totals. It also covers split payments, duplicate orders, overpayment, unpaid/orphan/missing-field rules, deterministic preview ids, CSV quoting, bilingual exports, and simulation-only behavior.
预览模块精确复现 API fixture 输入哈希（`08203c44…dda0873`）以及 100/70 输入、63 匹配、32 未回款、41 异常、0 生产写入总数；同时覆盖拆分回款、重复订单、多付、未回款/无来源/缺字段、确定性预览编号、CSV 引号、双语导出与仅模拟行为。

## 4. Dependency audit / 依赖审计

Command:

```bash
dotnet list LegacyBridge.slnx package --vulnerable --include-transitive
```

Result / 结果:

```text
The given project `LegacyBridge.Api` has no vulnerable packages given the current sources.
The given project `LegacyBridge.Tests` has no vulnerable packages given the current sources.
```

The SQLite native bundle is pinned to `SQLitePCLRaw.bundle_e_sqlite3` `2.1.14`; the previously cached `2.1.11` triggered a known high-severity advisory and was not retained.
SQLite 原生 bundle 固定为 `SQLitePCLRaw.bundle_e_sqlite3` `2.1.14`；未保留会触发已知高危公告的 `2.1.11`。

## 5. Fixture verification / Fixture 验证

Command:

```bash
wc -l fixtures/orders.csv fixtures/payments.csv
```

Result:

```text
101 fixtures/orders.csv
 71 fixtures/payments.csv
```

That is 100 order data rows and 70 payment data rows, plus one header row in each file.
即 100 条订单数据与 70 条回款数据，每份文件另含一行表头。

Expected and verified business totals / 预期且已验证的业务总数:

| Metric | Value |
| --- | ---: |
| Valid order rows | 97 |
| Valid payment rows | 68 |
| Unique orders | 96 |
| Fully matched | 63 |
| Unpaid | 32 |
| Amount mismatch | 1 |
| Duplicate order groups | 1 |
| Missing-field exceptions | 5 |
| Payments without order | 2 |
| Total exceptions | 41 |
| Production writes | 0 |

## 6. Real HTTP smoke test / 真实 HTTP 冒烟

The API was started on `http://127.0.0.1:5087` with an isolated temporary SQLite database. The same two fixture files were submitted twice.
API 在 `http://127.0.0.1:5087` 启动，使用独立临时 SQLite 数据库；同一组 fixture 连续提交两次。

Verified / 已验证:

- First submission: `201 Created`, `Idempotency-Replayed: false`.
  首次提交：`201 Created`，`Idempotency-Replayed: false`。
- Second submission: `200 OK`, `Idempotency-Replayed: true`.
  第二次提交：`200 OK`，`Idempotency-Replayed: true`。
- Same run id: `run-08203c44c3b98b9a2d72eb61`.
  两次运行编号相同：`run-08203c44c3b98b9a2d72eb61`。
- Same input hash: `08203c44c3b98b9a2d72eb6199c32936d8a5b039b512ee09579bac002dda0873`.
  两次输入哈希相同：`08203c44c3b98b9a2d72eb6199c32936d8a5b039b512ee09579bac002dda0873`。
- Request ids: `smoke-first`, `smoke-second`; both audit events were present.
  请求标识为 `smoke-first`、`smoke-second`；两条审计事件均存在。
- SQLite row counts: runs `1`, staged orders `100`, staged payments `70`, matches `96`, exceptions `41`, planned actions `98`, audit events `2`.
  SQLite 行数：运行 `1`、暂存订单 `100`、暂存回款 `70`、匹配 `96`、异常 `41`、计划动作 `98`、审计 `2`。
- `exceptions.csv`: 42 lines including header, UTF-8 BOM, bilingual messages.
  `exceptions.csv`：含表头共 42 行，UTF-8 BOM，双语文案。
- `report.md`: 45 lines, bilingual headings and safety boundary.
  `report.md`：45 行，双语标题与安全边界。
- Private-network CORS preflight: `204 No Content` with `Access-Control-Allow-Private-Network: true`.
  私网 CORS 预检：`204 No Content`，返回 `Access-Control-Allow-Private-Network: true`。

## 7. Browser acceptance / 浏览器验收

Tool: Playwright CLI against the API-served static page.
工具：Playwright CLI，访问 API 托管的静态页。

Verified / 已验证:

- Synthetic sample loads 100 order rows and 70 payment rows.
  合成样本载入 100 条订单与 70 条回款。
- Reconciliation renders 63 matched, 32 unpaid, 41 exceptions, and `productionWrites = 0`.
  对账显示 63 笔匹配、32 笔未回款、41 项异常，生产写入为 `0`。
- Exception table renders 41 rows; match table renders 96 rows.
  异常表 41 行；匹配表 96 行。
- Chinese and English report views both render from `report.md`.
  中文与英文日报均从 `report.md` 正常渲染。
- Language toggle, tabs, audit list, and export links work.
  语言切换、标签页、审计列表与导出链接可用。
- Browser console: 0 errors, 0 warnings after final fixes.
  最终修复后浏览器控制台：0 错误、0 警告。
- Desktop `1280×720` and mobile `390×844` screenshots were inspected; no horizontal page overflow was observed.
  已检查 `1280×720` 桌面与 `390×844` 移动截图；未观察到页面横向溢出。

Frontend syntax command:

```bash
node --check web/app.js
node --check web/reconcile.js
```

Result: exit code `0`.
结果：退出码 `0`。

## 8. Pure static browser preview / 纯静态浏览器预览

Static server command (no .NET API on port `5087` was used by this check):

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory .
```

Playwright opened:

```text
http://127.0.0.1:4173/web/index.html?api=http%3A%2F%2F127.0.0.1%3A5099
```

Port `5099` was intentionally unused to force the API-unreachable path.
端口 `5099` 故意不使用，以触发 API 不可达降级。

Verified / 已验证:

- The only API request was the failed health probe to `5099`; no request to `5087` was made.
  唯一 API 请求是发往 `5099` 的健康探测失败；未请求 `5087`。
- `../fixtures/orders.csv` and `../fixtures/payments.csv` both returned `200` from the static server.
  `../fixtures/orders.csv` 与 `../fixtures/payments.csv` 均从静态服务器返回 `200`。
- Banner text: `Browser preview mode · no server audit/persistence`.
  横幅文本：`Browser preview mode · no server audit/persistence`。
- Preview run id: `preview-08203c44c3b98b9a2d72eb61`; request field says no server request was issued.
  预览运行编号：`preview-08203c44c3b98b9a2d72eb61`；请求字段注明未签发服务端请求。
- Results: 100 order rows, 70 payment rows, 63 matched, 41 exceptions, 96 match rows, production writes `0`.
  结果：100 订单行、70 回款行、63 匹配、41 异常、96 匹配行、生产写入 `0`。
- Audit and history panels explicitly state no server audit/persistence.
  审计与历史面板明确标注无服务端审计/持久化。
- Report includes the preview boundary; CSV/Markdown export links are local `blob:` URLs.
  日报包含预览边界；CSV/Markdown 导出链接为本地 `blob:` URL。
- Local storage contains only API address and language preferences, not run data.
  Local storage 仅保存 API 地址与语言偏好，不保存运行数据。
- API-primary control: opening the same static page with reachable `5087` hid the preview banner and returned a normal `run-…` result with request id and audit.
  API 主模式对照：同一静态页指向可达 `5087` 时隐藏预览横幅，返回正常 `run-…` 结果并带请求标识与审计。
- One expected `ERR_CONNECTION_REFUSED` console entry came from the intentional health probe; there were no JavaScript exceptions or warnings.
  控制台的一条预期 `ERR_CONNECTION_REFUSED` 来自故意设置的不可达健康探测；无 JavaScript 异常或警告。
- Preview screenshot was inspected at `1280×720`.
  已检查 `1280×720` 预览截图。

## 9. Known gaps / 已知缺口

- No ERP/bank/production adapter, authentication, tenant isolation, encryption at rest, backup, or retention policy.
  无 ERP/银行/生产适配器、认证、租户隔离、静态加密、备份或保留策略。
- SQLite is local single-node staging, not a production system of record.
  SQLite 是本地单机暂存，不是生产记录系统。
- Inputs are limited to 2 MiB and 10,000 rows per CSV; amounts use two decimals and no FX conversion.
  每个 CSV 限制 2 MiB、10,000 行；金额保留两位小数且无汇率换算。
- Duplicate-order matching is provisional and always requires human review.
  重复订单匹配仅为临时基准，始终需要人工复核。
- HTTPS Pages may require browser permission for local-network access.
  HTTPS Pages 可能需要浏览器授予本地网络访问权限。
- Browser preview has no server audit, persistence, run history, or request id; it requires Web Crypto and `fixtures/` published at `../fixtures/`.
  浏览器预览无服务端审计、持久化、运行历史或请求标识；需要 Web Crypto，并在 `../fixtures/` 发布 `fixtures/`。
- The intentional failed API health probe may appear as a network error before preview fallback.
  API 不可达时，故意执行的健康探测失败可能在预览降级前显示为网络错误。

No real data, credentials, bank details, or production connection strings were used.
未使用真实数据、凭据、银行明细或生产连接串。
