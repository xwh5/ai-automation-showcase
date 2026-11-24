# Price Evidence Desk / 价格证据台

> A static, offline, bilingual price-intelligence demo. Every price, match, conflict and blind-test error stays inspectable.
>
> 一个纯静态、离线、双语的价格情报演示。每个价格、匹配、冲突和盲测错误都可检查。

**Scope / 范围:** only `demos/price-console/`. All data is synthetic. No real platform is scraped, no logged-in price is shown, no login state is stored, and no purchase can be triggered. Source URLs use reserved `example.com`, `example.net` and `example.org` domains and are never requested.

---

## English

### Run

No install, build step, CDN, API key or network connection is required to view the delivered page.

1. Open [`index.html`](index.html) directly with a modern browser (`file://` works).
2. Or serve this folder:

   ```bash
   cd demos/price-console
   python3 -m http.server 4187 --bind 127.0.0.1
   # Open http://127.0.0.1:4187/index.html
   ```

The browser uses classic local scripts, not ES-module imports. This avoids the `file://` module CORS restriction. [`src/*.mjs`](src/) is the canonical core; [`dist/core.js`](dist/core.js) is a generated classic-script bundle.

### Develop and test

```bash
cd demos/price-console
node scripts/build.mjs   # regenerate dist/core.js after core edits
node --test              # 22 tests, no third-party test dependency
```

Do not edit `dist/core.js` by hand. The test suite checks that it is current and executable as a classic script.

### Synthetic fixture

| Item | Count |
| --- | ---: |
| Catalog SKUs | 30 |
| Synthetic sources | 3 |
| Offer observations | 90 |
| History points | 540 |
| Blind-test probes | 20 |

- Sources: Example Shop Alpha, Example Compare Beta, Example Catalog Gamma.
- Currency: CNY. History covers six fixed dates with three source series per SKU.
- Brands, products, prices, timestamps and URLs are generated demonstration data.
- **Reload fixture** restores the built-in fixture. **Import JSON** accepts a fixture object with `products`, `sources`, `observations`, `history` and optional `blindCases`. Exported analysis JSON is a report, not an import fixture.
- Import validation rejects duplicate IDs, unknown references, invalid prices/timestamps/confidences, non-synthetic URLs and fixtures declaring themselves non-synthetic.

### Features

- SKU normalization: NFKC/case/punctuation cleanup, brand aliases, compound model parsing, color aliases, pack size and price basis.
- Catalog-assisted same-product matching with a visible score and hard identity checks.
- Like-for-like price ranges, source coverage, price-history SVG and a normalizer workbench.
- Conflict and low-confidence states are explicit. Conflicting or low-confidence clusters never receive a consolidated price.
- Evidence drawer: source, UTC observation time, raw title/SKU, basis, confidence, match score, source reliability, score components and synthetic URL.
- JSON and CSV export. CSV includes matched and unmatched offers and neutralizes spreadsheet-formula prefixes.
- Complete English/Chinese UI switch; language is kept in memory only.

### Decision rules

| Field | Exact / compatible weight | Fuzzy weight |
| --- | ---: | ---: |
| Model | 0.45 | 0.30 |
| Brand | 0.12 | 0.08 |
| Variant | 0.12 | 0 |
| Pack size | 0.10 | 0 |
| Price basis | 0.06 | 0 |
| Category | 0.05 | 0 |
| Title tokens | up to 0.10 | — |

- A brand, variant, pack, basis or category conflict is a hard rejection.
- Match score **≥ 0.78** is accepted.
- Evidence confidence **< 0.85** is marked low confidence.
- Comparable price spread **> 8%** is a conflict.
- A clear, comparable cluster may show the median as an **indicative** price. `mergedPrice` is always `null`; conflicts and review clusters withhold the indicative price.

### Blind test: raw result

The matcher does not receive expected labels. All 20 rows remain in the UI and exports.

| Metric | Raw result |
| --- | --- |
| True positives | 13 |
| False positives | 1 |
| False negatives | 2 |
| True negatives | 4 |
| Precision | 13 / 14 = **92.86%** |
| Recall | 13 / 15 = **86.67%** |

Visible errors:

| Case | Expected | Predicted | Score | Outcome |
| --- | --- | --- | ---: | --- |
| B014 | P007 | No match | 0.49 | False negative: model missing |
| B015 | P025 | No match | 0.48 | False negative: model missing |
| B016 | No match | P001 | 0.80 | False positive: one-character model typo, low confidence |

### Acceptance evidence

Validated on 2026-11-24 with Node `v24.18.0` and Chrome `151.0.7922.137`.

- `node --test`: **22 passed, 0 failed**.
- Playwright: `file://` and local HTTP server, each at **1440×1000** and **390×844** — **4/4 scenarios passed**.
- `documentElement.scrollWidth` and `body.scrollWidth` equal viewport width in every scenario; no element extends past the viewport.
- Evidence drawer also has no horizontal overflow at 390px.
- **0 console errors, 0 page errors, 0 failed requests, 0 external requests** in every scenario.
- Verified interactions: language switch, search, conflict filter, evidence drawer, normalizer/matcher, fixture import, JSON export and CSV export.

Evidence: [`verification/browser-results.json`](verification/browser-results.json), [`desktop screenshot`](verification/desktop-viewport.png), [`390px screenshot`](verification/mobile-viewport.png), [`verification report`](verification/report.md).

### Demo video / 演示视频

- [MP4 · 69 seconds](verification/demo.mp4)
- [WebM · 69 seconds](verification/demo.webm)
- [Lightweight GIF preview](verification/demo-preview.gif)
- [Recording script](verification/record-demo.js)

To repeat browser checks, start the server above, then run:

```bash
node verification/browser-check.mjs
```

The script uses an available Playwright installation and `CHROME_PATH` or `google-chrome` when present.

### Limitations

- This is a deterministic, catalog-assisted demonstration, not production entity resolution. It assumes a clean 30-SKU catalog and intentionally includes difficult probes.
- The 20-case blind set is small and hand-constructed. Its metrics demonstrate the reporting method, not statistical generalization.
- Prices exclude tax, shipping, coupons, FX and time-sensitive promotions. Basis, pack size and condition must match before comparison.
- Imported fixtures must remain synthetic and use reserved example URLs.
- No persistence, account, login state, scraping, purchasing or backend service exists.
- Modern Chromium/Firefox/Safari with native `<dialog>`, `structuredClone` and SVG support is assumed.

---

## 中文

### 运行

交付页面无需安装、构建、CDN、API 密钥或网络连接。

1. 直接用现代浏览器打开 [`index.html`](index.html)（支持 `file://`）。
2. 或在本目录启动静态服务器：

   ```bash
   cd demos/price-console
   python3 -m http.server 4187 --bind 127.0.0.1
   # 打开 http://127.0.0.1:4187/index.html
   ```

浏览器加载的是本地经典脚本，不使用 ES 模块导入，因此避开 `file://` 的模块 CORS 限制。[`src/*.mjs`](src/) 是核心源码，[`dist/core.js`](dist/core.js) 是生成的经典脚本包。

### 开发与测试

```bash
cd demos/price-console
node scripts/build.mjs   # 修改核心源码后重新生成 dist/core.js
node --test              # 22 个测试，无第三方测试依赖
```

不要手改 `dist/core.js`。测试会检查构建产物是否最新、能否作为经典脚本执行。

### 合成样本

| 项目 | 数量 |
| --- | ---: |
| 目录 SKU | 30 |
| 合成来源 | 3 |
| 报价观测 | 90 |
| 价史点 | 540 |
| 盲测探针 | 20 |

- 来源：示例商店 Alpha、示例比价 Beta、示例目录 Gamma。
- 币种：人民币。每个 SKU 有 6 个固定日期、3 条来源序列。
- 品牌、商品、价格、时间与 URL 均为生成的演示数据。
- **重新载入样本** 恢复内置数据；**导入 JSON** 接受含 `products`、`sources`、`observations`、`history` 与可选 `blindCases` 的 fixture 对象。导出的分析 JSON 是报告，不是可重新导入的 fixture。
- 导入校验拒绝重复 ID、未知引用、非法价格/时间/置信度、非合成 URL，以及声明为非合成的 fixture。

### 功能

- SKU 标准化：NFKC、大小写、标点、品牌别名、复合型号、颜色别名、件数与价格口径。
- 以目录为候选的同款匹配，显示得分与硬性身份检查。
- 同口径价格区间、来源覆盖、SVG 价史图与标准化试用区。
- 冲突与低置信度明确标记；冲突或待复核 SKU 不提供合并价。
- 证据抽屉：来源、UTC 观测时间、原始标题/SKU、口径、置信度、匹配得分、来源可靠度、得分构成与合成 URL。
- JSON/CSV 导出。CSV 同时包含已匹配与未匹配报价，并中和表格公式前缀。
- 中英双语切换；语言仅保存在内存中。

### 判定规则

| 字段 | 完全匹配权重 | 模糊权重 |
| --- | ---: | ---: |
| 型号 | 0.45 | 0.30 |
| 品牌 | 0.12 | 0.08 |
| 颜色 | 0.12 | 0 |
| 件数 | 0.10 | 0 |
| 价格口径 | 0.06 | 0 |
| 类别 | 0.05 | 0 |
| 标题词 | 最高 0.10 | — |

- 品牌、颜色、件数、口径或类别冲突直接拒绝。
- 匹配得分 **≥ 0.78** 接受。
- 证据置信度 **< 0.85** 标记为低置信度。
- 可比价差 **> 8%** 视为冲突。
- 清晰且可比的 SKU 可用中位数作为**参考价格**。`mergedPrice` 始终为 `null`；冲突与待复核 SKU 不给参考价格。

### 盲测原始结果

匹配器看不到预期标签，20 条记录全部保留在界面与导出中。

| 指标 | 原始结果 |
| --- | --- |
| 真正例 TP | 13 |
| 假正例 FP | 1 |
| 假负例 FN | 2 |
| 真负例 TN | 4 |
| 精确率 | 13 / 14 = **92.86%** |
| 召回率 | 13 / 15 = **86.67%** |

可见错误：

| 编号 | 预期 | 预测 | 得分 | 结果 |
| --- | --- | --- | ---: | --- |
| B014 | P007 | 不匹配 | 0.49 | 假负例：缺少型号 |
| B015 | P025 | 不匹配 | 0.48 | 假负例：缺少型号 |
| B016 | 不匹配 | P001 | 0.80 | 假正例：型号一字之差，低置信度 |

### 验收证据

验证环境：2026-11-24，Node `v24.18.0`，Chrome `151.0.7922.137`。

- `node --test`：**22 通过，0 失败**。
- Playwright：`file://` 与本地 HTTP 服务器，各测 **1440×1000** 与 **390×844**，共 **4/4 场景通过**。
- 所有场景的 `documentElement.scrollWidth`、`body.scrollWidth` 均等于视口宽度，没有元素越界。
- 390px 下证据抽屉也无横向溢出。
- 每个场景均为 **0 控制台错误、0 页面错误、0 失败请求、0 外部请求**。
- 已验证双语切换、搜索、冲突筛选、证据抽屉、标准化匹配、fixture 导入、JSON 导出与 CSV 导出。

证据：[`浏览器结果 JSON`](verification/browser-results.json)、[`桌面截图`](verification/desktop-viewport.png)、[`390px 截图`](verification/mobile-viewport.png)、[`验证报告`](verification/report.md)。

重复浏览器验证：先按上文启动服务器，再执行：

```bash
node verification/browser-check.mjs
```

脚本使用可用的 Playwright；若存在 `CHROME_PATH` 或 `google-chrome`，会优先使用对应浏览器。

### 限制

- 这是确定性的目录辅助演示，不是生产级实体识别；它假设目录干净，并刻意包含难例。
- 20 条盲测集较小且为人工构造，指标用于展示评估方法，不代表统计泛化能力。
- 价格不含税费、运费、优惠券、汇率与时效性促销；比较前必须统一口径、件数与成色。
- 导入数据必须保持合成，并使用保留示例 URL。
- 不提供持久化、账户、登录态、抓取、购买或后端服务。
- 需要支持原生 `<dialog>`、`structuredClone` 与 SVG 的现代 Chromium/Firefox/Safari。
