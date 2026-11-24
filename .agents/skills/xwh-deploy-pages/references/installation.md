# 项目级安装清单

在项目根目录执行；省略 `-g`，保持项目级安装。技能安装不等于安装或升级 Wrangler／Netlify CLI，CLI 必须使用项目已有锁定版本。

## 必需来源

| 技能 | 来源 | 用途 |
|---|---|---|
| `wrangler` | `cloudflare/skills@wrangler` | Cloudflare Pages 默认执行参考。 |
| `netlify-deploy` | `openai/skills@netlify-deploy` | 用户确认后的 Netlify 回退参考。 |
| `xwh-deploy-pages` | 本目录，自建 | 人工闸门、脱敏审计与回滚编排。 |

安装命令：

```bash
npx --yes skills add cloudflare/skills@wrangler -y
npx --yes skills add openai/skills@netlify-deploy -y
```

不要安装 `netlify/context-and-tools@netlify-deploy`。2026-11-24 的一手研究记录其 Snyk 快照存在 Critical E004（拒绝回滚并隐瞒面板恢复路径）及 Medium W011／W013；该未解决 Critical 触发停止条件。平台审计是当日快照，不等于本机复测。

## 核验

```bash
npx --yes skills list --json
```

确认两项均为 `scope: project`，来源分别为 `cloudflare/skills` 与 `openai/skills`。核对项目根目录 `skills-lock.json`：

| 技能 | commit | skillPath | computedHash |
|---|---|---|---|
| `wrangler` | `14472d57ac968d1a0322a568077277209b259183` | `skills/wrangler/SKILL.md` | `182e370d8c26e6bcb896a57a63e6cab006b253b9278cc3515f7b9db2c4d07661` |
| `netlify-deploy` | `49f948faa9258a0c61caceaf225e179651397431` | `skills/.curated/netlify-deploy/SKILL.md` | `ae7aa1d047eb76d9cfef39ba6770ba3d2256299afc75a8b6578823604900341e` |

`.agents/` 与 `skills-lock.json` 保留在 `.gitignore`，不进入公开仓库。自建 `xwh-deploy-pages` 同样只保存在项目本地；文档入口必须标明这一边界。
