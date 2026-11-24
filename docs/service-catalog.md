# XWH AI 服务目录
# XWH AI Service Catalog

版本 / Version: 1.0

## 公开事实 / Public facts

- 当前由个人接单，**无法开具发票；客户必须开票时不接单**。
  Work is currently performed by an individual who **cannot issue invoices; work requiring an invoice is declined**.
- 下列金额为人民币参考区间，不是报价、效果承诺或固定总价。
  The amounts below are reference ranges in CNY, not quotes, outcome commitments, or fixed totals.
- 第三方订阅、云资源、域名、模型许可、短信和税费等不自动包含在服务费中；是否可承接须单独确认。
  Third-party subscriptions, cloud resources, domains, model licenses, SMS, and applicable charges are not automatically included; feasibility is confirmed separately.

## 服务承诺的生效条件 / When service commitments take effect

只有书面报价或协议明确写入以下内容后，交付承诺才生效：
Delivery commitments take effect only when the written quote or agreement specifies:

1. 目标流程、输入、输出和不含项。
   Target workflow, inputs, outputs, and exclusions.
2. 使用系统、测试环境、数据类别和权限。
   Systems, test environment, data categories, and permissions.
3. 验收场景、通过标准、复核人和截止条件。
   Acceptance scenarios, pass criteria, reviewers, and stop conditions.
4. 价格、排期估算、变更规则、支持期和回滚方式。
   Price, schedule estimate, change rules, support period, and rollback method.
5. 数据归属、删除、第三方服务和事故联系人。
   Data ownership, deletion, third-party services, and incident contacts.

## 档位一：体检 / 打通设计 — Audit / Integration Design

| 项目 / Item | 内容 / Details |
|---|---|
| 参考价格 / Reference price | **¥3,000–¥8,000 / 次** |
| 适用 / Suitable for | 流程不清、重复录入、多个系统需要取舍，但尚不适合直接开发。 / Unclear workflows, repetitive entry, or trade-offs among systems where development is premature. |
| 时间估算 / Estimated duration | **3–5 个工作日**，取决于资料完整度与客户反馈；不是交期保证。 / **3–5 business days**, depending on information completeness and customer feedback; not a guaranteed deadline. |
| 范围 / Included scope | 1 次启动会；1 条核心流程；现有系统与人工步骤清单；输入输出及权限梳理；风险与停止条件；优先级路线图；架构草图；实施预算区间。 / One kickoff; one core workflow; system and manual-step inventory; input, output, and permission mapping; risks and stop conditions; prioritized roadmap; architecture sketch; implementation budget range. |
| 交付物 / Deliverables | 诊断报告、流程图、范围建议、验收草案、风险清单和报价假设。 / Diagnostic report, flowchart, scope recommendation, acceptance draft, risk list, and quote assumptions. |
| 验收 / Acceptance | 双方评审会完成；客户确认流程与假设无遗漏，或一次性书面列出需修正项。 / Joint review completed; customer confirms the workflow and assumptions are complete or provides one consolidated written correction list. |
| 不含 / Excluded | 生产系统改造、代码开发、数据迁移执行、长期运维、法律或合规结论、真实客户数据验证。 / Production changes, code development, data migration execution, ongoing operations, legal or compliance conclusions, or real-customer-data validation. |

## 档位二：集成 MVP — Integration MVP

| 项目 / Item | 内容 / Details |
|---|---|
| 参考价格 / Reference price | **¥15,000–¥60,000 / 项目** |
| 适用 / Suitable for | 已完成范围确认、可在测试环境验证的一条端到端业务流程。 / One end-to-end business workflow with confirmed scope that can be validated in a test environment. |
| 时间估算 / Estimated duration | **2–6 周**，受接口、权限、反馈与测试时间影响；不是交期保证。 / **2–6 weeks**, affected by interfaces, permissions, feedback, and test availability; not a guaranteed deadline. |
| 基准范围 / Baseline scope | 1 条主流程；1–2 个已授权数据源或目标；约定字段映射；失败重试与异常清单；基础日志；1 个简单界面或报表；合成数据测试；运行手册与交接。 / One primary workflow; one or two authorized sources or targets; agreed field mapping; retry and exception list; basic logs; one simple interface or report; synthetic-data tests; runbook and handover. |
| 可选增项 / Optional add-ons | 额外系统、复杂审批、身份认证、历史数据清理、模型评测、部署到客户指定环境。均须另行报价。 / Additional systems, complex approvals, authentication, historical-data cleanup, model evaluation, or deployment to a customer environment. Each requires a separate quote. |
| 验收 / Acceptance | 在约定环境通过书面正常、异常、权限、重试和回滚场景；交付测试记录、运行手册和遗留问题清单。 / Written normal, abnormal, permission, retry, and rollback scenarios pass in the agreed environment; test records, runbook, and known-issue list are delivered. |
| 不含 / Excluded | 多租户平台、大规模历史迁移、全天候监控、高并发优化、监管审批、第三方费用、范围外系统与功能。 / Multi-tenant platforms, large-scale historical migration, 24/7 monitoring, high-concurrency optimization, regulatory approval, third-party fees, or out-of-scope systems and features. |
| 支持期 / Correction window | 验收后 **14 个自然日**内，对不符合书面验收项的已交付范围提供修正；新增需求、环境变化和第三方故障不属于该修正范围。 / For **14 calendar days** after acceptance, defects against written acceptance criteria in delivered scope are corrected; new requirements, environment changes, and third-party failures are outside this correction window. |

## 档位三：月度维护 — Monthly Maintenance

| 项目 / Item | 内容 / Details |
|---|---|
| 参考价格 / Reference price | **¥1,500–¥6,000 / 月** |
| 适用 / Suitable for | 已交接、运行稳定且需求边界清楚的小型自动化项目。 / Small automation projects that are handed over, stable, and clearly bounded. |
| 月度范围 / Monthly scope | 每月 **4–16 小时**约定维护；运行记录检查；依赖与许可提醒；备份或回滚抽检；每月 1 次小调整或知识更新；月度报告。 / **4–16 hours** of agreed maintenance per month; run-record review; dependency and license reminders; backup or rollback spot check; one small adjustment or knowledge update; monthly report. |
| 响应目标 / Response target | 工作日约定时段内 **1 个工作日内确认收到**，并给出分级与下一步；该目标不是修复时限或全天候 SLA。 / Acknowledgment within **one business day** during agreed weekday hours, with triage and next steps; not a repair deadline or 24/7 SLA. |
| 验收 / Acceptance | 每月收到维护记录、检查结果、已用工时、遗留风险与下月建议；约小时额用完前提示。 / Monthly maintenance record, check results, hours used, outstanding risks, and next-month recommendations; notification before the agreed hours are exhausted. |
| 不含 / Excluded | 新项目、大规模重构、紧急待命、基础设施费用、第三方服务故障修复、无限知识库更新、超出小时额的开发。 / New projects, large-scale refactoring, emergency standby, infrastructure fees, third-party outage repair, unlimited knowledge-base updates, or development beyond the hour allowance. |

## 价格与变更规则 / Pricing and change rules

- 报价区间用于初步判断；最终价格取决于确认后的范围、集成数量和风险。
  Ranges support initial planning; the final price depends on confirmed scope, integration count, and risk.
- 客户需求变化先记录影响，再以书面变更单确认费用与排期；未确认前不扩大实施。
  Changes are recorded with their impact and confirmed through a written change order before implementation expands.
- 未约定的第三方费用由客户直接承担并授权开通；不得使用个人支付方式隐匿项目成本。
  Unagreed third-party costs are borne and authorized directly by the customer; personal payment methods must not conceal project costs.
- 如果项目要求开票，应在诊断与报价前停止；不得先接单再要求客户承担无法开票的问题。
  If invoicing is required, stop before diagnosis and quoting; do not accept work first and raise the invoicing limitation later.

## 事实与承诺 / Facts and commitments

**事实 / Facts:** 上表是公开参考价和服务边界，未包含任何真实客户信息或案例结果。
**Facts:** The table contains public reference prices and service boundaries without real-customer information or case results.

**承诺 / Commitments:** 验收、修正期、响应目标等只有写入具体报价或协议后才构成项目承诺。
**Commitments:** Acceptance, correction windows, and response targets become project commitments only when written into the specific quote or agreement.

## 相关文档 / Related documents

- [能力矩阵 / Capability matrix](capability-matrix.md)
- [销售流程 / Sales process](sales-process.md)
- [交付 SOP / Delivery SOP](delivery-sop.md)
- [安全与数据规范 / Security and data policy](security-and-data.md)
