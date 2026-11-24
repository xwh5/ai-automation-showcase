# XWH AI Cloudflare Pages 部署与回滚
# XWH AI Cloudflare Pages Deployment and Rollback

版本 / Version: 1.0

## 适用范围 / Scope

适用于公开静态站点与少量 Pages Functions 演示。默认使用 Cloudflare Pages 免费套餐提供的 `<project-name>.pages.dev` 子域名。
This guide covers public static sites and small Pages Functions demos, using the `<project-name>.pages.dev` subdomain available with Cloudflare Pages by default.

免费子域名适合公开演示，不构成生产可用性、国内可达性、合规或业务连续性保证。
A free subdomain is suitable for public demonstrations; it is not a production-availability, mainland-China reachability, compliance, or business-continuity guarantee.

## 平台事实与操作承诺 / Platform facts and operating commitments

### 平台事实 / Platform facts

依据 Cloudflare 官方文档：
According to official Cloudflare documentation:

- GitHub 集成可在推送代码到已连接分支时自动构建和部署。
  GitHub integration can automatically build and deploy when code is pushed to a connected branch.
- 生产分支用于生产部署，其他分支可用于预览部署。
  The production branch is used for production deployment; other branches can create preview deployments.
- Pages Functions 在 Cloudflare 网络上运行，使用 Workers 运行时能力；它不是完整的常驻 Node.js 服务器。
  Pages Functions runs on Cloudflare's network with Workers runtime capabilities; it is not a full always-on Node.js server.
- 成功的生产部署可用于 Pages 回滚；预览部署不是有效回滚目标。
  Successful production deployments can be used for Pages rollback; preview deployments are not valid rollback targets.

官方参考：[Git 集成](https://developers.cloudflare.com/pages/get-started/git-integration/)、[Pages Functions](https://developers.cloudflare.com/pages/functions/)、[回滚](https://developers.cloudflare.com/pages/configuration/rollbacks/)、[限制](https://developers.cloudflare.com/pages/platform/limits/)。
Official references: [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [Pages Functions](https://developers.cloudflare.com/pages/functions/), [Rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/), [Limits](https://developers.cloudflare.com/pages/platform/limits/).

### 操作承诺 / Operating commitments

- 不在客户端代码、静态资源或构建日志中放置秘密值。
  No secret values are placed in client code, static assets, or build logs.
- 不把真实客户数据、凭据或私有系统信息部署到公开站点。
  No real customer data, credentials, or private system information is deployed to a public site.
- 未通过三网可达性硬闸，不正式发布、不宣传“国内可访问”。
  Without passing the three-network reachability hard gate, do not officially launch or advertise mainland-China availability.
- 每次发布记录版本、部署标识、测试结果和回滚目标。
  Each release records its version, deployment identifier, test results, and rollback target.

## 一、准备 / 1. Preparation

- [ ] GitHub 仓库已存在，公开站点源码不含凭据或真实客户数据。
  [ ] A GitHub repository exists; public-site source contains no credentials or real customer data.
- [ ] 至少一名负责人控制 Cloudflare 账户与 GitHub 仓库。
  [ ] At least one owner controls the Cloudflare account and GitHub repository.
- [ ] Cloudflare 账户启用多因素认证。
  [ ] Cloudflare account MFA is enabled.
- [ ] GitHub 账户启用多因素认证。
  [ ] GitHub account MFA is enabled.
- [ ] 明确生产分支，通常为 `main`。
  [ ] The production branch is defined, usually `main`.
- [ ] 本地构建与测试已通过，并记录了提交标识。
  [ ] Local build and tests pass, with the commit identifier recorded.
- [ ] 联系邮箱、案例与截图只使用公开、合成或明确授权内容。
  [ ] Contact details, cases, and screenshots use only public, synthetic, or explicitly authorized content.

不要在部署文档、工单或聊天中粘贴 Cloudflare API Token、GitHub Token、账户验证码或生产密钥。
Do not paste Cloudflare API tokens, GitHub tokens, account verification codes, or production keys into deployment documents, tickets, or chat.

## 二、连接 GitHub 自动部署 / 2. Connect GitHub for automatic deployment

以下为控制台操作路径；界面文案可能调整，以当前官方文档为准。
The following describes dashboard steps; labels may change, so check current official documentation.

1. 登录 Cloudflare，进入 **Workers & Pages**。
   Sign in to Cloudflare and open **Workers & Pages**.
2. 选择 **Create application → Pages → Connect to Git**。
   Select **Create application → Pages → Connect to Git**.
3. 选择 **GitHub**，按提示认证并只授权必要仓库。
   Choose **GitHub**, authenticate, and authorize only the necessary repository.
4. 选择公开站点仓库并确认安装与授权。
   Select the public-site repository and confirm installation and authorization.
5. 设置项目名称。项目名称用于生成免费主机名，例如 `xwh-demo.pages.dev`。
   Set the project name. It generates the free hostname, for example `xwh-demo.pages.dev`.
6. 选择生产分支，例如 `main`；其他分支作为预览环境。
   Select the production branch, such as `main`; other branches act as preview environments.
7. 配置构建。本仓库固定使用以下设置：

| 站点类型 / Site type | 构建命令 / Build command | 输出目录 / Output directory |
|---|---|---|
| 本 XWH AI Showcase 仓库 / This XWH AI Showcase repository | `npm run build:pages` | `public` |
| 使用 Vite、Astro、React 等框架的其他项目 / Other framework projects such as Vite, Astro, or React | 使用项目脚本或框架预设 / Use the project script or framework preset | 使用实际输出目录，例如 `dist` / Use the actual output directory, such as `dist` |
| 单仓库多站点 / Multi-site monorepo | 使用该站点命令 / Use the site-specific command | 使用该站点输出目录，并在高级设置中指定根目录 / Use its output directory and set the root directory under advanced settings |

`npm run build:pages` 会重新生成 `public/`；仓库根目录、`.` 或源码目录不再是 Pages 输出目录。`wrangler.toml` 中的 `pages_build_output_dir = "public"` 应与 GitHub 自动部署设置保持一致。
`npm run build:pages` regenerates `public/`; the repository root, `.`, and source directories are no longer Pages output directories. Keep `pages_build_output_dir = "public"` in `wrangler.toml` consistent with the GitHub automatic-deployment settings.

输出目录只能包含计划公开的文件。构建脚本按明确清单生成 `public/`，其中可能有意包含公开文档和合成演示资源；不要手动向 `public/` 添加凭据、真实客户数据、配置或运行数据，也不要把输出改回整个仓库根目录。发布前检查生成目录与构建清单，确保只有获准公开的内容进入部署。
The output directory may contain only files intended for publication. The build script generates `public/` from an explicit list, which may intentionally include public documentation and synthetic demo assets; do not manually add credentials, real customer data, configuration, or runtime data to `public/`, and do not switch the output back to the entire repository root. Inspect the generated directory and build list before release so only approved public content is deployed.

8. 环境变量只添加构建所需且可公开的值；秘密值不得加入面向浏览器的变量。
   Add only build-required, public-safe environment variables; secrets must not be added to browser-exposed variables.
9. 选择 **Save and Deploy**，等待构建日志完成。
   Select **Save and Deploy** and wait for build logs to complete.
10. 记录生产 URL、生产分支、提交标识和首次部署标识。
    Record the production URL, production branch, commit identifier, and first deployment identifier.

### 自动部署行为 / Automatic deployment behavior

- 推送到生产分支会触发生产构建与部署。
  Pushing to the production branch triggers a production build and deployment.
- 其他分支可触发预览部署；预览 URL 不是生产地址，也不应用作正式宣传链接。
  Other branches can trigger preview deployments; preview URLs are not production addresses or official promotional links.
- 构建失败时检查 Pages 构建日志、分支、构建命令、输出目录和依赖锁文件。
  On build failure, inspect Pages build logs, branch, build command, output directory, and dependency lockfiles.
- 不要在问题未定位时反复推送；先修复并记录原因。
  Do not repeatedly push before diagnosing the issue; fix it and record the cause.

Cloudflare 官方说明：使用 Git 集成的项目不能随后切换为 Direct Upload；如确需改变部署方式，应另做迁移计划。
Cloudflare states that a Git-integrated project cannot later switch to Direct Upload; changing deployment methods requires a separate migration plan.

## 三、Pages Functions 边界 / 3. Pages Functions boundaries

### 适合 / Suitable uses

- 小型表单接收与校验。 / Small form intake and validation.
- 简单鉴权中间件或请求头处理。 / Simple authentication middleware or header handling.
- 对已批准 API 的服务端代理，密钥只保存在服务端秘密配置中。 / Server-side proxy to an approved API, with keys stored only in server-side secret configuration.
- 合成演示所需的轻量动态路由。 / Lightweight dynamic routes needed for synthetic demos.

### 不适合 / Unsuitable uses

- 常驻后台进程、无限循环任务或依赖本地持久磁盘的服务。
  Always-on daemons, infinite-loop jobs, or services that depend on persistent local disk.
- 把完整传统 Node.js 应用、任意原生依赖或未验证运行时能力直接搬入。
  Directly moving a complete traditional Node.js app, arbitrary native dependencies, or unverified runtime capabilities.
- 无边界数据库写入、消息队列或高并发核心账务。
  Unbounded database writes, message queues, or high-concurrency core accounting.
- 在公开 Function 中处理未授权的真实客户数据。
  Handling unauthorized real customer data in a public Function.

### 必须控制 / Required controls

- Functions 使用 Workers 运行时和可用的 Node.js API 子集；上线前按当前兼容性文档验证。
  Functions use the Workers runtime and an available subset of Node.js APIs; validate against current compatibility documentation before launch.
- 动态路由、超时、CPU、请求量和存储受平台及套餐限制；不要假设本地测试结果等于生产容量。
  Dynamic routes, timeouts, CPU, request volume, and storage are subject to platform and plan limits; local tests do not establish production capacity.
- 需要持久化时使用明确批准并配置的绑定或外部服务，例如 KV、D1、R2 或 Durable Objects；同时审查费用、地区、许可和删除规则。
  Persistence uses an explicitly approved and configured binding or external service such as KV, D1, R2, or Durable Objects, with fees, regions, licenses, and deletion reviewed.
- 生产与预览环境的绑定和秘密值分开；不要把生产密钥复制到预览。
  Production and preview bindings and secrets are separate; production keys are not copied to preview.
- 服务端秘密不得下发到响应、源码、浏览器 bundle 或日志。
  Server-side secrets are never returned in responses, source, browser bundles, or logs.
- 每个公开端点设置输入校验、方法限制、超时、错误分类和基本滥用防护。
  Every public endpoint has input validation, method restrictions, timeouts, error classification, and basic abuse protection.
- 不把 Pages Functions 当作默认备份、审计系统或合规数据库。
  Pages Functions is not the default backup, audit system, or compliance database.
- 前端框架中以 `VITE_`、`NEXT_PUBLIC_` 等前缀暴露的变量应视为公开值，不能放密钥。
  Variables exposed through browser prefixes such as `VITE_` or `NEXT_PUBLIC_` are treated as public and must not contain secrets.

## 四、发布前检查 / 4. Pre-launch checklist

- [ ] 构建与自动化测试通过，版本与提交标识已记录。 / Build and automated tests pass; version and commit identifier are recorded.
- [ ] 公开资源中无真实客户数据、凭据、私有路径或内部系统细节。 / Public assets contain no real customer data, credentials, private paths, or internal system details.
- [ ] 页面使用 HTTPS，资源 URL 不产生混合内容错误。 / The page uses HTTPS without mixed-content errors.
- [ ] 中英切换、导航、文档链接、下载与关键按钮可用。 / Language switch, navigation, document links, downloads, and key buttons work.
- [ ] 如使用 Functions，端点、秘密配置、错误处理、超时与滥用防护已验证。 / If Functions are used, endpoints, secrets, errors, timeouts, and abuse controls are tested.
- [ ] 404、空状态、网络失败和人工接管提示可见。 / 404, empty states, network failures, and human-takeover messages are visible.
- [ ] 至少一个已知良好的生产部署被记录为回滚目标。 / At least one known-good production deployment is recorded as a rollback target.
- [ ] 三网可达性硬闸通过并保存记录。 / The three-network reachability hard gate passes and records are saved.

## 五、三网可达性硬闸 / 5. Three-network reachability hard gate

“三网”指中国电信、中国联通、中国移动。这里不预设任一运营商或地区的可达性结论；只有实际测试记录可以作为发布证据。
“Three networks” means China Telecom, China Unicom, and China Mobile. No reachability conclusion is assumed for any carrier or region; only actual test records can support a release decision.

### 测试方法 / Test method

对每一运营商，至少使用一台对应运营商的真实移动网络设备或网络，在两个不同地点各测试一次：
For each carrier, use at least one real device or network on that carrier and test once in each of two different locations:

- 不使用 VPN、代理、远程桌面或自定义 DNS。
  Do not use a VPN, proxy, remote desktop, or custom DNS.
- 不使用仅位于单一海外节点的在线测速工具作为通过依据。
  Do not use an overseas-only online testing service as the pass basis.
- 记录时间使用 **Asia/Shanghai**，并写明运营商、城市/区域、设备、浏览器和连接类型。
  Record time in **Asia/Shanghai** and identify carrier, city/region, device, browser, and connection type.
- 首次访问与再次访问都执行，避免把单次缓存命中当作稳定结果。
  Test both first and repeat visits so a single cache hit is not treated as stable evidence.

### 必测项目 / Required checks

| 检查 / Check | 通过标准 / Pass criterion |
|---|---|
| DNS / DNS | 免费子域名在测试网络解析到预期 Pages 服务，无持续解析失败。 / The free subdomain resolves to the expected Pages service without persistent failure. |
| HTTPS / HTTPS | 证书链与主机名有效，无证书错误或持续连接重置。 / Certificate chain and hostname are valid, without certificate errors or persistent resets. |
| 首页 / Homepage | 返回预期内容与成功状态，不是拦截页、错误页或空白页。 / Expected content and success status appear, not a block page, error page, or blank page. |
| 静态资源 / Static assets | 关键 CSS、JavaScript、字体和图片加载完成，无持续失败。 / Critical CSS, JavaScript, fonts, and images load without persistent failures. |
| 关键交互 / Key interactions | 中英切换、导航、文档链接、下载及公开演示的核心静态交互通过。 / Language switch, navigation, document links, downloads, and core static demo interactions pass. |
| Functions，如启用 / Functions, if enabled | 从三网分别调用公开端点，验证状态、超时、错误提示和 CORS；不把第三方 API 故障误判为 Pages 故障。 / Call public endpoints from each network and verify status, timeout, errors, and CORS; distinguish third-party API failures from Pages failures. |
| 控制台 / Console | 无因资源、混合内容或脚本造成的持续页面错误。 / No persistent page errors caused by assets, mixed content, or scripts. |

### 记录模板 / Record template

| 运营商 / Carrier | 地点 / Location | 时间 / Time | DNS | HTTPS | 首页 / Homepage | 资源 / Assets | 交互 / Interaction | Functions | 结果 / Result | 证据 / Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 中国电信 / China Telecom | `[区域 A]` | `[Asia/Shanghai]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail/n-a]` | `[pass/fail]` | `[报告或截图]` |
| 中国电信 / China Telecom | `[区域 B]` | `[Asia/Shanghai]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail/n-a]` | `[pass/fail]` | `[报告或截图]` |
| 中国联通 / China Unicom | `[区域 A]` | `[Asia/Shanghai]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail/n-a]` | `[pass/fail]` | `[报告或截图]` |
| 中国联通 / China Unicom | `[区域 B]` | `[Asia/Shanghai]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail/n-a]` | `[pass/fail]` | `[报告或截图]` |
| 中国移动 / China Mobile | `[区域 A]` | `[Asia/Shanghai]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail/n-a]` | `[pass/fail]` | `[报告或截图]` |
| 中国移动 / China Mobile | `[区域 B]` | `[Asia/Shanghai]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail]` | `[pass/fail/n-a]` | `[pass/fail]` | `[报告或截图]` |

### 硬闸规则 / Hard-gate rules

- **全部通过：** 三个运营商、两个地点、全部必测项目通过，才可正式发布。
  **All pass:** Official launch requires both locations on all three carriers and every required check to pass.
- **任一失败：** 不正式发布，不写“三网可访问”；记录失败现象，判断是 DNS、TLS、资源、脚本还是 Functions 问题。
  **Any failure:** Do not officially launch or claim three-network availability; record symptoms and identify DNS, TLS, asset, script, or Functions causes.
- **修复后重测：** 至少重测失败运营商；若更改主机名、DNS、证书、CDN、资源域名或 Functions，三个运营商全部重测。
  **Retest after repair:** Retest at least the failed carrier; if hostname, DNS, certificate, CDN, asset domains, or Functions change, retest all three carriers.
- **不能豁免：** 不能用截图、历史结果或“大部分用户可访问”代替当前版本硬闸。
  **No waiver:** Screenshots, historical results, or “most users can access it” do not replace the current-version gate.

通过记录只说明测试时间、地点和版本下的结果，不保证未来所有地区、运营商或时间始终可达。
A passing record describes the tested version, time, and locations only; it does not guarantee future reachability everywhere or at all times.

## 六、回滚 / 6. Rollback

### 发布前准备 / Before release

记录以下信息：
Record the following:

- 当前生产提交标识与部署标识。 / Current production commit identifier and deployment identifier.
- 上一已知良好生产部署标识。 / Previous known-good production deployment identifier.
- 关键静态资源清单或哈希。 / Critical asset list or hashes.
- Functions 配置、绑定和秘密配置的版本记录；秘密值本身不写入记录。 / Version record for Functions configuration, bindings, and secret configuration; secret values are not recorded.
- 外部数据库或存储是否有迁移；有迁移时必须提前设计向后兼容或恢复方案。 / Whether external databases or storage have migrations; backward compatibility or recovery must be planned first.

### Pages 控制台回滚 / Pages dashboard rollback

1. 打开 Pages 项目，进入 **Deployments**。
   Open the Pages project and go to **Deployments**.
2. 在 **All deployments** 中选择目标生产部署。
   Select the target production deployment in **All deployments**.
3. 打开该部署的三点操作菜单，选择 **Rollback to this deployment**。
   Open the deployment's three-dot menu and choose **Rollback to this deployment**.
4. 在确认窗口核对部署标识、提交和时间，再确认。
   Verify deployment identifier, commit, and time in the confirmation window, then confirm.
5. 记录操作时间、操作人、目标和回滚后生产地址。
   Record operation time, operator, target, and production address after rollback.
6. 按同一硬闸检查 DNS、HTTPS、首页、资源和关键交互，并保存结果。
   Recheck DNS, HTTPS, homepage, assets, and key interactions with the same hard gate and save results.

Cloudflare 官方规则：目标必须是成功构建且未删除的**生产部署**；预览部署不能作为回滚目标。已删除部署也不能回滚。部署保留受平台规则限制，因此应定期确认回滚目标仍存在。
Cloudflare's rule: the target must be a successfully built, non-deleted **production deployment**; preview deployments are not valid targets. Deleted deployments cannot be restored through rollback. Retention follows platform rules, so periodically confirm that rollback targets still exist.

### 回滚的边界 / Rollback boundaries

- Pages 回滚改变所部署的站点版本，不自动回滚 GitHub 分支、外部数据库、第三方设置、DNS 或秘密值。
  Pages rollback changes the deployed site version; it does not automatically roll back the GitHub branch, external databases, third-party settings, DNS, or secrets.
- 回滚后应同步处理 Git：通过 revert 或修复提交让源码与恢复版本一致，避免下一次自动部署重新发布坏版本。
  After rollback, align Git using a revert or fix commit so automatic deployment does not republish the bad version.
- 必要时暂停生产分支自动部署，先确认恢复方案；不要未记录就删除项目。
  If needed, pause production-branch automatic deployment while confirming recovery; do not delete the project without a record.
- 数据库或存储迁移不在 Pages 回滚范围内；必须按单独的备份与恢复手册执行。
  Database or storage migrations are outside Pages rollback and require a separate backup and recovery runbook.
- 如果事故涉及数据或密钥，先按 [安全与数据规范](security-and-data.md#事故处理--incident-handling) 控制，再恢复站点。
  If an incident involves data or keys, contain it under the [security and data policy](security-and-data.md#事故处理--incident-handling) before restoring the site.

## 七、删除或迁移 / 7. Removal or migration

- 删除 Pages 项目前确认域名、数据、日志、Functions、绑定和第三方账户的处理方式。
  Before deleting a Pages project, confirm handling of domains, data, logs, Functions, bindings, and third-party accounts.
- 删除 GitHub 授权前先撤销 Cloudflare 连接，避免留下未知自动部署配置。
  Revoke the Cloudflare connection before removing GitHub authorization to avoid unknown auto-deployment configuration.
- 公开站点不得成为真实客户数据的唯一存储位置。
  A public site must not be the sole storage location for real customer data.
- 项目结束后按 [安全与数据规范](security-and-data.md#删除与保留--deletion-and-retention) 删除工作副本、临时文件、日志和备份。
  After project end, delete working copies, temporary files, logs, and backups under the [security and data policy](security-and-data.md#删除与保留--deletion-and-retention).

## 事实与承诺 / Facts and commitments

**事实 / Facts:** Cloudflare 的部署、Functions 与回滚能力以官方平台文档为准，平台限制和界面可能变化。
**Facts:** Cloudflare deployment, Functions, and rollback capabilities follow official platform documentation; limits and interfaces may change.

**承诺 / Commitments:** 不承诺国内三网可达、全天候在线或长期零成本；只承诺按本文件记录测试、设置硬闸并在失败时停止发布或回滚。
**Commitments:** No promise is made for three-network mainland reachability, 24/7 availability, or permanent free hosting; the commitment is to record tests, enforce the hard gate, and stop release or roll back on failure.

## 官方参考 / Official references

- [Cloudflare Pages Git 集成 / Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Cloudflare Pages 回滚 / Rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
- [Cloudflare Pages 限制 / Limits](https://developers.cloudflare.com/pages/platform/limits/)

## 相关文档 / Related documents

- [交付 SOP / Delivery SOP](delivery-sop.md)
- [安全与数据规范 / Security and data policy](security-and-data.md)
- [演示脚本 / Demo scripts](demo-scripts.md)
- [常见问题 / FAQ](faq.md)
