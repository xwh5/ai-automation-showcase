# XWH AI 安全与数据规范
# XWH AI Security and Data Policy

版本 / Version: 1.0

## 原则 / Principles

1. **合成优先 / Synthetic first:** 演示、开发、测试与培训默认使用合成数据。
   **Synthetic first:** Demos, development, testing, and training use synthetic data by default.
2. **最小必要 / Minimum necessary:** 只收集完成约定流程所必需的字段、权限和时间窗口。
   **Minimum necessary:** Collect only the fields, permissions, and time windows necessary for the agreed workflow.
3. **客户控制 / Customer control:** 客户掌握其系统、账户、密钥和业务数据。
   **Customer control:** The customer controls its systems, accounts, keys, and business data.
4. **禁止二次用途 / No secondary use:** 客户数据不用于训练、微调、公开演示或营销。
   **No secondary use:** Customer data is not used for training, fine-tuning, public demonstrations, or marketing.
5. **可停止、可恢复 / Stoppable and recoverable:** 每个自动化流程都应有暂停、人工接管和回滚路径。
   **Stoppable and recoverable:** Every automation has pause, human-takeover, and rollback paths.

本规范是通用运营规则，不替代客户的法律、隐私、安全或行业合规审查。
This is a general operating policy, not a substitute for the customer's legal, privacy, security, or industry compliance review.

## 合成数据 / Synthetic data

可用于公开演示或测试的合成数据应满足：
Synthetic data used in public demos or tests should meet all of the following:

- 姓名、组织、地址、邮箱、账号和业务编号均为虚构。
  Names, organizations, addresses, emails, accounts, and business identifiers are fictional.
- 不是从真实客户记录复制、轻微改写或做可逆匿名化得到。
  Data is not copied from real customer records, lightly modified, or reversibly anonymized.
- 不包含可关联到真实个人的组合字段、精确位置、真实照片或声纹。
  Data contains no combinations linkable to real people, precise locations, real photos, or voiceprints.
- 文件、截图、日志和录屏在公开前检查客户标识、域名、内部编号、凭据和私有路径。
  Files, screenshots, logs, and recordings are checked for customer identifiers, domains, internal IDs, credentials, and private paths before publication.
- 使用固定随机种子或明确的数据生成说明，便于复现测试。
  A fixed random seed or documented generation method supports reproducible testing.

合成数据可以降低风险，但不能自动证明生产环境安全、合法或效果稳定。
Synthetic data reduces risk but does not by itself prove production safety, legality, or stable outcomes.

## 真实数据的准入 / Real-data admission

默认不需要真实数据。若客户主张必须使用真实数据，应先完成以下准入检查：
Real data is not required by default. If a customer says real data is necessary, complete these checks first:

1. 客户确认其有权提供数据并授权约定用途。
   The customer confirms the right to provide the data and authorize the agreed use.
2. 数据字段、类别、目的、接收方、保存期限和删除方式写入范围文件。
   Fields, categories, purposes, recipients, retention, and deletion are written into the scope record.
3. 能用较少字段或聚合数据完成时，不使用完整明细。
   Use fewer fields or aggregates instead of full records when sufficient.
4. 涉及个人信息、敏感信息或跨境传输时，由客户先确认法律与合同条件。
   For personal, sensitive, or cross-border data, the customer first confirms legal and contractual conditions.
5. 敏感数据、人脸数据和身份数据未通过单独审查时，不进入开发或演示。
   Sensitive, facial, and identity data does not enter development or demos without separate review.
6. 无法确认授权、必要性或删除方式时，拒绝接收并改用合成样本。
   If authorization, necessity, or deletion cannot be confirmed, refuse receipt and use synthetic samples.

客户发送数据不等于授权任意使用；超出约定目的必须重新获得书面批准。
Sending data does not authorize arbitrary use; any use beyond the agreed purpose requires new written approval.

## 最小权限 / Least privilege

- 只读优先，写权限仅限约定环境、账户、对象和操作窗口。
  Read-only first; write access is limited to agreed environments, accounts, objects, and windows.
- 优先使用客户创建的专用测试账户，不使用共享管理员账户。
  Prefer customer-created dedicated test accounts over shared administrator accounts.
- 权限矩阵记录“谁、为何、访问什么、到何时、谁撤销”。
  The permission matrix records who, why, what, until when, and who revokes access.
- 项目结束、角色变化或出现风险时及时降权或撤销。
  Access is reduced or revoked at project end, role change, or emerging risk.
- 不允许通过共享密码、长期个人令牌或绕过多因素认证来维持访问。
  Shared passwords, long-lived personal tokens, and MFA bypass are not permitted.
- 不在本地保留不必要的生产数据副本。
  Unnecessary production-data copies are not retained locally.

## 客户数据归属 / Customer data ownership

- 客户数据及其相关权利归客户或合法权利人所有；XWH AI 不主张客户数据所有权。
  Customer data and associated rights belong to the customer or lawful rights holder; XWH AI claims no ownership of customer data.
- XWH AI 仅在约定目的、期限和权限内处理客户数据。
  XWH AI processes customer data only for the agreed purpose, duration, and permissions.
- 代码、配置和文档的知识产权归属在报价或协议中单独写明，不与数据所有权混为一谈。
  Intellectual-property ownership of code, configuration, and documentation is stated separately in the quote or agreement and is distinct from data ownership.
- 第三方软件、模型、字体、图片和数据保留其原有许可，不因交付而自动转让。
  Third-party software, models, fonts, images, and data retain their original licenses; delivery does not automatically transfer them.

## 删除与保留 / Deletion and retention

以下为默认操作目标；如项目需要不同期限，应在接触数据前书面确认：
The following are default operating targets; different retention periods must be agreed in writing before data access:

| 数据类别 / Data category | 默认期限与动作 / Default retention and action |
|---|---|
| 合成演示数据 / Synthetic demo data | 可保留与项目无关联的通用版本；公开前重新检查。 / Unlinked generic versions may be retained and are rechecked before publication. |
| 真实数据工作副本 / Real-data working copies | 项目结束或客户提前要求后 **30 个自然日内**删除；若法律要求保留，须由客户书面说明范围和期限。 / Delete within **30 calendar days** after project end or earlier customer request; legally required retention must be documented by the customer with scope and duration. |
| 临时文件与调试日志 / Temporary files and debug logs | 问题解决后 **7 个自然日内**清理，最迟不超过工作副本期限；优先不记录敏感内容。 / Clear within **7 calendar days** after resolution and no later than the working-copy deadline; avoid sensitive content by design. |
| 项目缓存与同步状态 / Project caches and sync state | 仅保留恢复运行所必需的最小状态，并按同一最迟期限清理。 / Keep only minimal state needed for recovery and clear it by the same final deadline. |
| 备份 / Backups | 客户批准的最长 **90 天**轮转周期后清除；灾难恢复后重新执行删除。 / Expire after a customer-approved rotation period of no more than **90 days**; reapply deletion after disaster recovery. |
| 客户系统中的原始数据 / Source data in customer systems | XWH AI 不删除；由客户按自己的策略管理。 / Not deleted by XWH AI; managed by the customer under its own policy. |

删除完成后提供包含日期、数据类别、位置类别和操作人的记录；不公开数据内容或私人路径。
A deletion record states the date, data category, location category, and operator without publishing data content or private paths.

## 禁止训练与公开 / No training or public disclosure

- **禁止**将客户数据、客户文档、提示词、输出、日志或业务知识用于训练、微调、蒸馏、构建评测集或改进通用模型。
  **Prohibited:** Using customer data, documents, prompts, outputs, logs, or business knowledge for training, fine-tuning, distillation, evaluation sets, or improvement of general models.
- **禁止**把客户数据、客户名称、标识、截图、界面或结果用于公开演示、案例、社交媒体或营销。
  **Prohibited:** Using customer data, names, branding, screenshots, interfaces, or results in public demos, case studies, social media, or marketing.
- 对外展示只能使用合成数据、通用流程图或客户另行明确书面授权的材料。
  External presentation uses only synthetic data, generic diagrams, or materials explicitly authorized in writing by the customer.
- 即使客户提出宣传请求，也先另案审查授权范围和内容；未完成审查不发布。
  Even when publicity is requested, authorization and content are reviewed separately; nothing is published before review.
- 不得将“帮助客户训练其自有模型”与“使用客户数据训练通用模型”混为一谈；前者也须单独授权、环境与许可评估。
  Customer-specific model work is distinct from training a general model on customer data; it still requires separate authorization, environment, and license review.

## 密钥与访问 / Keys and access

- 客户通过批准的密钥管理位置创建和保存密钥；不得通过公开聊天、工单、文档或邮件正文传递。
  Customers create and store keys in an approved secret-management location; keys are not sent through public chat, tickets, documents, or email bodies.
- 代码仓库、构建日志、浏览器存储和前端 bundle 不得包含秘密值。
  Secret values do not appear in repositories, build logs, browser storage, or frontend bundles.
- 演示只使用无生产权限的测试密钥或占位值；录屏前关闭通知并检查界面。
  Demos use non-production test keys or placeholders; notifications are disabled and screens checked before recording.
- 疑似暴露时立即停用并轮换，不以“删除聊天记录”代替轮换。
  Suspected exposure triggers immediate revocation and rotation; deleting a chat message is not a substitute.
- 项目结束时撤销交付方访问，并记录撤销结果。
  Delivery access is revoked at project end and the result is recorded.

## 第三方服务与许可 / Third-party services and licenses

使用任何模型、API、托管、分析、字体、图片或代码组件前，应记录：
Before using any model, API, hosting, analytics, font, image, or code component, record:

- 提供者、用途、版本和客户可见名称。 / Provider, purpose, version, and customer-facing name.
- 数据是否发送到第三方、发送哪些字段、保存多久。 / Whether data is sent to the third party, which fields, and for how long.
- 是否用于第三方训练、是否支持关闭以及相关条款。 / Whether the third party uses data for training, whether that can be disabled, and relevant terms.
- 处理地区、跨境风险和客户批准。 / Processing regions, cross-border risk, and customer approval.
- 软件、模型、数据集和内容的许可及再分发限制。 / Licenses and redistribution limits for software, models, datasets, and content.
- 费用承担方、退出方式和替代方案。 / Cost owner, exit method, and alternative.

禁止使用来源不明、许可不明或禁止约定用途的组件。不得假设“开源”“可下载”或“免费”等于可商用或可再分发。
Unknown-origin, unknown-license, or purpose-restricted components are prohibited. Open source, downloadable, or free does not automatically mean commercially usable or redistributable.

新增第三方或改变数据流前必须重新审查并取得客户书面批准。
A new third party or changed data flow requires renewed review and written customer approval.

## 事故处理 / Incident handling

事故包括疑似数据泄露、密钥暴露、越权访问、恶意输入导致异常写入、错误接收数据或第三方安全事件。
Incidents include suspected data leaks, key exposure, unauthorized access, malicious input causing abnormal writes, wrongly received data, and third-party security events.

### 处置步骤 / Response steps

1. **停止与隔离 / Stop and isolate**
   暂停相关任务、账户或接口，阻止进一步影响；不删除证据。
   Pause the affected task, account, or interface to prevent further impact; do not destroy evidence.

2. **确认最小事实 / Confirm minimum facts**
   记录发现时间、受影响系统类别、数据类别、已知范围和当前控制措施；不复制完整敏感数据。
   Record discovery time, affected system category, data category, known scope, and current controls without copying full sensitive data.

3. **撤销与轮换 / Revoke and rotate**
   立即停用受影响密钥、令牌或账户，检查是否有未授权写入。
   Immediately revoke affected keys, tokens, or accounts and check for unauthorized writes.

4. **通知 / Notify**
   在确认影响后，目标为 **24 小时内**通知约定客户联系人，说明已知事实、未知事项和正在采取的措施。
   After impact is confirmed, target notification to the designated customer contact within **24 hours**, stating known facts, unknowns, and actions underway.

5. **恢复 / Recover**
   从批准的备份或已知版本恢复；重新测试权限、数据和核心流程后再上线。
   Restore from an approved backup or known version and retest permissions, data, and core flows before relaunch.

6. **复盘与改进 / Review and improve**
   目标为 **5 个工作日内**提交初步复盘；更新权限、测试、日志和停止条件。
   Target a preliminary review within **5 business days**; update permissions, tests, logs, and stop conditions.

上述时间是内部响应目标，不替代客户或法律规定的通知义务，也不保证未知第三方事件的完整信息能立即取得。
These times are internal response targets; they do not replace customer or legally required notification duties or guarantee immediate complete information from third parties.

### 不得做的事 / Prohibited incident actions

- 不公开事故细节、客户身份或数据样本。 / Do not publish incident details, customer identity, or data samples.
- 不隐瞒已知影响，不作无证据的安全保证。 / Do not conceal known impact or make unsupported security guarantees.
- 不未经批准联系客户终端用户、监管机构或媒体。 / Do not contact end users, regulators, or media without authorization.
- 不在事故未受控时继续运行同一流程。 / Do not keep the same workflow running while the incident is uncontrolled.

## 双方责任 / Shared responsibilities

### XWH AI 责任 / XWH AI responsibilities

- 按约定范围处理数据，维持最小权限并记录访问与删除。
  Process data within agreed scope, maintain least privilege, and record access and deletion.
- 对交付范围内已知风险作说明，不用模糊措辞替代边界。
  Explain known delivery risks without replacing boundaries with vague language.
- 发现交付相关事故时立即控制并按约定通报。
  Immediately contain and report delivery-related incidents as agreed.

### 客户责任 / Customer responsibilities

- 确认数据授权、合法用途、系统条款和上线批准。
  Confirm data authorization, lawful purpose, system terms, and launch approval.
- 管理客户侧账户、生产密钥、备份、终端和通知义务。
  Manage customer-side accounts, production keys, backups, endpoints, and notification duties.
- 及时报告权限、数据、界面和第三方服务变化。
  Promptly report permission, data, interface, and third-party service changes.
- 不索取或传播不应公开的数据、日志或演示材料。
  Do not request or distribute data, logs, or demo materials that should not be public.

## 事实与承诺 / Facts and commitments

**事实 / Facts:** 本页规定数据处理与安全控制规则，不声称获得任何安全认证、审计或客户数据。
**Facts:** This page defines data-handling and security controls; it does not claim any security certification, audit, or customer data.

**承诺 / Commitments:** 删除期限、事故响应目标和权限规则在写入具体报价或协议后生效；客户侧与第三方义务仍需按合同和法律确定。
**Commitments:** Deletion periods, incident-response targets, and permission rules take effect when included in the specific quote or agreement; customer-side and third-party duties still depend on contract and law.

## 相关文档 / Related documents

- [交付 SOP / Delivery SOP](delivery-sop.md)
- [服务目录 / Service catalog](service-catalog.md)
- [销售流程 / Sales process](sales-process.md)
- [能力矩阵 / Capability matrix](capability-matrix.md)
- [部署文档 / Deployment guide](deployment.md)
