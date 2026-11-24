# XWH AI 交付标准作业流程
# XWH AI Delivery SOP

版本 / Version: 1.0

## 适用范围 / Scope

适用于体检/打通设计、集成 MVP 与月度维护项目。月度维护沿用需求确认、数据权限、测试、验收与复盘原则，但不必重复完整开发流程。
This SOP applies to audit/integration design, integration MVP, and monthly maintenance. Maintenance reuses the requirements, data-permission, testing, acceptance, and retrospective controls without repeating the full development cycle.

**硬前置条件 / Hard prerequisites:** 客户不需要发票；已确认业务授权；已接受书面范围与数据规则。任一不满足则不启动。
**Hard prerequisites:** The customer does not require an invoice; business authorization is confirmed; written scope and data rules are accepted. Do not start if any condition fails.

## 角色与责任 / Roles and responsibilities

| 角色 / Role | 责任 / Responsibilities |
|---|---|
| 客户业务负责人 / Customer business owner | 确认目标、优先级、验收人、数据授权与上线决定。 / Confirms goals, priorities, acceptance reviewer, data authorization, and launch decision. |
| 客户技术或系统管理员 / Customer technical or system administrator | 提供测试环境、最小权限、账户与安全协作渠道；处理客户侧变更。 / Provides test environment, least privilege, accounts, and a secure coordination channel; manages customer-side changes. |
| XWH AI 交付负责人 / XWH AI delivery owner | 范围、设计、实现、测试、记录、交接与风险通报；一人公司中承担全部交付角色。 / Owns scope, design, implementation, testing, records, handover, and risk communication; all delivery roles sit with the solo operator. |
| 双方事故联系人 / Incident contacts on both sides | 接收事件通报、决定停机和恢复，协调依法或依约通知。 / Receives incident notices, decides shutdown and recovery, and coordinates required notifications. |

## 八阶段闸门 / Eight stage gates

| 阶段 / Stage | 必须动作 / Required actions | 证据 / Evidence | 通过条件 / Gate |
|---|---|---|---|
| **1. 需求确认 / Requirements** | 确认目标、非目标、输入输出、异常、验收、人工接管和停止线。 / Confirm goals, non-goals, inputs, outputs, exceptions, acceptance, human takeover, and stop lines. | 范围说明书、流程图、验收草案。 / Scope statement, flowchart, acceptance draft. | 客户书面确认；无互相矛盾的成功标准。 / Customer confirms in writing; success criteria are consistent. |
| **2. 数据权限 / Data permissions** | 确认数据归属、合法授权、字段、用途、期限、存储、第三方和删除。 / Confirm ownership, lawful authorization, fields, purposes, retention, storage, third parties, and deletion. | 数据清单、权限矩阵、第三方清单、删除计划。 / Data inventory, permission matrix, third-party list, deletion plan. | 最小必要权限获批；敏感字段有排除或保护措施。 / Least-privilege access is approved; sensitive fields are excluded or protected. |
| **3. 开发 / Development** | 按已确认范围实现；版本控制；配置与密钥分离；记录变更与依赖。 / Implement confirmed scope; use version control; separate configuration from secrets; log changes and dependencies. | 版本记录、变更记录、依赖清单、自测结果。 / Version record, change log, dependency list, and self-test results. | 约定功能完成；未引入范围外数据流。 / Agreed features are complete; no out-of-scope data flow is introduced. |
| **4. 测试 / Testing** | 用合成数据执行正常、异常、边界、权限、重试、回滚和安全检查。 / Use synthetic data for normal, abnormal, boundary, permission, retry, rollback, and security tests. | 测试用例与结果、缺陷清单、复测记录。 / Test cases and results, defect list, and retest record. | 无未接受的阻断缺陷；异常不会静默扩大影响。 / No unaccepted blocking defects; failures do not silently expand impact. |
| **5. 验收 / Acceptance** | 在约定环境按验收脚本演示；客户逐项签署通过、附带条件或不通过。 / Demonstrate agreed acceptance scripts in the agreed environment; customer signs pass, conditional pass, or fail per item. | 验收记录、遗留问题与责任人。 / Acceptance record, outstanding issues, and owners. | 关键场景通过；附带条件不影响安全或核心流程。 / Critical scenarios pass; conditional items do not affect safety or the core workflow. |
| **6. 交接 / Handover** | 交付代码/配置说明、运行手册、权限、恢复、监控入口和联系人。 / Hand over code/configuration notes, runbook, permissions, recovery, monitoring entry points, and contacts. | 交接清单、培训记录、访问验证。 / Handover checklist, training record, and access verification. | 客户能执行启动、停止、排障和回滚；密钥由客户控制。 / Customer can start, stop, troubleshoot, and roll back; customer controls keys. |
| **7. 售后 / After-sales** | 在约定修正期或维护窗口处理问题；先分级，再修复、变更或转介。 / Handle issues within the agreed correction or maintenance window; triage before fixing, changing scope, or referring. | 工单、处理记录、工时、复测结果。 / Ticket, handling record, hours, and retest result. | 问题闭环或明确转交；未把维护变成无限开发。 / Issue is closed or explicitly referred; maintenance does not become unlimited development. |
| **8. 复盘 / Retrospective** | 比较基线与运行记录，记录人工介入、异常、收益假设和下一改进。 / Compare baseline with run records; document human intervention, exceptions, benefit assumptions, and next improvements. | 复盘报告、经验与下一步建议。 / Retrospective report, lessons, and next-step recommendations. | 事实与推测分开；客户数据不进入公开复盘。 / Facts are separated from assumptions; customer data is excluded from public retrospectives. |

## 1. 需求确认清单 / Requirements checklist

- [ ] 用一句话写清要改善的流程，而不是“全面智能化”。
  [ ] Describe the workflow to improve in one sentence, not “full intelligent transformation.”
- [ ] 列出触发条件、输入、处理步骤、输出、失败行为和人工复核点。
  [ ] List triggers, inputs, processing steps, outputs, failure behavior, and human review points.
- [ ] 明确谁使用、谁验收、谁批准上线。
  [ ] Identify users, acceptance reviewer, and launch approver.
- [ ] 把“减少多少人工时间”改为可观察基线，例如每周处理批次、手工步骤和异常数。
  [ ] Convert time-saving claims into observable baselines such as weekly batches, manual steps, and exceptions.
- [ ] 定义不含项与停止条件。
  [ ] Define exclusions and stop conditions.
- [ ] 再次确认客户不需要发票；若需要则停止。
  [ ] Reconfirm that invoicing is not required; stop if it is.

## 2. 数据与权限检查 / Data and permission checks

1. **数据清单 / Data inventory:** 字段、来源、类别、用途、接收方、保存位置和期限。
   **Data inventory:** Fields, sources, categories, purposes, recipients, storage location, and retention.
2. **默认合成 / Synthetic by default:** 开发、测试、演示与培训优先使用合成数据。
   **Synthetic by default:** Prefer synthetic data for development, testing, demos, and training.
3. **最小权限 / Least privilege:** 只读优先；写操作限测试环境、限定账户和约定窗口。
   **Least privilege:** Read-only first; writes are limited to test environments, designated accounts, and agreed windows.
4. **凭据隔离 / Secret isolation:** 凭据由客户放入批准的密钥管理位置；不进入代码、文档、聊天、日志或录屏。
   **Secret isolation:** Customer places credentials in an approved secret store; secrets never enter code, documents, chat, logs, or recordings.
5. **第三方确认 / Third-party confirmation:** 列明模型、API、托管和分析服务，确认许可、地区与数据条款。
   **Third-party confirmation:** Identify model, API, hosting, and analytics services; confirm licenses, regions, and data terms.
6. **删除计划 / Deletion plan:** 写明工作副本、临时文件、日志、缓存和备份的删除或轮转方式。
   **Deletion plan:** State deletion or rotation for working copies, temporary files, logs, caches, and backups.
7. **禁止用途 / Prohibited uses:** 客户数据不得用于训练、微调、公开演示或案例宣传。
   **Prohibited uses:** Customer data must not be used for training, fine-tuning, public demonstrations, or case-study marketing.

未经批准不得提升权限、增加数据字段或更换第三方服务。
Do not elevate permissions, add fields, or replace third-party services without approval.

## 3. 开发规则 / Development rules

- 在约定分支或版本中工作，保留可追溯变更记录。
  Work in agreed branches or versions with traceable change records.
- 配置与代码分离；生产、测试和演示环境分开。
  Separate configuration from code and isolate production, test, and demo environments.
- 每个外部调用设置超时、有限重试、错误分类和人工接管。
  Set timeouts, bounded retries, error categories, and human takeover for every external call.
- 写操作应可追踪；高风险动作必须由授权人确认。
  Write operations must be traceable; high-risk actions require authorized confirmation.
- 日志只记录必要元数据，不记录凭据、完整敏感载荷或无关个人信息。
  Logs contain only necessary metadata, without credentials, complete sensitive payloads, or unrelated personal information.
- 依赖、模型和第三方组件记录版本与许可；未审许可不进入生产。
  Record versions and licenses of dependencies, models, and third-party components; unreviewed licenses do not reach production.
- 变更超出范围时先提交书面变更单，不先开发后解释。
  Submit a written change order before out-of-scope work; do not develop first and explain later.

## 4. 测试与上线前检查 / Testing and pre-launch checks

| 测试类型 / Test type | 最低检查 / Minimum checks |
|---|---|
| 正常流程 / Normal path | 约定输入得到约定输出，字段和状态一致。 / Agreed input produces agreed output with consistent fields and states. |
| 异常与边界 / Abnormal and boundary | 空值、重复、超时、限流、格式错误、权限不足、服务不可用。 / Nulls, duplicates, timeouts, rate limits, invalid formats, insufficient permissions, and unavailable services. |
| 权限与数据 / Permissions and data | 未授权角色被拒绝；日志与界面不泄露不必要数据。 / Unauthorized roles are denied; logs and interfaces expose no unnecessary data. |
| 重试与幂等 / Retry and idempotency | 有限重试不产生重复写入；失败可恢复。 / Bounded retries do not duplicate writes; failures are recoverable. |
| 回滚 / Rollback | 可按手册恢复到已知状态，且恢复步骤已演练。 / A known state can be restored using a rehearsed runbook. |
| 人工接管 / Human takeover | 暂停、跳过、复核和升级路径可用。 / Pause, skip, review, and escalation paths work. |
| 安全 / Security | 无硬编码密钥、无公开调试端点、无未授权外联。 / No hard-coded secrets, public debug endpoints, or unauthorized external calls. |
| 文档与依赖 / Documentation and dependencies | 运行手册与当前版本一致；第三方许可已复核。 / Runbook matches the current version; third-party licenses are reviewed. |

公开站点还必须通过 [部署文档](deployment.md) 中的三网可达性硬闸；未通过不正式发布。
A public site must also pass the three-network reachability hard gate in the [deployment guide](deployment.md); do not officially launch before it passes.

## 5. 验收 / Acceptance

- 使用预先写好的脚本，由客户验收人逐项确认。
  Use prewritten scripts and obtain item-by-item confirmation from the customer's acceptance reviewer.
- 记录实际结果，不只记录“演示成功”。
  Record actual outcomes, not merely “demo succeeded.”
- 缺陷分为阻断、重要、一般和建议；未接受的阻断缺陷不得验收。
  Classify defects as blocking, major, minor, or advisory; do not accept with an unaccepted blocking defect.
- AI 输出按约定的知识边界、拒答和转人工场景验收，不作无限准确性承诺。
  Accept AI output against agreed knowledge boundaries, refusal, and escalation scenarios; do not promise unlimited accuracy.
- 验收后进入约定修正期；新增需求走变更流程。
  After acceptance, enter the agreed correction window; new requirements follow change control.

## 6. 交接 / Handover

交接包应包含：
The handover package should contain:

- 交付范围与不含项。 / Delivered scope and exclusions.
- 已约定交付的代码、配置模板和部署说明。 / Agreed code, configuration templates, and deployment notes.
- 架构图、数据流与第三方依赖。 / Architecture, data flow, and third-party dependencies.
- 启动、停止、备份、恢复、回滚和密钥轮换步骤。 / Start, stop, backup, recovery, rollback, and key-rotation steps.
- 测试与验收记录、已知限制和遗留问题。 / Test and acceptance records, known limits, and outstanding issues.
- 监控入口、告警联系人、响应时段与升级路径。 / Monitoring entry points, alert contacts, response hours, and escalation path.
- 数据删除与支持期结束安排。 / Data deletion and end-of-support arrangements.

## 7. 售后 / After-sales

- 收到问题先确认影响、数据和可复现步骤；不索取完整敏感日志。
  Triage impact, data, and reproduction steps first; do not request complete sensitive logs.
- 在约定修正期内修复不符合验收项的交付范围；维护期按小时与月度范围执行。
  Correct delivered scope that misses acceptance criteria within the agreed correction window; maintenance follows agreed hours and monthly scope.
- 第三方故障、客户环境变更和新需求须先分类，再决定修复、变更或转介。
  Classify third-party outages, customer environment changes, and new requirements before choosing repair, change order, or referral.
- 任何疑似泄露、越权或密钥暴露立即停止相关运行并进入 [事故流程](security-and-data.md#事故处理--incident-handling)。
  Any suspected leak, unauthorized access, or key exposure immediately stops the relevant operation and triggers the [incident process](security-and-data.md#事故处理--incident-handling).

## 8. 复盘 / Retrospective

复盘只回答四个问题：
The retrospective answers four questions:

1. 实际交付是否符合约定范围？ / Did delivery match the agreed scope?
2. 哪些步骤仍依赖人工，哪些异常最常发生？ / Which steps still depend on humans, and which exceptions recur?
3. 哪些结果有运行记录支持，哪些只是推测？ / Which outcomes have run records, and which are assumptions?
4. 下一步是停止、简化、维护还是另立项目？ / Should the next step be stop, simplify, maintain, or start a separate project?

公开复盘只能使用合成或通用表述，不包含客户标识、真实数据、凭据或私有系统细节。
Public retrospectives use only synthetic or generic wording without customer identifiers, real data, credentials, or private system details.

## 完成定义 / Definition of done

项目只有在以下条件全部满足时才标记完成：
A project is marked complete only when all of the following are true:

- [ ] 书面验收通过，遗留项有负责人和期限。 / Written acceptance passes; outstanding items have owners and due dates.
- [ ] 运行、停止和回滚已交接并验证。 / Operation, shutdown, and rollback are handed over and verified.
- [ ] 数据删除或保留安排已确认。 / Data deletion or retention arrangements are confirmed.
- [ ] 第三方依赖、许可与费用责任已记录。 / Third-party dependencies, licenses, and cost responsibilities are recorded.
- [ ] 售后窗口、联系方式和停止条件已说明。 / After-sales window, contacts, and stop conditions are explained.

## 事实与承诺 / Facts and commitments

**事实 / Facts:** 本 SOP 定义交付控制点，不代表已经为任何真实客户完成交付。
**Facts:** This SOP defines delivery controls; it does not represent completed delivery for any real customer.

**承诺 / Commitments:** 具体周期、修正期、维护小时数和响应目标以报价或协议为准。
**Commitments:** Specific schedules, correction windows, maintenance hours, and response targets follow the quote or agreement.
