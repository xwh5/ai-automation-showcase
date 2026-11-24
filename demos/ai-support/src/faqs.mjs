export const CATEGORY_LABELS = {
  accounts: { zh: "账号与权限", en: "Accounts & access" },
  billing: { zh: "账单与发票", en: "Billing & invoices" },
  knowledge: { zh: "知识库管理", en: "Knowledge management" },
  search: { zh: "检索与引用", en: "Search & citations" },
  security: { zh: "安全与隐私", en: "Security & privacy" },
  integrations: { zh: "集成与 API", en: "Integrations & API" },
  plans: { zh: "套餐与用量", en: "Plans & usage" },
  support: { zh: "支持与 SLA", en: "Support & SLA" },
  data: { zh: "导出与删除", en: "Export & deletion" },
};

// All organizations, limits, policies, and examples below are fictional.
export const FAQS = [
  {
    id: "KB-001",
    category: "accounts",
    zh: {
      question: "忘记密码后如何重置？",
      answer: "在登录页选择“忘记密码”，输入工作邮箱。重置链接的有效期为 30 分钟。如果没有收到邮件，请先检查垃圾邮件，再联系工作区管理员。",
      keywords: ["忘记密码", "重置密码", "登录", "重置链接"],
    },
    en: {
      question: "How do I reset a forgotten password?",
      answer: "Choose “Forgot password” on the sign-in page and enter your work email. The reset link is valid for 30 minutes. If no email arrives, check spam and then contact your workspace administrator.",
      keywords: ["forgotten password", "reset password", "sign in", "reset link"],
    },
  },
  {
    id: "KB-002",
    category: "accounts",
    zh: {
      question: "如何开启双重验证？",
      answer: "进入“设置 → 安全 → 身份验证器”，扫描二维码并输入 6 位动态码。启用后请保存恢复码；恢复码应存放在安全的密码管理器中。",
      keywords: ["双重验证", "两步验证", "MFA", "2FA", "动态码", "恢复码"],
    },
    en: {
      question: "How do I enable two-factor authentication?",
      answer: "Open Settings → Security → Authenticator, scan the QR code, and enter the 6-digit code. Save the recovery codes in a secure password manager after enabling MFA.",
      keywords: ["two factor authentication", "multi factor authentication", "MFA", "2FA", "authenticator", "recovery codes"],
    },
  },
  {
    id: "KB-003",
    category: "accounts",
    zh: {
      question: "怎样邀请新成员加入企业空间？",
      answer: "管理员进入“工作区设置 → 成员 → 邀请”，输入成员邮箱并选择角色。邀请链接 7 天有效，管理员可以在到期前重新发送。",
      keywords: ["邀请成员", "邀请同事", "新成员", "企业空间"],
    },
    en: {
      question: "How do I invite a teammate to the workspace?",
      answer: "An administrator opens Workspace settings → Members → Invite, enters the teammate's email, and selects a role. Invitations expire after 7 days and can be resent before expiry.",
      keywords: ["invite member", "invite teammate", "new member", "workspace invitation"],
    },
  },
  {
    id: "KB-004",
    category: "accounts",
    zh: {
      question: "在哪里配置 SAML 单点登录？",
      answer: "企业版管理员可在“设置 → 身份验证 → SAML”上传身份提供商元数据。请先在测试模式验证映射，再启用强制单点登录。",
      keywords: ["SAML", "单点登录", "SSO", "身份提供商", "IdP"],
    },
    en: {
      question: "Where do I configure SAML single sign-on?",
      answer: "Enterprise administrators can upload identity-provider metadata under Settings → Authentication → SAML. Validate attribute mapping in test mode before enforcing SSO.",
      keywords: ["SAML", "single sign on", "SSO", "identity provider", "IdP"],
    },
  },
  {
    id: "KB-005",
    category: "accounts",
    zh: {
      question: "如何移除离职成员并保留其内容？",
      answer: "管理员在“成员”中选择该成员并停用账号。停用不会删除其内容；请先重新分配文档所有权和待处理审批。",
      keywords: ["移除成员", "离职", "停用账号", "重新分配"],
    },
    en: {
      question: "How do I remove a departed member without losing their content?",
      answer: "An administrator selects the member under Members and deactivates the account. Deactivation keeps content; reassign document ownership and pending approvals first.",
      keywords: ["remove member", "offboarding", "departed employee", "deactivate account", "reassign ownership"],
    },
  },
  {
    id: "KB-006",
    category: "accounts",
    zh: {
      question: "管理员、编辑者和查看者的权限有什么区别？",
      answer: "管理员管理成员、账单和安全策略；编辑者可以创建、修改和发布文档；查看者只能检索和阅读被授权内容。导出权限需要单独开启。",
      keywords: ["管理员权限", "编辑者", "查看者", "角色权限"],
    },
    en: {
      question: "What is the difference between admin, editor, and viewer roles?",
      answer: "Admins manage members, billing, and security policies. Editors create, edit, and publish documents. Viewers can search and read authorized content. Export permission is granted separately.",
      keywords: ["admin role", "editor role", "viewer role", "role permissions"],
    },
  },
  {
    id: "KB-007",
    category: "billing",
    zh: {
      question: "支持哪些付款方式？",
      answer: "月付和年付支持企业信用卡或银行转账。年度银行转账需要财务确认后开通服务；不支持现金和加密货币。",
      keywords: ["付款方式", "信用卡", "银行转账", "支付"],
    },
    en: {
      question: "Which payment methods are supported?",
      answer: "Monthly and annual plans accept corporate cards or bank transfer. Annual bank transfers activate after finance confirmation. Cash and cryptocurrency are not supported.",
      keywords: ["payment methods", "credit card", "bank transfer", "payment"],
    },
  },
  {
    id: "KB-008",
    category: "billing",
    zh: {
      question: "如何下载发票？",
      answer: "管理员进入“账单 → 发票”，选择账单周期并下载 PDF。请在下个账单周期开始前更新开票信息，已开具发票不能直接改写。",
      keywords: ["下载发票", "电子发票", "账单", "PDF"],
    },
    en: {
      question: "How do I download an invoice?",
      answer: "An administrator opens Billing → Invoices, selects the billing period, and downloads the PDF. Update tax details before the next cycle; issued invoices cannot be edited directly.",
      keywords: ["download invoice", "billing invoice", "PDF invoice", "tax details"],
    },
  },
  {
    id: "KB-009",
    category: "billing",
    zh: {
      question: "如何修改账单联系人？",
      answer: "管理员可在“账单 → 联系人”更新姓名、邮箱和电话。新联系人从下一个账单周期开始接收发票和付款提醒。",
      keywords: ["账单联系人", "修改邮箱", "财务联系人"],
    },
    en: {
      question: "How do I change the billing contact?",
      answer: "An administrator updates the name, email, and phone under Billing → Contact. The new contact receives invoices and payment reminders from the next billing cycle.",
      keywords: ["billing contact", "finance contact", "change billing email"],
    },
  },
  {
    id: "KB-010",
    category: "billing",
    zh: {
      question: "订阅可以退款吗？",
      answer: "首次购买月付或年付套餐后 14 天内，且使用量低于套餐上限的 10%，可申请自助退款。超过条件请提交支持工单人工审核。",
      keywords: ["退款", "14天", "自助退款", "订阅"],
    },
    en: {
      question: "Can I get a refund for a subscription?",
      answer: "A first monthly or annual purchase can be self-refunded within 14 days when usage is below 10% of the plan limit. Other requests require manual support review.",
      keywords: ["subscription refund", "refund policy", "14 days", "self refund"],
    },
  },
  {
    id: "KB-011",
    category: "billing",
    zh: {
      question: "扣款失败后会发生什么？",
      answer: "系统会在 24 小时内重试 3 次，并通知账单联系人。请及时更新付款方式；宽限期 7 天后工作区会变为只读。",
      keywords: ["扣款失败", "支付失败", "重试", "宽限期"],
    },
    en: {
      question: "What happens when a payment fails?",
      answer: "The system retries 3 times within 24 hours and notifies the billing contact. Update the payment method promptly; the workspace becomes read-only after a 7-day grace period.",
      keywords: ["failed payment", "payment failure", "retry charge", "grace period"],
    },
  },
  {
    id: "KB-012",
    category: "billing",
    zh: {
      question: "年付如何计费和续订？",
      answer: "年付按购买时的席位数量一次性收取全年费用。续订前 30 天会发送提醒；席位增减在下一张发票中按比例结算。",
      keywords: ["年付", "续订", "席位", "按比例"],
    },
    en: {
      question: "How does annual billing and renewal work?",
      answer: "Annual billing charges the full year based on seats at purchase. A reminder is sent 30 days before renewal, and seat changes are prorated on the next invoice.",
      keywords: ["annual billing", "annual renewal", "seat proration", "yearly plan"],
    },
  },
  {
    id: "KB-013",
    category: "knowledge",
    zh: {
      question: "知识库支持哪些文件格式？",
      answer: "支持 PDF、DOCX、Markdown、HTML 和 CSV，单个文件上限 25 MB。扫描版 PDF 可使用中英文 OCR；加密文件需要先解除密码。",
      keywords: ["文件格式", "PDF", "DOCX", "Markdown", "CSV", "OCR"],
    },
    en: {
      question: "Which file formats can I import into the knowledge base?",
      answer: "PDF, DOCX, Markdown, HTML, and CSV are supported up to 25 MB per file. Scanned PDFs can use Chinese or English OCR. Password-protected files must be unlocked first.",
      keywords: ["file formats", "PDF", "DOCX", "Markdown", "CSV", "OCR"],
    },
  },
  {
    id: "KB-014",
    category: "knowledge",
    zh: {
      question: "如何导入扫描版 PDF？",
      answer: "在“知识库 → 导入”上传 PDF，选择中文或英文 OCR，然后提交。处理完成后打开文档检查识别文本，再发布到检索索引。",
      keywords: ["导入PDF", "扫描版", "OCR", "上传"],
    },
    en: {
      question: "How do I import a scanned PDF?",
      answer: "Upload the PDF under Knowledge base → Import, choose Chinese or English OCR, and submit. Review the recognized text before publishing it to the search index.",
      keywords: ["import scanned PDF", "OCR upload", "scanned document"],
    },
  },
  {
    id: "KB-015",
    category: "knowledge",
    zh: {
      question: "批量更新后需要重建索引吗？",
      answer: "大批量替换文档后，管理员可在“设置 → 索引”执行重建。重建期间仍可搜索旧索引，通常 15 分钟内完成。",
      keywords: ["重建索引", "批量更新", "索引"],
    },
    en: {
      question: "Do I need to rebuild the index after a bulk update?",
      answer: "After a large document replacement, an administrator can rebuild under Settings → Index. Search remains available on the old index, and rebuilding usually takes under 15 minutes.",
      keywords: ["rebuild index", "bulk update", "reindex"],
    },
  },
  {
    id: "KB-016",
    category: "knowledge",
    zh: {
      question: "重复导入的文档会怎样处理？",
      answer: "系统按文件名和内容哈希标记疑似重复项，但不会自动合并。管理员可以保留为新版本、跳过重复项或删除旧版本。",
      keywords: ["重复文档", "重复导入", "内容哈希"],
    },
    en: {
      question: "What happens when I import duplicate documents?",
      answer: "The system flags likely duplicates by filename and content hash but does not merge them automatically. An admin can keep a new version, skip the duplicate, or remove the old version.",
      keywords: ["duplicate documents", "duplicate import", "content hash"],
    },
  },
  {
    id: "KB-017",
    category: "knowledge",
    zh: {
      question: "如何查看和恢复文档历史版本？",
      answer: "打开文档的“版本”面板，可以比较修改差异并恢复旧版本。团队版保留 180 天历史，其他套餐的保留期见套餐说明。",
      keywords: ["历史版本", "版本恢复", "版本对比"],
    },
    en: {
      question: "How do I view and restore document version history?",
      answer: "Open the document's Versions panel to compare changes and restore an earlier version. The Team plan retains 180 days of history; other plans differ.",
      keywords: ["version history", "restore version", "compare versions"],
    },
  },
  {
    id: "KB-018",
    category: "knowledge",
    zh: {
      question: "修改已发布文档后多久能搜到？",
      answer: "编辑者修改并发布后，检索索引通常会在 5 分钟内刷新。如需立即生效，管理员可以针对该文档执行“重新索引”。",
      keywords: ["修改文档", "发布", "索引刷新", "重新索引"],
    },
    en: {
      question: "How soon can I search an edited published document?",
      answer: "After an editor publishes changes, the search index usually refreshes within 5 minutes. An administrator can reindex the document for immediate processing.",
      keywords: ["edit published document", "publish changes", "index refresh", "reindex document"],
    },
  },
  {
    id: "KB-019",
    category: "search",
    zh: {
      question: "搜索没有结果时应该怎么办？",
      answer: "尝试减少关键词、移除筛选条件或使用同义词，并确认自己有权限访问该内容。仍无结果时，可向知识库管理员反馈。",
      keywords: ["搜索无结果", "没有结果", "搜不到", "筛选"],
    },
    en: {
      question: "What should I do when search returns no results?",
      answer: "Use fewer keywords, remove filters, or try a synonym, and confirm you have permission to view the content. If nothing appears, send feedback to the knowledge-base administrator.",
      keywords: ["no search results", "zero results", "cannot find document", "search filters"],
    },
  },
  {
    id: "KB-020",
    category: "search",
    zh: {
      question: "可以混合使用中英文关键词搜索吗？",
      answer: "可以。系统会自动识别查询语言，并在同一索引中匹配中英文内容。产品名、错误码和缩写建议保留原文。",
      keywords: ["中英文搜索", "混合搜索", "语言识别"],
    },
    en: {
      question: "Can I search with mixed Chinese and English keywords?",
      answer: "Yes. The system detects the query language and matches Chinese and English content in the same index. Keep product names, error codes, and acronyms in their original form.",
      keywords: ["mixed language search", "Chinese English keywords", "language detection"],
    },
  },
  {
    id: "KB-021",
    category: "search",
    zh: {
      question: "如何按分类、来源或更新时间筛选？",
      answer: "在搜索结果页使用左侧筛选器，可按分类、来源、负责人和更新时间组合筛选。清除单个条件即可扩大结果范围。",
      keywords: ["搜索筛选", "分类筛选", "来源", "更新时间"],
    },
    en: {
      question: "How do I filter by category, source, or update date?",
      answer: "Use the filters beside search results to combine category, source, owner, and update-date constraints. Remove one condition to broaden the result set.",
      keywords: ["search filters", "filter category", "filter source", "updated date"],
    },
  },
  {
    id: "KB-022",
    category: "search",
    zh: {
      question: "如何添加搜索同义词？",
      answer: "管理员在“搜索设置 → 同义词”添加等价词，例如“VPN”对应“远程访问”。保存后执行一次索引刷新即可生效。",
      keywords: ["搜索同义词", "同义词", "VPN", "远程访问"],
    },
    en: {
      question: "How do I add search synonyms?",
      answer: "An administrator adds equivalent terms under Search settings → Synonyms, such as “VPN” for “remote access.” Save and refresh the index to apply the change.",
      keywords: ["search synonyms", "synonym settings", "VPN", "remote access"],
    },
  },
  {
    id: "KB-023",
    category: "search",
    zh: {
      question: "回答中的引用编号代表什么？",
      answer: "引用编号对应合成 FAQ 的稳定条目号，例如 KB-008。点击来源卡可查看条目原文。生产系统还应返回文档链接和权限校验结果。",
      keywords: ["引用", "来源", "FAQ编号", "出处"],
    },
    en: {
      question: "What does a citation ID in an answer mean?",
      answer: "A citation ID maps to a stable synthetic FAQ entry, such as KB-008. Open the source card to inspect the original entry. A production system should also return document links and permission checks.",
      keywords: ["citation ID", "source reference", "FAQ reference", "answer source"],
    },
  },
  {
    id: "KB-024",
    category: "search",
    zh: {
      question: "是否提供搜索分析，会不会监控员工？",
      answer: "生产设计可提供汇总查询量、零结果率等指标，不做员工个人监控。本原型不发送分析数据，也不包含员工级追踪。",
      keywords: ["搜索分析", "员工监控", "零结果率", "隐私"],
    },
    en: {
      question: "Is search analytics available, and does it monitor employees?",
      answer: "A production design may expose aggregate query volume and zero-result rates, not individual employee monitoring. This prototype sends no analytics and has no employee-level tracking.",
      keywords: ["search analytics", "employee monitoring", "zero result rate", "privacy"],
    },
  },
  {
    id: "KB-025",
    category: "security",
    zh: {
      question: "数据在传输和存储时如何加密？",
      answer: "合成安全策略规定：传输使用 TLS 1.2 或更高版本，静态数据使用 AES-256 加密，密钥由独立密钥管理服务托管。",
      keywords: ["数据加密", "传输加密", "静态加密", "TLS", "AES"],
    },
    en: {
      question: "How is data encrypted in transit and at rest?",
      answer: "The synthetic security policy specifies TLS 1.2 or later in transit and AES-256 at rest, with keys held by a separate key-management service.",
      keywords: ["data encryption", "encryption in transit", "encryption at rest", "TLS", "AES"],
    },
  },
  {
    id: "KB-026",
    category: "security",
    zh: {
      question: "可以选择数据驻留区域吗？",
      answer: "企业版可在创建工作区时选择新加坡、法兰克福或弗吉尼亚区域。创建后变更区域需要迁移工单和安全评估。",
      keywords: ["数据驻留", "区域", "新加坡", "法兰克福", "弗吉尼亚"],
    },
    en: {
      question: "Can I choose a data residency region?",
      answer: "Enterprise workspaces choose Singapore, Frankfurt, or Virginia at creation. Changing regions later requires a migration ticket and security review.",
      keywords: ["data residency", "hosting region", "Singapore", "Frankfurt", "Virginia"],
    },
  },
  {
    id: "KB-027",
    category: "security",
    zh: {
      question: "审计日志保留多久，谁可以导出？",
      answer: "审计日志按套餐保留 90、180 或 365 天。仅管理员可以导出 CSV；导出操作本身也会写入审计记录。",
      keywords: ["审计日志", "日志保留", "导出日志"],
    },
    en: {
      question: "How long are audit logs kept, and who can export them?",
      answer: "Audit logs are retained for 90, 180, or 365 days by plan. Only administrators can export CSV, and each export is itself audited.",
      keywords: ["audit logs", "log retention", "export audit log"],
    },
  },
  {
    id: "KB-028",
    category: "security",
    zh: {
      question: "原型如何脱敏邮箱、手机号和身份证号？",
      answer: "原型在写入内存日志或生成回答前，用正则替换邮箱、中国大陆手机号和 18 位身份证号。该规则不能覆盖所有 PII，上线前仍需人工审核和专门检测。",
      keywords: ["PII脱敏", "邮箱", "手机号", "身份证号", "隐私"],
    },
    en: {
      question: "How does the prototype mask emails, phone numbers, and national IDs?",
      answer: "Before writing an in-memory log or rendering an answer, the prototype replaces emails, mainland China mobile numbers, and 18-digit national IDs with regex masks. This is not comprehensive PII detection and still needs review before production.",
      keywords: ["PII masking", "email redaction", "phone redaction", "national ID", "privacy"],
    },
  },
  {
    id: "KB-029",
    category: "security",
    zh: {
      question: "如何轮换 API 密钥？",
      answer: "在“设置 → 开发者”创建新密钥，更新客户端配置后再撤销旧密钥。撤销立即生效，请避免在日志中记录完整密钥。",
      keywords: ["轮换密钥", "API密钥", "撤销密钥"],
    },
    en: {
      question: "How do I rotate an API key?",
      answer: "Create a new key under Settings → Developers, update client configuration, then revoke the old key. Revocation is immediate; never log full keys.",
      keywords: ["rotate API key", "API key rotation", "revoke key"],
    },
  },
  {
    id: "KB-030",
    category: "security",
    zh: {
      question: "原型会调用真实模型或真实客户数据吗？",
      answer: "不会。本原型仅使用内置合成 FAQ 和本地 BM25 检索，不发起网络请求，不调用真实模型，也不连接客户数据。",
      keywords: ["真实模型", "客户数据", "离线", "合成数据"],
    },
    en: {
      question: "Does the prototype call a real model or use real customer data?",
      answer: "No. It uses only built-in synthetic FAQs and local BM25 retrieval. It makes no network requests, calls no real model, and connects to no customer data.",
      keywords: ["real model", "customer data", "offline", "synthetic data"],
    },
  },
  {
    id: "KB-031",
    category: "integrations",
    zh: {
      question: "Webhook 失败后会重试吗？",
      answer: "系统按 1 分钟、5 分钟、15 分钟、1 小时和 6 小时的间隔重试 5 次。仍失败的事件进入死信队列，管理员可以重新投递。",
      keywords: ["Webhook", "重试", "死信队列", "重新投递"],
    },
    en: {
      question: "Are failed webhook deliveries retried?",
      answer: "Deliveries retry 5 times at 1 minute, 5 minutes, 15 minutes, 1 hour, and 6 hours. Persistent failures enter a dead-letter queue for administrator replay.",
      keywords: ["webhook retry", "failed webhook", "dead letter queue", "redelivery"],
    },
  },
  {
    id: "KB-032",
    category: "integrations",
    zh: {
      question: "API 的速率限制是多少？",
      answer: "标准密钥限制为每分钟 600 次请求，突发上限为每分钟 60 次。触发限制时返回 429，请按 Retry-After 响应头退避重试。",
      keywords: ["API限流", "速率限制", "429", "Retry-After"],
    },
    en: {
      question: "What is the API rate limit?",
      answer: "A standard key allows 600 requests per minute with a burst of 60. Throttled requests return 429; retry with backoff using the Retry-After header.",
      keywords: ["API rate limit", "throttling", "429", "Retry-After"],
    },
  },
  {
    id: "KB-033",
    category: "integrations",
    zh: {
      question: "如何连接 Slack？",
      answer: "管理员在“集成 → Slack”完成授权并选择通知频道。机器人默认只在被提及时响应，私聊需要单独开启。",
      keywords: ["Slack集成", "连接Slack", "机器人", "通知频道"],
    },
    en: {
      question: "How do I connect Slack?",
      answer: "An administrator authorizes the app under Integrations → Slack and selects a notification channel. The bot responds to mentions by default; direct messages require separate enablement.",
      keywords: ["Slack integration", "connect Slack", "Slack bot", "notification channel"],
    },
  },
  {
    id: "KB-034",
    category: "integrations",
    zh: {
      question: "CRM 连接器如何同步和解决冲突？",
      answer: "连接器每 15 分钟同步一次。字段冲突默认采用最近更新时间的数据；管理员可以先运行 dry-run 查看映射和冲突。",
      keywords: ["CRM连接器", "字段映射", "同步冲突", "dry-run"],
    },
    en: {
      question: "How does the CRM connector sync and resolve conflicts?",
      answer: "The connector syncs every 15 minutes. Field conflicts use the most recently updated value by default; administrators can run a dry-run to inspect mappings and conflicts.",
      keywords: ["CRM connector", "field mapping", "sync conflict", "dry run"],
    },
  },
  {
    id: "KB-035",
    category: "integrations",
    zh: {
      question: "是否有 API 沙箱环境？",
      answer: "有。开发者设置中可以生成独立的沙箱密钥，使用 test 环境端点。沙箱数据与生产隔离，不产生真实费用。",
      keywords: ["API沙箱", "测试环境", "沙箱密钥"],
    },
    en: {
      question: "Is there an API sandbox environment?",
      answer: "Yes. Developer settings can create a separate sandbox key for test endpoints. Sandbox data is isolated from production and incurs no real charges.",
      keywords: ["API sandbox", "test environment", "sandbox key"],
    },
  },
  {
    id: "KB-036",
    category: "integrations",
    zh: {
      question: "常见的 API 错误码代表什么？",
      answer: "400 表示请求无效，401 表示认证失败，403 表示无权限，404 表示资源不存在，429 表示触发限流。5xx 表示服务端错误，可退避重试并保留请求 ID。",
      keywords: ["API错误码", "401", "403", "404", "429", "5xx"],
    },
    en: {
      question: "What do common API error codes mean?",
      answer: "400 means an invalid request, 401 authentication failure, 403 forbidden, 404 missing resource, and 429 throttling. A 5xx response is a server error; retry with backoff and keep the request ID.",
      keywords: ["API error codes", "401", "403", "404", "429", "5xx"],
    },
  },
  {
    id: "KB-037",
    category: "plans",
    zh: {
      question: "免费试用包含什么？",
      answer: "试用期为 14 天，包含 5 个席位和 100 个文档，不需要信用卡。试用结束后数据保留 30 天，之后删除。",
      keywords: ["免费试用", "14天", "试用席位", "试用文档"],
    },
    en: {
      question: "What is included in the free trial?",
      answer: "The trial lasts 14 days with 5 seats and 100 documents, and no credit card is required. Data is retained for 30 days after the trial, then deleted.",
      keywords: ["free trial", "14 day trial", "trial seats", "trial documents"],
    },
  },
  {
    id: "KB-038",
    category: "plans",
    zh: {
      question: "什么角色会占用席位？",
      answer: "管理员、编辑者和查看者各占一个席位。已停用成员和机器人不占席位；移除的席位从下个账单周期停止计费。",
      keywords: ["席位", "占用席位", "停用成员", "机器人"],
    },
    en: {
      question: "Which roles count toward seats?",
      answer: "Each admin, editor, and viewer uses one seat. Deactivated members and bots do not. Removed seats stop being billed in the next cycle.",
      keywords: ["seat count", "paid seats", "deactivated member", "bot seats"],
    },
  },
  {
    id: "KB-039",
    category: "plans",
    zh: {
      question: "各套餐的存储上限是多少？",
      answer: "入门版为 5 GB，团队版为 25 GB，企业版为 100 GB。原始文件和解析文本都计入存储用量。",
      keywords: ["存储上限", "存储空间", "5GB", "25GB", "100GB"],
    },
    en: {
      question: "What are the storage limits for each plan?",
      answer: "Starter includes 5 GB, Team 25 GB, and Enterprise 100 GB. Original files and parsed text both count toward storage usage.",
      keywords: ["storage limits", "storage quota", "5GB", "25GB", "100GB"],
    },
  },
  {
    id: "KB-040",
    category: "plans",
    zh: {
      question: "超过存储上限后怎么办？",
      answer: "用量达到 80% 和 100% 时会发送提醒。达到上限后暂停上传，直到升级套餐或删除不再需要的内容；不会自动收取超额费用。",
      keywords: ["超出存储", "超额", "暂停上传", "升级", "存储用量", "超过上限"],
    },
    en: {
      question: "What happens when storage exceeds the plan limit?",
      answer: "Warnings are sent at 80% and 100% usage. Uploads pause at the limit until you upgrade or delete unneeded content; no automatic overage charge applies.",
      keywords: ["storage overage", "exceed storage limit", "uploads paused", "upgrade storage"],
    },
  },
  {
    id: "KB-041",
    category: "plans",
    zh: {
      question: "升级或降级套餐何时生效？",
      answer: "升级在付款确认后立即生效，费用按剩余周期比例计算。降级在下一个账单周期生效，当前权益保留到周期结束。",
      keywords: ["升级套餐", "降级套餐", "立即生效", "下个周期"],
    },
    en: {
      question: "When do plan upgrades and downgrades take effect?",
      answer: "Upgrades apply immediately after payment confirmation and are prorated for the remaining period. Downgrades start in the next billing cycle while current benefits remain until then.",
      keywords: ["upgrade plan", "downgrade plan", "prorated upgrade", "next billing cycle"],
    },
  },
  {
    id: "KB-042",
    category: "plans",
    zh: {
      question: "如何取消续订？",
      answer: "管理员在“账单 → 订阅”选择取消续订。服务持续到当前周期结束；请在到期前导出数据，之后数据保留 30 天再删除。",
      keywords: ["取消续订", "退订", "周期结束", "导出数据"],
    },
    en: {
      question: "How do I cancel renewal?",
      answer: "An administrator chooses Cancel renewal under Billing → Subscription. Service continues until the period ends. Export data before expiry; data is then kept for 30 days before deletion.",
      keywords: ["cancel renewal", "cancel subscription", "end of period", "export before cancellation"],
    },
  },
  {
    id: "KB-043",
    category: "support",
    zh: {
      question: "可以通过哪些渠道获得支持？",
      answer: "可使用应用内支持表单；企业版还可申请专属电话渠道。本原型中的转人工按钮只创建模拟工单，不会联系真实客服。",
      keywords: ["支持渠道", "联系客服", "应用内支持", "转人工"],
    },
    en: {
      question: "Which support channels are available?",
      answer: "Use the in-app support form; Enterprise plans can request a dedicated phone channel. The prototype's human-handoff button creates only a mock ticket and contacts no real agent.",
      keywords: ["support channels", "contact support", "in app support", "human handoff"],
    },
  },
  {
    id: "KB-044",
    category: "support",
    zh: {
      question: "P1 故障的响应 SLA 是什么？",
      answer: "P1 指生产完全不可用或疑似数据丢失。企业版目标为 15 分钟响应、4 小时提供临时方案；这是合成目标，不是服务承诺。",
      keywords: ["P1", "故障响应", "SLA", "响应时间"],
    },
    en: {
      question: "What is the response SLA for a P1 incident?",
      answer: "P1 means production is fully unavailable or data loss is suspected. The synthetic Enterprise target is a 15-minute response and a workaround within 4 hours; it is not a service commitment.",
      keywords: ["P1 incident", "response SLA", "incident response", "workaround target"],
    },
  },
  {
    id: "KB-045",
    category: "support",
    zh: {
      question: "技术支持的工作时间是什么？",
      answer: "标准支持时间为周一至周五 09:00–18:00（UTC+8）。企业版 P1 故障提供 7×24 小时响应。",
      keywords: ["支持时间", "工作时间", "7x24", "UTC+8"],
    },
    en: {
      question: "What are the technical support hours?",
      answer: "Standard support runs Monday–Friday, 09:00–18:00 UTC+8. Enterprise P1 incidents receive 24×7 response.",
      keywords: ["support hours", "business hours", "24x7", "UTC+8"],
    },
  },
  {
    id: "KB-046",
    category: "support",
    zh: {
      question: "提交工单时应提供哪些信息？",
      answer: "请提供工作区 ID、UTC 时间、复现步骤和请求 ID。不要提交密码、完整密钥或不必要的个人信息。",
      keywords: ["提交工单", "复现步骤", "工作区ID", "请求ID"],
    },
    en: {
      question: "What information should I include in a support ticket?",
      answer: "Include the workspace ID, UTC timestamp, reproduction steps, and request ID. Do not include passwords, full keys, or unnecessary personal information.",
      keywords: ["support ticket", "reproduction steps", "workspace ID", "request ID"],
    },
  },
  {
    id: "KB-047",
    category: "support",
    zh: {
      question: "计划维护会提前多久通知？",
      answer: "标准维护提前 72 小时通知，通常安排在周日 02:00–04:00（UTC+8）。紧急维护可能只提前 15 分钟。",
      keywords: ["计划维护", "维护通知", "72小时", "周日"],
    },
    en: {
      question: "How much notice is given for planned maintenance?",
      answer: "Standard maintenance is announced 72 hours ahead and usually runs Sunday 02:00–04:00 UTC+8. Emergency maintenance may have only 15 minutes of notice.",
      keywords: ["planned maintenance", "maintenance notice", "72 hours", "Sunday"],
    },
  },
  {
    id: "KB-048",
    category: "support",
    zh: {
      question: "在哪里查看服务状态和历史事件？",
      answer: "状态页按组件展示当前状态和最近 90 天的事件记录。本原型不访问该页面，状态页地址仅存在于合成说明中。",
      keywords: ["服务状态", "状态页", "历史事件"],
    },
    en: {
      question: "Where can I check service status and incident history?",
      answer: "A status page shows component health and the last 90 days of incidents. This prototype does not access it; the status-page address appears only in synthetic documentation.",
      keywords: ["service status", "status page", "incident history"],
    },
  },
  {
    id: "KB-049",
    category: "data",
    zh: {
      question: "可以导出哪些数据格式？",
      answer: "支持 JSON、CSV、Markdown 原文和 ZIP 打包下载。导出包包含清单与校验和，下载链接 24 小时后失效。",
      keywords: ["数据导出", "JSON", "CSV", "Markdown", "ZIP", "知识库导出"],
    },
    en: {
      question: "Which data export formats are available?",
      answer: "JSON, CSV, original Markdown, and ZIP bundles are available. The export includes a manifest and checksum, and the download link expires after 24 hours.",
      keywords: ["data export formats", "JSON", "CSV", "Markdown", "ZIP", "knowledge base export"],
    },
  },
  {
    id: "KB-050",
    category: "data",
    zh: {
      question: "删除工作区需要多久？",
      answer: "所有者提交删除后进入 14 天待删除状态，期间可以取消。确认后执行永久删除，备份中的副本在 30 天内清除。",
      keywords: ["删除工作区", "14天", "永久删除", "备份清除"],
    },
    en: {
      question: "How long does workspace deletion take?",
      answer: "An owner-submitted deletion enters a 14-day pending state and can be cancelled. After confirmation, permanent deletion runs and backup copies are purged within 30 days.",
      keywords: ["delete workspace", "14 day pending", "permanent deletion", "backup purge"],
    },
  },
  {
    id: "KB-051",
    category: "data",
    zh: {
      question: "备份策略和恢复目标是什么？",
      answer: "合成策略为每日增量备份并保留 30 天时间点恢复。目标 RPO 为 24 小时，RTO 为 8 小时；真实环境需要单独验证。",
      keywords: ["备份策略", "RPO", "RTO", "时间点恢复"],
    },
    en: {
      question: "What is the backup policy and recovery objective?",
      answer: "The synthetic policy uses daily incremental backups with 30-day point-in-time recovery. Target RPO is 24 hours and RTO is 8 hours; a real environment requires separate validation.",
      keywords: ["backup policy", "RPO", "RTO", "point in time recovery"],
    },
  },
  {
    id: "KB-052",
    category: "data",
    zh: {
      question: "法律保留如何暂停删除？",
      answer: "企业版管理员可以创建法律保留并指定事项范围。保留期间暂停相关数据删除，只有授权法务人员才能解除保留。",
      keywords: ["法律保留", "暂停删除", "法务", "诉讼保留"],
    },
    en: {
      question: "How does a legal hold pause deletion?",
      answer: "An Enterprise administrator can create a legal hold for a defined matter. Deletion of covered data pauses until authorized legal staff release the hold.",
      keywords: ["legal hold", "pause deletion", "authorized legal staff", "litigation hold"],
    },
  },
  {
    id: "KB-053",
    category: "data",
    zh: {
      question: "如何获取数据处理协议 DPA？",
      answer: "企业版客户可提交法务审核请求以获取数据处理协议模板。本原型仅提供合成说明，不构成正式法律文件。",
      keywords: ["DPA", "数据处理协议", "法务审核"],
    },
    en: {
      question: "How do I obtain a data processing agreement?",
      answer: "Enterprise customers can request a data-processing-agreement template through legal review. This prototype provides synthetic guidance only, not a formal legal document.",
      keywords: ["DPA", "data processing agreement", "legal review"],
    },
  },
  {
    id: "KB-054",
    category: "data",
    zh: {
      question: "关闭账号前需要完成哪些步骤？",
      answer: "请先取消续订、导出所需数据、转移文档所有权，再提交工作区删除。关闭后账号进入 14 天只读恢复期，期满永久删除。",
      keywords: ["关闭账号", "注销", "转移所有权", "恢复期"],
    },
    en: {
      question: "What steps are required before closing an account?",
      answer: "Cancel renewal, export required data, transfer document ownership, and then request workspace deletion. The account enters a 14-day read-only recovery period before permanent deletion.",
      keywords: ["close account", "account closure", "transfer ownership", "recovery period"],
    },
  },
];

export const FAQ_BY_ID = new Map(FAQS.map((faq) => [faq.id, faq]));
