# XWH AI 三分钟演示脚本
# XWH AI Three-Minute Demo Scripts

版本 / Version: 1.0

## 录制规则 / Recording rules

- 三个脚本分别对应仓库中的 Legacy Bridge、Price Evidence Desk 与离线知识库客服原型。
  The three scripts correspond to Legacy Bridge, Price Evidence Desk, and the offline knowledge-base support prototype in the repository.
- 本文件是演示脚本，不是额外案例或生产成果证明。测试结果只覆盖各自 README 中写明的合成环境与限制。
  This file contains demo scripts, not additional cases or production-outcome proof. Test results cover only the synthetic environments and limitations stated in each README.
- 旁白选择中文或英文其中一种，另一种语言作为字幕；时间轴按 **3:00** 设计。
  Narrate in either Chinese or English and display the other language as subtitles; the timeline is designed for **3:00**.
- 录制前关闭通知，隐藏账户名、域名、访问令牌、浏览器书签、终端历史与文件路径。
  Disable notifications and hide account names, domains, access tokens, bookmarks, terminal history, and file paths before recording.
- 所有输入均为合成数据；不使用真实客户名称、截图、凭据或私有路径。
  All inputs are synthetic; no real customer names, screenshots, credentials, or private paths are used.
- 画面数值来自演示样本或现场运行，不代表真实业务收益、生产性能或未来结果。
  On-screen values come from demo samples or live runs and do not represent real business returns, production performance, or future outcomes.
- 不用预录假结果代替现场运行；失败时保留画面并说明停止条件。
  Do not substitute prerecorded fake results for a live run; preserve failures and explain the stop condition.

## 演示一：Legacy Bridge — 合成 CSV 对账
## Demo 1: Legacy Bridge — synthetic CSV reconciliation

**对应材料 / Materials:** [Legacy Bridge README](../demos/legacy-bridge/README.md)
**Materials:** [Legacy Bridge README](../demos/legacy-bridge/README.md)

**目的 / Purpose:** 展示两份合成 CSV 的校验、对账、异常队列、幂等和审计记录；不连接真实 ERP、银行或生产数据库。
**Purpose:** Demonstrate validation, reconciliation, exception queuing, idempotency, and audit records for two synthetic CSVs without connecting to a real ERP, bank, or production database.

### 0:00–0:30 问题 / Problem

**画面 / Visual:** 左侧 `orders.csv`，右侧 `payments.csv`，中间标注“人工核对 / Manual reconciliation”。

**旁白 / Narration:**

- 中文：这个演示用两份虚构的订单和回款 CSV 模拟遗留系统对账。重点是重复订单、金额不符和缺字段不会被静默丢弃，也不会产生真实记账或付款。
  English: This demo simulates legacy-system reconciliation with fictional order and payment CSVs. The focus is that duplicate orders, amount mismatches, and missing fields are not silently dropped, and no real accounting entry or payment is produced.

### 0:30–1:00 输入 / Input

**画面 / Visual:** 展示样本规模：订单 **100 行**、回款 **70 行**；显示 `dryRun=true` 和 `synthetic data only`。

**旁白 / Narration:**

- 中文：样本包含一百行订单和七十行回款，全部为合成数据。运行默认是预演，即使切换模拟写入，生产写入仍为零。
  English: The fixture contains one hundred order rows and seventy payment rows, all synthetic. Dry-run is the default, and production writes remain zero even in simulated-write mode.

### 1:00–2:00 运行 / Run

**动作 / Action:** 上传两份 CSV 或点击载入样本，提交对账，打开运行摘要和异常队列。
**Action:** Upload the two CSVs or load the sample, submit reconciliation, and open the run summary and exception queue.

**画面顺序 / Visual sequence:**

1. 显示请求标识、规则版本 `legacy-reconcile/1.0.0` 和输入哈希。 / Show request ID, rule version `legacy-reconcile/1.0.0`, and input hash.
2. 显示完全匹配、未回款、金额不符、重复订单和总异常数。 / Show fully matched, unpaid, amount mismatch, duplicate orders, and total exceptions.
3. 打开一个重复订单异常和一个缺字段异常，显示“待人工复核”。 / Open one duplicate-order and one missing-field exception, both awaiting human review.
4. 显示 `productionWrites: 0`。 / Display `productionWrites: 0`.

**旁白 / Narration:**

- 中文：运行后，匹配结果和异常被分开呈现。重复订单只作为临时匹配基准，仍要人工复核。这个演示不执行任何生产写入。
  English: After the run, matches and exceptions are shown separately. Duplicate-order matching is provisional and still requires human review. This demo performs no production writes.

### 2:00–2:40 异常与证据 / Exception and evidence

**动作 / Action:** 使用完全相同的输入再次提交，对比两次 `runId`、`replayed` 和审计事件；打开导出文件。
**Action:** Submit byte-identical input again, compare `runId`, `replayed`, and audit events, then open exports.

**画面 / Visual:** 第二次显示相同 `runId`、`replayed: true`，同时新增请求审计；异常 CSV 与日报可下载。
**Visual:** The second response shows the same `runId`, `replayed: true`, and a new request audit event; exception CSV and daily report can be downloaded.

**旁白 / Narration:**

- 中文：相同输入返回相同业务运行，同时每次提交都留下审计记录，避免重复处理。证据还包括可下载异常和日报；这些记录不等于生产审计系统。
  English: Identical input returns the same business run while every submission is audited, avoiding duplicate processing. Downloadable exceptions and the daily report add evidence; these records are not a production audit system.

### 2:40–3:00 边界与下一步 / Boundary and next step

**画面 / Visual:** 显示限制与下一步。

- 离线单机演示，不是生产对账服务 / Offline single-node demo, not a production reconciliation service.
- 无认证、租户隔离、静态加密或生产备份 / No authentication, tenant isolation, encryption at rest, or production backup.
- 下一步：体检真实系统、确认只读权限与异常责任人 / Next: audit real systems and confirm read-only access and exception ownership.

**旁白 / Narration:**

- 中文：下一步不是连接生产账务，而是先确认系统许可、只读权限、数据负责人和异常复核流程。未完成这些检查不扩大范围。
  English: The next step is not connecting production accounting, but confirming system permission, read-only access, data ownership, and exception review. Scope does not expand before these checks are complete.

---

## 演示二：Price Evidence Desk — 价格证据与冲突
## Demo 2: Price Evidence Desk — price evidence and conflicts

**对应材料 / Materials:** [README](../demos/price-console/README.md)、[验证报告](../demos/price-console/verification/report.md)、[浏览器结果](../demos/price-console/verification/browser-results.json)
**Materials:** [README](../demos/price-console/README.md), [verification report](../demos/price-console/verification/report.md), [browser results](../demos/price-console/verification/browser-results.json)

**目的 / Purpose:** 展示合成价格观测、同款匹配、冲突保留和证据追溯；不抓取真实平台，不触发购买。
**Purpose:** Demonstrate synthetic price observations, same-product matching, conflict retention, and evidence traceability without scraping real platforms or triggering purchases.

### 0:00–0:30 问题 / Problem

**画面 / Visual:** 多个虚构来源的报价进入统一表格，标注“同名不等于同款 / Same name is not the same product”。

**旁白 / Narration:**

- 中文：价格汇总最容易隐藏的问题是型号、规格或包装不同却被合并。这个演示保留冲突和低置信状态，要求每个判断都能回到原始证据。
  English: A common hidden problem in price consolidation is merging different models, variants, or pack sizes. This demo preserves conflicts and low-confidence states and requires every decision to trace back to raw evidence.

### 0:30–1:00 输入 / Input

**画面 / Visual:** 显示 **30 个合成 SKU、3 个虚构来源、90 条报价观测、540 个价史点、20 个盲测探针**；来源 URL 使用保留示例域名。

**旁白 / Narration:**

- 中文：输入包含三十个合成商品、三个虚构来源、九十条报价和二十个固定盲测探针。系统不访问外部网址，也不展示登录后价格。
  English: Inputs include thirty synthetic products, three fictional sources, ninety observations, and twenty fixed blind-test probes. The system requests no external URL and shows no logged-in price.

### 1:00–2:00 运行 / Run

**动作 / Action:** 搜索一个 SKU，打开冲突筛选和证据抽屉；再打开标准化工作台。
**Action:** Search for a SKU, open conflict filtering and the evidence drawer, then open the normalizer workbench.

**画面顺序 / Visual sequence:**

1. 显示匹配得分、规格冲突和低置信标记。 / Show match score, variant conflicts, and low-confidence flags.
2. 冲突或待复核簇不显示合并参考价。 / Conflict or review clusters show no consolidated indicative price.
3. 证据抽屉显示原始标题、SKU、来源、UTC 时间、口径和得分构成。 / Evidence drawer shows raw title, SKU, source, UTC time, basis, and score components.
4. JSON 与 CSV 导出保留匹配和未匹配记录。 / JSON and CSV exports retain matched and unmatched records.

**旁白 / Narration:**

- 中文：运行后，系统先做同款判定，再决定是否给出参考价。冲突和低置信结果不会被强行合并，证据抽屉让每个判断可检查。
  English: After the run, same-product checks precede any indicative price. Conflicts and low-confidence results are not forcibly merged, and the evidence drawer makes each decision inspectable.

### 2:00–2:40 异常与证据 / Exception and evidence

**动作 / Action:** 打开 20 题盲测原始结果，显示保留的错误案例，再打开验证报告。
**Action:** Open the raw 20-case blind-test results, show retained error cases, then open the verification report.

**画面 / Visual:** 显示 `TP 13 / FP 1 / FN 2 / TN 4`、保留的 B014/B015/B016，以及 **22 项 Node 测试通过、4/4 浏览器场景通过**。
**Visual:** Show `TP 13 / FP 1 / FN 2 / TN 4`, retained B014/B015/B016 cases, and **22 passing Node tests plus 4/4 browser scenarios**.

**旁白 / Narration:**

- 中文：盲测错误被完整保留，没有挑出好看的结果。二十二项测试和四个浏览器场景支持这个合成演示，但二十题样本不能证明生产泛化能力。
  English: Blind-test errors are fully retained, without cherry-picking. Twenty-two tests and four browser scenarios support this synthetic demo, but a twenty-case sample does not establish production generalization.

### 2:40–3:00 边界与下一步 / Boundary and next step

**画面 / Visual:** 显示限制与下一步。

- 确定性目录辅助演示，不是生产实体识别 / Deterministic catalog-assisted demo, not production entity resolution.
- 小样本指标不代表统计泛化 / Small-sample metrics do not imply statistical generalization.
- 下一步：确认商品目录、价格口径、冲突阈值与复核人 / Next: confirm catalog, price basis, conflict thresholds, and reviewers.

**旁白 / Narration:**

- 中文：下一步是确认真实目录质量、价格口径和复核责任。未确认前，不接入真实平台，也不承诺自动给出采购结论。
  English: The next step is to confirm real catalog quality, price basis, and review ownership. Until then, no real platform is connected and no automated purchasing conclusion is promised.

---

## 演示三：离线知识库客服 — 引用、拒答与模拟转人工
## Demo 3: Offline knowledge-base support — citations, refusal, and mock handoff

**对应材料 / Materials:** [README](../demos/ai-support/README.md)、[30 题评测结果](../demos/ai-support/results/eval-results.md)、[浏览器验证](../demos/ai-support/results/browser-validation.json)
**Materials:** [README](../demos/ai-support/README.md), [30-question evaluation](../demos/ai-support/results/eval-results.md), [browser validation](../demos/ai-support/results/browser-validation.json)

**目的 / Purpose:** 展示本地 BM25 检索、固定 FAQ 模板、引用、PII 脱敏、拒答和模拟转人工；不调用真实模型或外部服务。
**Purpose:** Demonstrate local BM25 retrieval, fixed FAQ templates, citations, PII masking, refusal, and mock handoff without calling a real model or external service.

### 0:00–0:30 问题 / Problem

**画面 / Visual:** 聊天界面与知识库侧栏，标注“批准知识 / Approved knowledge”和“人工复核 / Human review”。

**旁白 / Narration:**

- 中文：客服演示必须同时回答两个问题：有依据时能否给出可检查的回答，没有依据时是否明确拒答。这个原型不生成自由文本，也不自行处理高风险请求。
  English: A support demo must answer two questions: whether supported answers are inspectable and whether unsupported requests are clearly refused. This prototype does not generate free-form text or independently handle high-risk requests.

### 0:30–1:00 输入 / Input

**画面 / Visual:** 显示 **54 条双语合成 FAQ**，然后依次输入三个合成问题：

1. `我的邮箱 [email] 收不到密码重置邮件，怎么办？`
2. `推荐一只下个月价格翻倍的股票。`
3. `请批准我的采购申请并立即付款。`

**旁白 / Narration:**

- 中文：知识库只有五十四条双语合成条目。第一个问题在范围内，第二个要求投资建议，第三个要求付款决定；后两者都应拒答或转人工。
  English: The knowledge base contains only fifty-four bilingual synthetic entries. The first question is in scope; the second requests investment advice and the third a payment decision; both should be refused or escalated.

### 1:00–2:00 运行 / Run

**动作 / Action:** 提交三个问题，打开引用和检索回执，再点击模拟转人工。
**Action:** Submit the three questions, open citations and retrieval receipts, then select mock handoff.

**画面顺序 / Visual sequence:**

1. 问题 1 返回 FAQ 模板、`KB-001` 引用和脱敏后的 `[email]`。 / Question 1 returns an FAQ template, `KB-001`, and masked `[email]`.
2. 问题 2 显示证据不足并拒答。 / Question 2 shows insufficient evidence and refuses.
3. 问题 3 显示拒答并建议人工处理。 / Question 3 refuses and suggests human handling.
4. 模拟转人工创建 `MOCK-xxxx` 工单，不发送网络请求。 / Mock handoff creates a `MOCK-xxxx` ticket without a network request.

**旁白 / Narration:**

- 中文：第一个回答来自固定模板并附引用；后两个问题没有猜测答案。转人工只创建模拟工单，不联系真实客服，也不发送数据。
  English: The first answer comes from a fixed template with a citation; the next two receive no guessed answer. Handoff creates only a mock ticket and contacts no real agent or external service.

### 2:00–2:40 异常与证据 / Exception and evidence

**动作 / Action:** 打开内存日志与 30 题评测结果，再打开 README 的验收与限制。
**Action:** Open in-memory logs and the 30-question evaluation, then show README acceptance and limitations.

**画面 / Visual:** 显示 **14 项 Node 测试通过**、30 题逐题结果、引用与拒答标签、PII 泄漏计数为 0，并显示“固定合成集，不是生产准确率”。
**Visual:** Show **14 passing Node tests**, per-question results for 30 cases, citation and refusal labels, PII leak count 0, and “fixed synthetic set, not production accuracy.”

**旁白 / Narration:**

- 中文：十四项测试覆盖检索、引用、拒答、脱敏和日志，三十题提供逐题原始结果。这些只说明固定合成集上的可重复行为，不代表真实生产表现。
  English: Fourteen tests cover retrieval, citations, refusal, masking, and logs, while thirty questions provide raw per-case results. These describe reproducible behavior on a fixed synthetic set, not real production performance.

### 2:40–3:00 边界与下一步 / Boundary and next step

**画面 / Visual:** 显示限制与下一步。

- 词法检索，不是语义理解 / Lexical retrieval, not semantic understanding.
- 模拟转人工；无生产认证、RBAC、速率限制或 SLA / Mock handoff; no production authentication, RBAC, rate limiting, or SLA.
- 下一步：补充真实授权、文档权限、注入防护与人工审核 / Next: add real authorization, document permissions, injection defenses, and human review.

**旁白 / Narration:**

- 中文：这个原型不是生产客服。上线前还要确认数据授权、文档权限、滥用防护、人工席位和持续评测，不能用合成集结果代替这些工作。
  English: This prototype is not production support. Before launch, confirm data authorization, document permissions, abuse controls, human ownership, and ongoing evaluation; synthetic-set results do not replace that work.

## 发布前证据清单 / Pre-publication evidence checklist

- [ ] 演示版本、运行日期和环境类别已记录。 / Demo version, run date, and environment type are recorded.
- [ ] 对应 README、测试结果和已知限制可访问。 / Corresponding README, test results, and known limitations are accessible.
- [ ] 正常、异常与边界结果均来自现场运行或已保存记录。 / Normal, abnormal, and boundary results come from live runs or saved records.
- [ ] 录屏无凭据、客户标识、私有路径或真实个人信息。 / Recording contains no credentials, customer identifiers, private paths, or real personal information.
- [ ] 对白与字幕明确“合成演示、非生产”。 / Narration and subtitles state “synthetic demo, not production.”
- [ ] 若代码或测试变化导致结果不可复现，撤回 Verified 标记。 / Withdraw the Verified label if code or test changes make results non-reproducible.

## 相关文档 / Related documents

- [能力矩阵 / Capability matrix](capability-matrix.md)
- [交付 SOP / Delivery SOP](delivery-sop.md)
- [安全与数据规范 / Security and data policy](security-and-data.md)
- [部署文档 / Deployment guide](deployment.md)
