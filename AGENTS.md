# AGENTS.md — XWH AI Showcase

## 定位

公开双语作品集：企业系统打通、数据自动化、AI 客服。全部使用合成数据，不连接真实客户或生产系统。

## 运行与验证

```bash
npm run build:pages
npm run scan
npm run scan:public
npm run test:price
npm run test:ai-support
npm run eval:ai-support
npm run test:legacy
npm run test:legacy-preview
```

- Node ≥ 20；.NET SDK 10。
- 本地官网：`python3 -m http.server 8770 --directory .`
- Pages 输出目录：`public/`，由 `scripts/build-pages.mjs` 生成；不要直接部署仓库根目录。

## 目录约定

- `index.html` + `assets/`：公司官网。
- `demos/legacy-bridge/`：.NET API/SQLite 主模式＋公网浏览器预览模式。
- `demos/price-console/`、`demos/ai-support/`：纯静态离线 demo。
- `docs/`：能力、服务、流程、SOP、安全与生产状态；公网不部署 docs，官网链接 GitHub。
- `.agents/skills/`、`skills-lock.json`：项目级 Cloudflare skills，已 gitignore，不进公开仓。

## 当前状态（2026-11-24）

- 生产地址：https://xwh-ai-showcase.pages.dev/
- 生产部署 ID：`c8b600bd-3314-4b49-839e-1a1e070ab605`，部署源提交 `e18109f`。
- 全球桌面/390px 浏览器验收通过；中国大陆三网两地点硬闸未过，目标已暂停。
- 权威状态见 `docs/production-status.md`；后续 docs 提交不会自动改变当前生产部署。

## 边界

- 不虚构客户、资质、生产效果或“国内三网稳定”。
- Legacy 公网只有浏览器预览，无服务端审计/持久化；AI 转人工只创建 MOCK 工单。
- 改价格/能力/部署状态前先核对 `docs/` 与线上证据。
- 部署需用户授权；不得把 Cloudflare token、真实数据或私有路径写入仓库。
