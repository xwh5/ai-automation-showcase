# XWH AI 能力矩阵
# XWH AI Capability Matrix

版本 / Version: 1.0

## 如何阅读 / How to read this matrix

本页区分“可复现的合成演示”与“可交付到客户生产环境的能力”。Verified demo 只表示对应演示有固定样本、运行说明和测试证据，**不表示生产就绪、客户系统适配、业务效果或全天候支持**。
This matrix distinguishes reproducible synthetic demos from capabilities deliverable to a customer production environment. Verified demo means only that the demo has fixed samples, run instructions, and test evidence; **it does not mean production readiness, customer-system fit, business outcomes, or 24/7 support**.

当前有三项 Verified demo：系统打通的合成 CSV 对账子集、数据自动化的价格证据子集、AI 客服的离线知识库子集。每项均保留明确限制。
Three capabilities currently have Verified demos: a synthetic CSV reconciliation subset of systems integration, a price-evidence subset of data automation, and an offline knowledge-base subset of AI customer support. Each retains explicit limitations.

## 三档状态 / Three status levels

| 状态 / Status | 含义 / Meaning | 对外可说什么 / What may be stated publicly | 不能据此承诺 / Not implied |
|---|---|---|---|
| **Verified demo** | 有可复现的合成数据演示、固定样本和测试证据；当前有三项。 / Reproducible synthetic-data demo, fixed samples, and test evidence; three current entries. | 演示版本、输入、步骤、测试结果与已知限制。 / Demo version, inputs, steps, results, and known limits. | 生产就绪、客户环境适配、业务效果、生产准确率或全天候支持。 / Production readiness, customer-environment fit, business outcomes, production accuracy, or 24/7 support. |
| **Scope before delivery** | 有通用实施路径，但客户系统、权限、数据与验收尚未确认。 / A generic implementation path exists, but customer systems, permissions, data, and acceptance are unconfirmed. | 可安排范围诊断，并在诊断后给出可行性判断。 / A scoping review is available, followed by a feasibility assessment. | 已适配某客户、已取得接口许可、可立即上线。 / Customer-specific adaptation, API permission, or immediate launch. |
| **Experimental** | 探索性验证，不作为标准交付或 SLA 承诺。 / Exploratory validation, not a standard deliverable or SLA commitment. | 可讨论验证目标、数据要求、停止条件和预算上限。 / Validation goals, data needs, stop conditions, and budget caps can be discussed. | 稳定运行、合规结论、身份判断或规模化部署。 / Stable operation, a legal conclusion, identity decisions, or production scale. |

## 能力清单 / Capability inventory

| 能力 / Capability | 已验证或可讨论的范围 / Demonstrated or discussable scope | 当前公开状态 / Current public status | 证据与交付条件 / Evidence and delivery conditions | 明确边界 / Explicit boundary |
|---|---|---|---|---|
| **系统打通 / Systems integration** | API、Webhook、CSV 或数据库之间的约定同步；字段映射、重试、对账。当前 Verified 仅覆盖合成 CSV 对账子集。 / Agreed API, webhook, CSV, or database synchronization with mapping, retries, and reconciliation. Verified status covers only the synthetic CSV reconciliation subset. | **Verified demo** — [Legacy Bridge README](../demos/legacy-bridge/README.md)、[35/35 测试记录](../demos/legacy-bridge/TEST_RESULTS.md) / **Verified demo** — [Legacy Bridge README](../demos/legacy-bridge/README.md), [35/35 test record](../demos/legacy-bridge/TEST_RESULTS.md) | 合成订单与回款样本、异常队列、幂等和审计已有测试证据。真实交付仍须客户提供接口文档、测试环境、授权和字段负责人。 / Synthetic order/payment samples, exception queues, idempotency, and audit have test evidence. Real delivery still requires API documentation, a test environment, authorization, and a field owner from the customer. | 演示不连接 ERP、银行或生产数据库，不记账、不付款；无认证、租户隔离、静态加密或生产备份。真实 API 集成仍需单独评估。 / The demo connects to no ERP, bank, or production database and posts no entries or payments; it lacks authentication, tenant isolation, encryption at rest, and production backup. Real API integration still requires separate assessment. |
| **数据自动化 / Data automation** | 数据清洗、去重、校验、汇总和异常清单。当前 Verified 仅覆盖合成价格证据、匹配与冲突处理子集。 / Data cleaning, deduplication, validation, aggregation, and exception lists. Verified status covers only the synthetic price-evidence, matching, and conflict subset. | **Verified demo** — [Price Evidence Desk README](../demos/price-console/README.md)、[22/22 测试与 4/4 浏览器场景](../demos/price-console/verification/report.md) / **Verified demo** — [Price Evidence Desk README](../demos/price-console/README.md), [22/22 tests and 4/4 browser scenarios](../demos/price-console/verification/report.md) | 30 个合成 SKU、90 条报价观测、20 个盲测探针及原始错误均有记录。真实交付须确认数据定义、质量阈值、失败行处理与复核人。 / Thirty synthetic SKUs, ninety observations, twenty blind probes, and raw errors are recorded. Real delivery requires agreed data definitions, quality thresholds, failed-row handling, and reviewers. | 这是确定性目录辅助演示，不是生产实体识别；小样本指标不代表统计泛化。不抓取真实平台、不触发购买，关键数据仍须业务复核。 / This is a deterministic catalog-assisted demo, not production entity resolution; small-sample metrics do not imply statistical generalization. It scrapes no real platform, triggers no purchase, and still requires business review of critical data. |
| **AI 客服 / AI customer support** | 基于批准知识库的问答草稿、引用、拒答和人工转接建议。当前 Verified 仅覆盖离线 BM25 + 固定 FAQ 模板子集。 / Approved-knowledge-base drafts, citations, refusal, and suggested human escalation. Verified status covers only the offline BM25 plus fixed-FAQ-template subset. | **Verified demo** — [AI Support README](../demos/ai-support/README.md)、[14 项测试与 30 题逐题结果](../demos/ai-support/results/eval-results.md) / **Verified demo** — [AI Support README](../demos/ai-support/README.md), [14 tests and 30 per-question results](../demos/ai-support/results/eval-results.md) | 54 条双语合成 FAQ、引用、范围外拒答、有限 PII 脱敏和模拟转人工已有证据。真实交付须确认批准内容、测试集、人工席位、日志和知识更新责任。 / Fifty-four bilingual synthetic FAQs, citations, out-of-scope refusal, limited PII masking, and mock handoff have evidence. Real delivery requires approved content, test sets, human ownership, logging, and knowledge-update duties. | 不是生产客服，不调用真实模型或外部服务；词法检索不等于语义理解，转人工是 mock，且无生产认证、RBAC、速率限制或 SLA。高风险请求不自动终局处理。 / Not production support; no real model or external service is called. Lexical retrieval is not semantic understanding, handoff is mocked, and production authentication, RBAC, rate limiting, and SLAs are absent. High-risk requests receive no autonomous final handling. |
| **小模型部署 / Small-model deployment** | 在约定硬件上评估本地推理、离线分类或文本处理原型。 / Evaluate local inference, offline classification, or text-processing prototypes on agreed hardware. | **Experimental** | 先确认模型与数据许可、硬件预算、延迟目标、评测集和停止线；通过后再议部署。 / Confirm model and data licenses, hardware budget, latency targets, evaluation set, and stop line before discussing deployment. | 不默认使用闭源权重，不把实验指标当作生产承诺。 / No default use of proprietary weights; experimental metrics are not production commitments. |
| **RPA / Robotic process automation** | 对已授权桌面或网页流程进行点击、录入、导出与核对。 / Clicking, entry, export, and checking on authorized desktop or web workflows. | **Scope before delivery** | 客户确认账号、操作窗口、界面稳定性、失败回退和人工接管；优先评估 API 替代方案。 / Customer confirms accounts, operating windows, UI stability, failure rollback, and human takeover; API alternatives are assessed first. | 不绕过验证码、风控或许可限制；界面变化可能导致任务停止并转人工。 / No CAPTCHA, risk-control, or license bypass; UI changes may stop the task and trigger human handling. |
| **内部工具 / Internal tools** | 单团队仪表盘、审批列表、任务看板或运营后台。 / Single-team dashboards, approval lists, task boards, or operations consoles. | **Scope before delivery** | 限定用户角色、部署位置、权限模型、审计字段和备份方式；先做可点击原型。 / Limit user roles, deployment location, permissions, audit fields, and backups; start with a clickable prototype. | 不默认构建多租户平台、复杂组织架构或高并发系统。 / No default multi-tenant platform, complex organization model, or high-concurrency system. |
| **人脸识别 / Facial recognition** | 仅讨论非身份决策的研究边界；通常不接。 / Discuss research boundaries without identity decisions; usually declined. | **Experimental** | 涉及任何人脸数据前，须单独确认合法性、授权、必要性、保存期限和更安全替代方案；未通过即停止。 / Before any facial data, separately confirm legality, authorization, necessity, retention, and safer alternatives; stop if not approved. | 不提供监控、追踪、身份终局判断或未经同意的数据采集；不列入标准套餐。 / No surveillance, tracking, final identity decisions, or collection without consent; not part of standard packages. |

## 当前演示证据 / Current demo evidence

| 演示 / Demo | 对应能力 / Capability | 已记录证据 / Recorded evidence | 证据不包含 / Evidence does not establish |
|---|---|---|---|
| [Legacy Bridge](../demos/legacy-bridge/README.md) | 系统打通子集 / Systems integration subset | [35/35 自动化测试、HTTP 冒烟、浏览器验收、已知缺口](../demos/legacy-bridge/TEST_RESULTS.md) / [35/35 automated tests, HTTP smoke test, browser acceptance, and known gaps](../demos/legacy-bridge/TEST_RESULTS.md) | 真实 ERP/银行连接、生产写入、认证、租户隔离或生产审计。 / Real ERP/bank connectivity, production writes, authentication, tenant isolation, or production audit. |
| [Price Evidence Desk](../demos/price-console/README.md) | 数据自动化子集 / Data automation subset | [22/22 Node 测试、4/4 浏览器场景、原始盲测错误](../demos/price-console/verification/report.md) / [22/22 Node tests, 4/4 browser scenarios, and raw blind-test errors](../demos/price-console/verification/report.md) | 生产实体识别、统计泛化、真实价格抓取或采购结论。 / Production entity resolution, statistical generalization, real price scraping, or purchasing decisions. |
| [AI Support](../demos/ai-support/README.md) | AI 客服子集 / AI customer support subset | [14 项 Node 测试、30 题固定合成集逐题结果、浏览器验证](../demos/ai-support/results/eval-results.md) / [14 Node tests, per-question results for a fixed 30-case synthetic set, and browser validation](../demos/ai-support/results/eval-results.md) | 生产准确率、真实 LLM 能力、真实工单、完整 PII 防护或生产合规。 / Production accuracy, real-LLM capability, real tickets, complete PII protection, or production compliance. |

上述数字仅描述对应固定合成测试集，不应跨演示、跨数据集或跨生产环境外推。
The numbers above describe only their corresponding fixed synthetic test sets and must not be extrapolated across demos, datasets, or production environments.

## 事实与承诺分离 / Facts separated from commitments

### 当前事实 / Current facts

- 三项 Verified demo 均使用合成数据，并有可链接的 README 与测试记录。
  All three Verified demos use synthetic data and have linked READMEs and test records.
- Legacy Bridge 的 35 项测试与生产写入零的记录只适用于其离线对账演示。
  Legacy Bridge's 35 tests and zero-production-write record apply only to its offline reconciliation demo.
- Price Evidence Desk 的测试证明固定样本上的功能行为，不证明价格匹配可泛化到所有商品。
  Price Evidence Desk's tests establish behavior on fixed samples, not price-matching generalization to all products.
- AI Support 的 30 题结果不构成生产准确率或事实正确性承诺。
  AI Support's 30-question results are not a production-accuracy or factual-correctness commitment.
- Experimental 项目不因讨论、原型或代码片段自动转为可交付能力。
  An Experimental capability does not automatically become deliverable through discussion, a prototype, or a code fragment.

### 仅在书面确认后生效的承诺 / Commitments effective only after written confirmation

- 每项真实交付会列出适配系统、测试数据、验收场景、已知限制和停止条件。
  Each real delivery lists adapted systems, test data, acceptance scenarios, known limits, and stop conditions.
- 未经客户书面批准，不扩大数据用途或增加第三方服务。
  Data use and third-party services are not expanded without the customer's written approval.
- 演示、截图和案例材料仅使用合成或获明确授权的内容。
  Demos, screenshots, and case materials use only synthetic or explicitly authorized content.
- 真实系统集成、生产部署与持续运维另行诊断和报价，不自动包含在 Verified demo 中。
  Real-system integration, production deployment, and ongoing operations require separate diagnosis and quoting and are not automatically included in a Verified demo.

## 保持 Verified 标记的条件 / Conditions for retaining the Verified label

- 演示可在固定合成样本上按 README 复现。 / The demo can be reproduced on fixed synthetic samples using its README.
- 测试记录与当前代码状态一致；失败用例和已知缺口不被删除。 / Test records match current code; failed cases and known gaps are not removed.
- 公开材料持续检查客户标识、真实数据、凭据和私有路径。 / Public materials are continuously checked for customer identifiers, real data, credentials, and private paths.
- 代码、模型、依赖或数据发生重大变化后重新测试；无法复现时撤回标记。 / Retest after major code, model, dependency, or data changes; withdraw the label if reproduction fails.
- Verified 标记不扩展为资质、认证、客户案例或生产 SLA。 / The Verified label does not expand into certification, credentials, customer cases, or production SLAs.

## 相关文档 / Related documents

- [服务目录 / Service catalog](service-catalog.md)
- [交付 SOP / Delivery SOP](delivery-sop.md)
- [安全与数据规范 / Security and data policy](security-and-data.md)
- [三分钟演示脚本 / Three-minute demo scripts](demo-scripts.md)
