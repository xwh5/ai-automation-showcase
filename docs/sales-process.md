# XWH AI 销售流程
# XWH AI Sales Process

版本 / Version: 1.0

## 流程总览 / Process overview

**线索 → 筛选 → 诊断 → 报价 → 成交 → 交付 → 复购**
**Lead → Qualification → Diagnosis → Quote → Close → Delivery → Renewal**

每个阶段只产生下一步所需的最小信息。不得为了促成交易而隐藏开票限制、数据风险或能力边界。
Each stage collects only the minimum information needed for the next step. Invoicing limitations, data risks, and capability boundaries must not be hidden to close a deal.

## 阶段、产物与停止条件 / Stages, outputs, and stop conditions

| 阶段 / Stage | 要做的事 / Actions | 进入下一步的条件 / Gate to proceed | 产物 / Output | 停止或转介条件 / Stop or refer when |
|---|---|---|---|---|
| **1. 线索 / Lead** | 收集目标、业务联系人、预算区间、期望时间、是否需要发票；只接收流程描述或合成样本。 / Collect goal, business contact, budget range, desired timing, and invoicing need; accept only process descriptions or synthetic samples. | 客户同意不发送凭据、私人路径或未授权数据。 / Customer agrees not to send credentials, private paths, or unauthorized data. | 线索记录。 / Lead record. | 要求开票；索要密码或原始客户数据；提出违法、欺骗或绕过权限的用途。 / Invoicing is required; passwords or raw customer data are requested; use is unlawful, deceptive, or designed to bypass permissions. |
| **2. 筛选 / Qualification** | 判断是否有明确流程、业务负责人、系统授权、测试窗口和人工兜底；核对是否属于标准能力。 / Check for a defined workflow, business owner, system authorization, test window, and human fallback; verify fit with standard capabilities. | 目标可写成可验收的流程，客户接受范围诊断。 / Goal can be written as an acceptance-testable workflow and customer accepts scoping. | 筛选结论与风险初判。 / Qualification result and initial risk assessment. | 要求保证收益或完全无误；拒绝人工复核；高风险自主决策；人脸识别未完成合法性、同意与必要性审查。 / Guaranteed returns or error-free results are demanded; human review is refused; high-risk autonomous decisions are involved; facial recognition lacks legality, consent, and necessity review. |
| **3. 诊断 / Diagnosis** | 按体检服务梳理输入、输出、系统、权限、异常、数据类别与停止线；优先使用合成数据。 / Under the audit service, map inputs, outputs, systems, permissions, exceptions, data categories, and stop lines; prefer synthetic data. | 客户确认范围、数据责任人与验收草案，技术路径无未解决的关键阻断。 / Customer confirms scope, data owner, and acceptance draft; no unresolved critical technical blocker remains. | 诊断报告、路线图、风险清单。 / Diagnostic report, roadmap, and risk list. | 无合法授权；接口或系统禁止自动化；客户坚持绕过验证码、风控或许可；范围无法收敛。 / No lawful authorization; system terms prohibit automation; customer insists on bypassing CAPTCHA, risk controls, or licenses; scope cannot be bounded. |
| **4. 报价 / Quote** | 写明服务档位、价格区间或固定价、交付物、验收、不含项、变更、第三方费用、数据与回滚。 / State tier, range or fixed price, deliverables, acceptance, exclusions, changes, third-party costs, data terms, and rollback. | 客户确认不需要发票，并接受书面范围与商业条款。 / Customer confirms invoicing is not required and accepts written scope and commercial terms. | 书面报价或协议草案。 / Written quote or draft agreement. | 临时改为必须开票；要求写入确定收益、人员削减或无限支持；拒绝数据删除或不公开条款。 / Invoicing becomes mandatory; guaranteed outcomes, staffing reductions, or unlimited support are demanded; deletion or non-publication terms are refused. |
| **5. 成交 / Close** | 确认签署、付款条件、启动资料、联系人与 kickoff 时间；无签字或书面确认不启动。 / Confirm signature, payment terms, startup materials, contacts, and kickoff; do not start without signature or written confirmation. | 书面协议、首付款条件、权限申请与测试环境计划齐备。 / Written agreement, initial payment conditions, permission request, and test-environment plan are ready. | 成交记录与启动清单。 / Close record and startup checklist. | 协议范围与报价不一致；客户要求把凭据写进合同或聊天；授权人无法确认。 / Agreement scope differs from quote; credentials are requested in contracts or chat; authorized owner cannot be confirmed. |
| **6. 交付 / Delivery** | 按 SOP 执行需求确认、权限、开发、测试、验收、交接、售后与复盘；所有变更留痕。 / Follow the SOP for requirements, permissions, development, testing, acceptance, handover, aftercare, and retrospective; log all changes. | 验收通过，运行手册和回滚方式交接，遗留项有负责人。 / Acceptance passes, runbook and rollback are handed over, and outstanding items have owners. | 交付物、测试记录、验收记录。 / Deliverables, test records, and acceptance record. | 数据或密钥事故；授权撤销；停止线触发；客户要求跳过测试或验收直接上线。 / Data or key incident; authorization withdrawn; stop line triggered; customer asks to skip testing or acceptance and launch directly. |
| **7. 复购 / Renewal** | 复盘运行记录、人工节省基线、异常与下一项可自动化流程；提供维护或下一阶段方案。 / Review run records, manual-work baseline, exceptions, and the next automation candidate; offer maintenance or a next-stage plan. | 新需求有明确范围、预算和优先级；维护未变成无限开发。 / New need has clear scope, budget, and priority; maintenance has not become unlimited development. | 维护提案或新项目报价。 / Maintenance proposal or new-project quote. | 持续要求范围外免费开发；把事故责任转嫁为无边界承诺；要求使用客户数据训练或公开宣传。 / Repeated demands for out-of-scope free development; incident responsibility is converted into an unbounded promise; customer-data training or publicity is requested. |

## 全流程硬停止 / Process-wide hard stops

出现以下任一情况，立即暂停相关活动，保留最小必要记录并通知客户业务联系人：
If any of the following occurs, pause the relevant activity immediately, retain minimum necessary records, and notify the customer's business contact:

- **必须开具发票 / Invoicing is mandatory.**
- 请求违法、欺骗、监控、未授权身份识别或访问控制绕过。
  The request is unlawful, deceptive, surveillance-related, unauthorized identity recognition, or an access-control bypass.
- 无法确认数据控制者授权或合法使用目的。
  Data-controller authorization or a lawful purpose cannot be confirmed.
- 客户要求把凭据、真实客户数据或私有系统信息发送到公开渠道。
  The customer asks to send credentials, real customer data, or private system details through public channels.
- 发生或疑似发生数据泄露、密钥暴露、越权访问。
  A data leak, key exposure, or unauthorized access occurs or is suspected.
- 验收所需权限被撤销，或第三方服务明确禁止该用途。
  Permissions required for acceptance are withdrawn, or a third-party service explicitly prohibits the use.

停止不等于隐瞒问题；应说明事实、已采取的控制措施和恢复条件，不承诺不可控的处理结果。
Stopping does not mean concealing the issue; explain known facts, controls taken, and conditions for resumption without promising uncontrollable outcomes.

## 线索记录模板 / Lead record template

只记录项目所需信息，不复制客户数据：
Record only project-necessary information; do not copy customer data:

| 字段 / Field | 占位 / Placeholder |
|---|---|
| 目标流程 / Target workflow | `[一句话 / One sentence]` |
| 业务负责人 / Business owner | `[姓名或角色 / Name or role]` |
| 系统类别 / System types | `[类别，不含凭据 / Types only, no credentials]` |
| 数据类别 / Data categories | `[合成、公开、内部、个人信息等 / Synthetic, public, internal, personal, etc.]` |
| 验收想法 / Acceptance idea | `[可观察结果 / Observable result]` |
| 预算与时间 / Budget and timing | `[区间 / Range]` |
| 发票要求 / Invoicing requirement | `[否；若“是”则停止 / No; stop if “Yes”]` |
| 风险与停止项 / Risks and stop items | `[列表 / List]` |
| 下一步 / Next step | `[筛选、诊断或停止 / Qualify, diagnose, or stop]` |

## 事实与承诺 / Facts and commitments

**事实 / Facts:** 本流程规定信息收集和停止规则，不表示已有客户、成交或案例。
**Facts:** This process defines information collection and stop rules; it does not imply customers, closed deals, or case studies.

**承诺 / Commitments:** 报价、周期、验收、支持和价格只在具体书面协议中生效；销售沟通不得提前扩大承诺。
**Commitments:** Quotes, schedules, acceptance, support, and prices apply only when stated in a specific written agreement; sales discussions must not expand them in advance.

## 相关文档 / Related documents

- [服务目录 / Service catalog](service-catalog.md)
- [交付 SOP / Delivery SOP](delivery-sop.md)
- [安全与数据规范 / Security and data policy](security-and-data.md)
- [常见问题 / FAQ](faq.md)
