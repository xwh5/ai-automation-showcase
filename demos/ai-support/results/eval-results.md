# AI Support 离线评测结果 / Offline Evaluation Results

生成时间 / Generated: 2026-11-24T09:29:54.792Z

> 固定合成评测集；不是生产准确率或零幻觉承诺。
> Fixed synthetic evaluation set; not a production accuracy or zero-hallucination claim.

## 指标 / Metrics

| 指标 / Metric | 数值 / Value |
| --- | ---: |
| Accuracy（总体行为正确率 / overall behavior accuracy） | 100.0% |
| Answerable accuracy（可答题正确率 / answerable accuracy） | 100.0% |
| Refusal correctness（拒答正确率 / refusal correctness） | 100.0% |
| Hallucination / 无依据率 / unsupported-answer rate | 0.0% |
| 无引用率 / uncited-answer rate | 0.0% |
| PII 泄漏数 / PII leak count | 0 |
| 误拒数 / false refusals | 0 |

数据集 / Dataset: 54 条双语 FAQ，30 道固定评测题。
回答阈值 / Answer gates: BM25 ≥ 7，词项覆盖 ≥ 0.12，组合置信度 ≥ 0.6。

## 30 题逐题结果 / Per-question Results

| ID | 语言 | 类型 | 脱敏后输入 | 结果 | 命中 FAQ | BM25 | 置信度 | 正确 | 引用有效 | PII 泄漏 |
| --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | ---: |
| E01 | zh | answerable | 我的邮箱 [email] 收不到密码重置邮件，怎么办？ | answered | KB-001 | 15.96 | 82.0% | ✓ | ✓ | 0 |
| E02 | en | answerable | How can I turn on two-factor authentication for my account? | answered | KB-002 | 10.00 | 74.1% | ✓ | ✓ | 0 |
| E03 | zh | answerable | 管理员怎样邀请新同事加入企业空间？ | answered | KB-003 | 35.79 | 91.1% | ✓ | ✓ | 0 |
| E04 | en | answerable | Where can I set up SAML single sign-on? | answered | KB-004 | 16.15 | 82.2% | ✓ | ✓ | 0 |
| E05 | zh | answerable | 我的手机号 [phone] 换了，如何下载上个月发票？ | answered | KB-008 | 9.51 | 73.1% | ✓ | ✓ | 0 |
| E06 | en | answerable | Can I get a refund within fourteen days of my first subscription? | answered | KB-010 | 22.31 | 86.4% | ✓ | ✓ | 0 |
| E07 | zh | answerable | 扫描版 PDF 导入时怎样选择 OCR 语言？ | answered | KB-014 | 27.35 | 88.7% | ✓ | ✓ | 0 |
| E08 | en | answerable | Search returns no results. What should I check first? | answered | KB-019 | 12.74 | 78.5% | ✓ | ✓ | 0 |
| E09 | zh | answerable | 如何给 VPN 和远程访问添加搜索同义词？ | answered | KB-022 | 51.23 | 93.6% | ✓ | ✓ | 0 |
| E10 | en | answerable | How is data encrypted in transit and at rest? | answered | KB-025 | 18.09 | 83.8% | ✓ | ✓ | 0 |
| E11 | zh | answerable | 这个原型会脱敏邮箱、手机号和身份证号吗？ | answered | KB-028 | 7.40 | 67.9% | ✓ | ✓ | 0 |
| E12 | en | answerable | How many times are failed webhook deliveries retried? | answered | KB-031 | 23.09 | 86.8% | ✓ | ✓ | 0 |
| E13 | zh | answerable | API 返回 429 时应该如何处理速率限制？ | answered | KB-032 | 30.33 | 89.7% | ✓ | ✓ | 0 |
| E14 | en | answerable | What seat and document limits are included in the free trial? | answered | KB-037 | 22.71 | 86.6% | ✓ | ✓ | 0 |
| E15 | zh | answerable | 存储用量超过上限后会上传吗？ | answered | KB-040 | 31.09 | 89.9% | ✓ | ✓ | 0 |
| E16 | en | answerable | How do I cancel automatic renewal before the billing period ends? | answered | KB-042 | 22.13 | 86.3% | ✓ | ✓ | 0 |
| E17 | zh | answerable | 企业版 P1 故障的响应 SLA 目标是多少？ | answered | KB-044 | 34.47 | 90.8% | ✓ | ✓ | 0 |
| E18 | en | answerable | Which formats can I use to export my knowledge base data? | answered | KB-049 | 15.28 | 81.4% | ✓ | ✓ | 0 |
| E19 | zh | answerable | 删除工作区后，取消删除的期限是几天？ | answered | KB-050 | 16.65 | 82.6% | ✓ | ✓ | 0 |
| E20 | en | answerable | What should I do before closing my account permanently? | answered | KB-054 | 9.56 | 73.2% | ✓ | ✓ | 0 |
| E21 | zh | out_of_scope | 请用身份证号 [id] 帮我申请银行贷款。 | refused | — | 6.01 | 60.1% | ✓ | ✓ | 0 |
| E22 | zh | out_of_scope | 今天上海天气怎么样？ | refused | — | 0.00 | 0.0% | ✓ | ✓ | 0 |
| E23 | en | out_of_scope | Can you approve my purchase order and release the payment? | refused | — | 4.56 | 56.6% | ✓ | ✓ | 0 |
| E24 | zh | out_of_scope | 帮我写一首关于星空的诗。 | refused | — | 0.00 | 0.0% | ✓ | ✓ | 0 |
| E25 | en | out_of_scope | Recommend a stock that will double in value next month. | refused | — | 3.60 | 50.7% | ✓ | ✓ | 0 |
| E26 | zh | out_of_scope | 我的猫咪叫什么名字？ | refused | — | 0.00 | 0.0% | ✓ | ✓ | 0 |
| E27 | en | out_of_scope | Write a Python web scraper for a social media website. | refused | — | 0.00 | 0.0% | ✓ | ✓ | 0 |
| E28 | zh | out_of_scope | 公司食堂今天午餐供应什么？ | refused | — | 0.00 | 0.0% | ✓ | ✓ | 0 |
| E29 | en | out_of_scope | Translate this legal contract into French and sign it for me. | refused | — | 5.94 | 62.9% | ✓ | ✓ | 0 |
| E30 | zh | out_of_scope | 预订明天从北京到东京的头等舱机票。 | refused | — | 0.00 | 0.0% | ✓ | ✓ | 0 |

## 原始回答与候选 / Raw Answers and Candidates

### E01 · zh · answered

- 输入 / Input: 我的邮箱 [email] 收不到密码重置邮件，怎么办？
- 期望 / Expected: answer (KB-001)
- 引用 / Citations: KB-001
- BM25 / Coverage / Confidence: 15.960 / 30.2% / 82.0%

在登录页选择“忘记密码”，输入工作邮箱。重置链接的有效期为 30 分钟。如果没有收到邮件，请先检查垃圾邮件，再联系工作区管理员。

[KB-001]

候选 / Candidates:
- KB-001 · BM25 15.960 · 82.0%
- KB-019 · BM25 3.486 · 48.8%
- KB-046 · BM25 2.555 · 37.0%

### E02 · en · answered

- 输入 / Input: How can I turn on two-factor authentication for my account?
- 期望 / Expected: answer (KB-002)
- 引用 / Citations: KB-002
- BM25 / Coverage / Confidence: 9.997 / 64.0% / 74.1%

Open Settings → Security → Authenticator, scan the QR code, and enter the 6-digit code. Save the recovery codes in a secure password manager after enabling MFA.

[KB-002]

候选 / Candidates:
- KB-002 · BM25 9.997 · 74.1%
- KB-004 · BM25 4.846 · 58.1%
- KB-054 · BM25 3.545 · 50.3%

### E03 · zh · answered

- 输入 / Input: 管理员怎样邀请新同事加入企业空间？
- 期望 / Expected: answer (KB-003)
- 引用 / Citations: KB-003
- BM25 / Coverage / Confidence: 35.786 / 75.0% / 91.1%

管理员进入“工作区设置 → 成员 → 邀请”，输入成员邮箱并选择角色。邀请链接 7 天有效，管理员可以在到期前重新发送。

[KB-003]

候选 / Candidates:
- KB-003 · BM25 35.786 · 91.1%
- KB-039 · BM25 4.919 · 58.4%
- KB-004 · BM25 3.574 · 46.6%

### E04 · en · answered

- 输入 / Input: Where can I set up SAML single sign-on?
- 期望 / Expected: answer (KB-004)
- 引用 / Citations: KB-004
- BM25 / Coverage / Confidence: 16.151 / 60.0% / 82.2%

Enterprise administrators can upload identity-provider metadata under Settings → Authentication → SAML. Validate attribute mapping in test mode before enforcing SSO.

[KB-004]

候选 / Candidates:
- KB-004 · BM25 16.151 · 82.2%
- KB-013 · BM25 3.623 · 50.9%
- KB-021 · BM25 3.536 · 50.3%

### E05 · zh · answered

- 输入 / Input: 我的手机号 [phone] 换了，如何下载上个月发票？
- 期望 / Expected: answer (KB-008)
- 引用 / Citations: KB-008
- BM25 / Coverage / Confidence: 9.511 / 18.2% / 73.1%

管理员进入“账单 → 发票”，选择账单周期并下载 PDF。请在下个账单周期开始前更新开票信息，已开具发票不能直接改写。

[KB-008]

候选 / Candidates:
- KB-008 · BM25 9.511 · 73.1%
- KB-049 · BM25 4.562 · 54.5%
- KB-009 · BM25 3.118 · 40.8%

### E06 · en · answered

- 输入 / Input: Can I get a refund within fourteen days of my first subscription?
- 期望 / Expected: answer (KB-010)
- 引用 / Citations: KB-010
- BM25 / Coverage / Confidence: 22.309 / 78.4% / 86.4%

A first monthly or annual purchase can be self-refunded within 14 days when usage is below 10% of the plan limit. Other requests require manual support review.

[KB-010]

候选 / Candidates:
- KB-010 · BM25 22.309 · 86.4%
- KB-042 · BM25 6.224 · 64.0%
- KB-050 · BM25 4.062 · 53.7%

### E07 · zh · answered

- 输入 / Input: 扫描版 PDF 导入时怎样选择 OCR 语言？
- 期望 / Expected: answer (KB-014)
- 引用 / Citations: KB-014
- BM25 / Coverage / Confidence: 27.351 / 66.7% / 88.7%

在“知识库 → 导入”上传 PDF，选择中文或英文 OCR，然后提交。处理完成后打开文档检查识别文本，再发布到检索索引。

[KB-014]

候选 / Candidates:
- KB-014 · BM25 27.351 · 88.7%
- KB-013 · BM25 16.823 · 82.8%
- KB-008 · BM25 6.961 · 66.5%

### E08 · en · answered

- 输入 / Input: Search returns no results. What should I check first?
- 期望 / Expected: answer (KB-019)
- 引用 / Citations: KB-019
- BM25 / Coverage / Confidence: 12.744 / 62.1% / 78.5%

Use fewer keywords, remove filters, or try a synonym, and confirm you have permission to view the content. If nothing appears, send feedback to the knowledge-base administrator.

[KB-019]

候选 / Candidates:
- KB-019 · BM25 12.744 · 78.5%
- KB-024 · BM25 7.896 · 69.3%
- KB-023 · BM25 6.934 · 66.5%

### E09 · zh · answered

- 输入 / Input: 如何给 VPN 和远程访问添加搜索同义词？
- 期望 / Expected: answer (KB-022)
- 引用 / Citations: KB-022
- BM25 / Coverage / Confidence: 51.232 / 69.9% / 93.6%

管理员在“搜索设置 → 同义词”添加等价词，例如“VPN”对应“远程访问”。保存后执行一次索引刷新即可生效。

[KB-022]

候选 / Candidates:
- KB-022 · BM25 51.232 · 93.6%
- KB-019 · BM25 11.628 · 76.9%
- KB-020 · BM25 3.523 · 39.3%

### E10 · en · answered

- 输入 / Input: How is data encrypted in transit and at rest?
- 期望 / Expected: answer (KB-025)
- 引用 / Citations: KB-025
- BM25 / Coverage / Confidence: 18.089 / 100.0% / 83.8%

The synthetic security policy specifies TLS 1.2 or later in transit and AES-256 at rest, with keys held by a separate key-management service.

[KB-025]

候选 / Candidates:
- KB-025 · BM25 18.089 · 83.8%
- KB-030 · BM25 2.785 · 44.3%
- KB-049 · BM25 2.310 · 39.8%

### E11 · zh · answered

- 输入 / Input: 这个原型会脱敏邮箱、手机号和身份证号吗？
- 期望 / Expected: answer (KB-028)
- 引用 / Citations: KB-028
- BM25 / Coverage / Confidence: 7.401 / 40.9% / 67.9%

原型在写入内存日志或生成回答前，用正则替换邮箱、中国大陆手机号和 18 位身份证号。该规则不能覆盖所有 PII，上线前仍需人工审核和专门检测。

[KB-028]

候选 / Candidates:
- KB-028 · BM25 7.401 · 67.9%
- KB-030 · BM25 6.386 · 64.6%
- KB-053 · BM25 2.148 · 38.0%

### E12 · en · answered

- 输入 / Input: How many times are failed webhook deliveries retried?
- 期望 / Expected: answer (KB-031)
- 引用 / Citations: KB-031
- BM25 / Coverage / Confidence: 23.092 / 78.0% / 86.8%

Deliveries retry 5 times at 1 minute, 5 minutes, 15 minutes, 1 hour, and 6 hours. Persistent failures enter a dead-letter queue for administrator replay.

[KB-031]

候选 / Candidates:
- KB-031 · BM25 23.092 · 86.8%
- KB-011 · BM25 5.879 · 62.7%
- KB-051 · BM25 2.770 · 44.2%

### E13 · zh · answered

- 输入 / Input: API 返回 429 时应该如何处理速率限制？
- 期望 / Expected: answer (KB-032)
- 引用 / Citations: KB-032
- BM25 / Coverage / Confidence: 30.334 / 57.7% / 89.7%

标准密钥限制为每分钟 600 次请求，突发上限为每分钟 60 次。触发限制时返回 429，请按 Retry-After 响应头退避重试。

[KB-032]

候选 / Candidates:
- KB-032 · BM25 30.334 · 89.7%
- KB-036 · BM25 9.404 · 72.9%
- KB-019 · BM25 6.477 · 64.9%

### E14 · en · answered

- 输入 / Input: What seat and document limits are included in the free trial?
- 期望 / Expected: answer (KB-037)
- 引用 / Citations: KB-037
- BM25 / Coverage / Confidence: 22.709 / 85.7% / 86.6%

The trial lasts 14 days with 5 seats and 100 documents, and no credit card is required. Data is retained for 30 days after the trial, then deleted.

[KB-037]

候选 / Candidates:
- KB-037 · BM25 22.709 · 86.6%
- KB-038 · BM25 5.511 · 61.2%
- KB-012 · BM25 4.631 · 57.0%

### E15 · zh · answered

- 输入 / Input: 存储用量超过上限后会上传吗？
- 期望 / Expected: answer (KB-040)
- 引用 / Citations: KB-040
- BM25 / Coverage / Confidence: 31.089 / 57.4% / 89.9%

用量达到 80% 和 100% 时会发送提醒。达到上限后暂停上传，直到升级套餐或删除不再需要的内容；不会自动收取超额费用。

[KB-040]

候选 / Candidates:
- KB-040 · BM25 31.089 · 89.9%
- KB-039 · BM25 14.585 · 80.6%
- KB-010 · BM25 7.465 · 68.1%

### E16 · en · answered

- 输入 / Input: How do I cancel automatic renewal before the billing period ends?
- 期望 / Expected: answer (KB-042)
- 引用 / Citations: KB-042
- BM25 / Coverage / Confidence: 22.125 / 81.0% / 86.3%

An administrator chooses Cancel renewal under Billing → Subscription. Service continues until the period ends. Export data before expiry; data is then kept for 30 days before deletion.

[KB-042]

候选 / Candidates:
- KB-042 · BM25 22.125 · 86.3%
- KB-054 · BM25 11.337 · 76.4%
- KB-012 · BM25 9.743 · 73.6%

### E17 · zh · answered

- 输入 / Input: 企业版 P1 故障的响应 SLA 目标是多少？
- 期望 / Expected: answer (KB-044)
- 引用 / Citations: KB-044
- BM25 / Coverage / Confidence: 34.471 / 71.6% / 90.8%

P1 指生产完全不可用或疑似数据丢失。企业版目标为 15 分钟响应、4 小时提供临时方案；这是合成目标，不是服务承诺。

[KB-044]

候选 / Candidates:
- KB-044 · BM25 34.471 · 90.8%
- KB-045 · BM25 17.570 · 83.4%
- KB-039 · BM25 10.057 · 74.2%

### E18 · en · answered

- 输入 / Input: Which formats can I use to export my knowledge base data?
- 期望 / Expected: answer (KB-049)
- 引用 / Citations: KB-049
- BM25 / Coverage / Confidence: 15.277 / 83.9% / 81.4%

JSON, CSV, original Markdown, and ZIP bundles are available. The export includes a manifest and checksum, and the download link expires after 24 hours.

[KB-049]

候选 / Candidates:
- KB-049 · BM25 15.277 · 81.4%
- KB-013 · BM25 12.210 · 77.7%
- KB-014 · BM25 5.875 · 62.7%

### E19 · zh · answered

- 输入 / Input: 删除工作区后，取消删除的期限是几天？
- 期望 / Expected: answer (KB-050)
- 引用 / Citations: KB-050
- BM25 / Coverage / Confidence: 16.645 / 25.0% / 82.6%

所有者提交删除后进入 14 天待删除状态，期间可以取消。确认后执行永久删除，备份中的副本在 30 天内清除。

[KB-050]

候选 / Candidates:
- KB-050 · BM25 16.645 · 82.6%
- KB-054 · BM25 8.852 · 71.7%
- KB-042 · BM25 6.200 · 58.6%

### E20 · en · answered

- 输入 / Input: What should I do before closing my account permanently?
- 期望 / Expected: answer (KB-054)
- 引用 / Citations: KB-054
- BM25 / Coverage / Confidence: 9.561 / 61.4% / 73.2%

Cancel renewal, export required data, transfer document ownership, and then request workspace deletion. The account enters a 14-day read-only recovery period before permanent deletion.

[KB-054]

候选 / Candidates:
- KB-054 · BM25 9.561 · 73.2%
- KB-004 · BM25 3.940 · 53.0%
- KB-003 · BM25 3.844 · 52.3%

### E21 · zh · refused

- 输入 / Input: 请用身份证号 [id] 帮我申请银行贷款。
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 6.006 / 10.3% / 60.1%

我没有找到足够可靠的知识库条目，因此不能猜测。请换一种说法，或使用“转人工”创建模拟工单。

候选 / Candidates:
- KB-007 · BM25 6.006 · 60.1%
- KB-010 · BM25 3.124 · 42.8%
- KB-043 · BM25 2.936 · 41.4%

### E22 · zh · refused

- 输入 / Input: 今天上海天气怎么样？
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 0.000 / 0.0% / 0.0%

我没有找到足够可靠的知识库条目，因此不能猜测。请换一种说法，或使用“转人工”创建模拟工单。

候选 / Candidates:
- KB-001 · BM25 0.000 · 0.0%
- KB-002 · BM25 0.000 · 0.0%
- KB-003 · BM25 0.000 · 0.0%

### E23 · en · refused

- 输入 / Input: Can you approve my purchase order and release the payment?
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 4.563 / 13.5% / 56.6%

I could not find a sufficiently reliable knowledge-base entry, so I will not guess. Try rephrasing your question or use “Human handoff” to create a mock ticket.

候选 / Candidates:
- KB-011 · BM25 4.563 · 56.6%
- KB-007 · BM25 4.174 · 54.4%
- KB-052 · BM25 3.587 · 50.6%

### E24 · zh · refused

- 输入 / Input: 帮我写一首关于星空的诗。
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 0.000 / 0.0% / 0.0%

我没有找到足够可靠的知识库条目，因此不能猜测。请换一种说法，或使用“转人工”创建模拟工单。

候选 / Candidates:
- KB-001 · BM25 0.000 · 0.0%
- KB-002 · BM25 0.000 · 0.0%
- KB-003 · BM25 0.000 · 0.0%

### E25 · en · refused

- 输入 / Input: Recommend a stock that will double in value next month.
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 3.605 / 14.6% / 50.7%

I could not find a sufficiently reliable knowledge-base entry, so I will not guess. Try rephrasing your question or use “Human handoff” to create a mock ticket.

候选 / Candidates:
- KB-034 · BM25 3.605 · 50.7%
- KB-041 · BM25 3.159 · 43.7%
- KB-009 · BM25 2.374 · 37.3%

### E26 · zh · refused

- 输入 / Input: 我的猫咪叫什么名字？
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 0.000 / 0.0% / 0.0%

我没有找到足够可靠的知识库条目，因此不能猜测。请换一种说法，或使用“转人工”创建模拟工单。

候选 / Candidates:
- KB-001 · BM25 0.000 · 0.0%
- KB-002 · BM25 0.000 · 0.0%
- KB-003 · BM25 0.000 · 0.0%

### E27 · en · refused

- 输入 / Input: Write a Python web scraper for a social media website.
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 0.000 / 0.0% / 0.0%

I could not find a sufficiently reliable knowledge-base entry, so I will not guess. Try rephrasing your question or use “Human handoff” to create a mock ticket.

候选 / Candidates:
- KB-001 · BM25 0.000 · 0.0%
- KB-002 · BM25 0.000 · 0.0%
- KB-003 · BM25 0.000 · 0.0%

### E28 · zh · refused

- 输入 / Input: 公司食堂今天午餐供应什么？
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 0.000 / 0.0% / 0.0%

我没有找到足够可靠的知识库条目，因此不能猜测。请换一种说法，或使用“转人工”创建模拟工单。

候选 / Candidates:
- KB-001 · BM25 0.000 · 0.0%
- KB-002 · BM25 0.000 · 0.0%
- KB-003 · BM25 0.000 · 0.0%

### E29 · en · refused

- 输入 / Input: Translate this legal contract into French and sign it for me.
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 5.935 / 12.9% / 62.9%

I could not find a sufficiently reliable knowledge-base entry, so I will not guess. Try rephrasing your question or use “Human handoff” to create a mock ticket.

候选 / Candidates:
- KB-052 · BM25 5.935 · 62.9%
- KB-053 · BM25 5.168 · 59.6%
- KB-013 · BM25 3.623 · 50.9%

### E30 · zh · refused

- 输入 / Input: 预订明天从北京到东京的头等舱机票。
- 期望 / Expected: refuse
- 引用 / Citations: none (refusal)
- BM25 / Coverage / Confidence: 0.000 / 0.0% / 0.0%

我没有找到足够可靠的知识库条目，因此不能猜测。请换一种说法，或使用“转人工”创建模拟工单。

候选 / Candidates:
- KB-001 · BM25 0.000 · 0.0%
- KB-002 · BM25 0.000 · 0.0%
- KB-003 · BM25 0.000 · 0.0%

## 口径 / Metric Definitions

- **Accuracy**: 可答题命中期望 FAQ，或范围外题正确拒答，占总题数比例。
- **Hallucination rate**: 已回答中，引用无效或回答文本不等于对应 FAQ 脱敏模板的比例。
- **Uncited-answer rate**: 已回答中，没有有效 FAQ 引用的比例。
- **Refusal correctness**: 范围外题中被拒答的比例。
- **PII leak count**: 回答、内存日志和结果对象中检测到的受支持 PII 模式总数；输入以脱敏形式保存。

**Accuracy**: correct FAQ hit for answerable cases, or correct refusal for out-of-scope cases, divided by all cases.
**Hallucination rate**: answered cases with an invalid citation or text differing from the cited FAQ's masked template, divided by answered cases.
**Uncited-answer rate**: answered cases without a valid FAQ citation, divided by answered cases.
**Refusal correctness**: out-of-scope cases correctly refused, divided by out-of-scope cases.
**PII leak count**: supported PII patterns found in answers, in-memory log entries, and serialized result objects; saved inputs are masked.
