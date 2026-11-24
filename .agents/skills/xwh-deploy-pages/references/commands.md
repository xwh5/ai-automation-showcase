# 命令与只读检查参考

以下模板只在对应闸门获批后执行。先读取项目本地 CLI 的 `pages deploy --help` 或 `deploy --help`；参数变化时以本地帮助和当前官方文档为准。缺少项目本地 CLI 时停止并单独提出依赖变更，不用未固定的 `npx` 下载代替。

## 变量

- `OUT`：已验收的构建输出目录。
- `SHA`：已记录的完整提交 hash。
- `TAG`：唯一预览标识。
- `CF_PROJECT`、`CF_PRODUCTION_BRANCH`：已确认的 Pages 项目与生产分支。
- `NF_SITE_ID`：用户预置的 Netlify site id。
- `PROJECT_WRANGLER`、`PROJECT_NETLIFY`：项目本地 CLI 可执行文件。
- 凭据只从继承环境读取，例如 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`NETLIFY_AUTH_TOKEN`。不把值展开到命令参数或日志。

## Cloudflare Pages — 默认

预览：

```bash
"$PROJECT_WRANGLER" pages deploy "$OUT" \
  --project-name "$CF_PROJECT" \
  --branch "preview/$TAG" \
  --commit-hash "$SHA"
```

生产分支发布：

```bash
"$PROJECT_WRANGLER" pages deploy "$OUT" \
  --project-name "$CF_PROJECT" \
  --branch "$CF_PRODUCTION_BRANCH" \
  --commit-hash "$SHA"
```

Direct Upload 项目不能随后切换为 Git 集成。首次创建项目、修改生产分支或切换模式不属于本技能的自动操作，须另批确认。

## Netlify — 仅用户确认后回退

预览：

```bash
"$PROJECT_NETLIFY" deploy \
  --dir "$OUT" \
  --site "$NF_SITE_ID" \
  --no-build \
  --json
```

生产：

```bash
"$PROJECT_NETLIFY" deploy \
  --dir "$OUT" \
  --site "$NF_SITE_ID" \
  --no-build \
  --prod \
  --json
```

本技能固定“先显式构建，再 `--no-build`”，消除 CLI 默认构建歧义。不自动执行 `netlify init`、`netlify link` 或建站。

## 自定义域名 — 只读

```bash
dig +short "$CUSTOM_DOMAIN" A
dig +short "$CUSTOM_DOMAIN" CNAME
curl --silent --show-error --output /dev/null \
  --write-out '%{http_code} %{ssl_verify_result}\n' \
  "https://$CUSTOM_DOMAIN/"
```

同时只读确认域名已关联到目标 Pages 项目或 Netlify site。未关联、DNS 不符或证书未就绪时记录失败并停止；不自动修改记录或切换域名。

## 回滚端点

执行前只读确认目标存在、成功且为生产部署，并取得单独批准。

- Cloudflare Pages：`POST /client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}/rollback`，需要 Pages Write 权限。
- Netlify：`POST /api/v1/sites/{site_id}/deploys/{deploy_id}/restore`。

凭据通过受保护环境或秘密存储提供给客户端，不在示例中展开，也不写入审计。回滚后必须重新验收并记录新的生产 deployment id。

## 官方参考

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare Pages rollback](https://developers.cloudflare.com/pages/configuration/rollbacks/)
- [Netlify CLI deploy](https://cli.netlify.com/commands/deploy/)

命令与限额最后核对于 2026-11-24；执行时仍需复核本地 CLI 帮助。
