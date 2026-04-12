# 互动阅读系统

这是一个基于 `Vite + React + Vercel Functions + Neon Postgres` 的互动阅读系统，适合手机、电脑和课堂大屏使用。

## 当前能力

- 学生端：登录、沉浸式阅读、词汇/拆句/阅读/优句任务、学习记录与收藏
- 教师端：口令登录、文章管理、版本化保存、班级统计、AI 一键重构
- 后端：部署在 Vercel，数据存放在 Neon

## 本地开发

只启动前端：

```bash
npm install
npm run dev
```

完整调试前后端：

```bash
npm install
npm run dev:fullstack
```

`dev:fullstack` 会通过 `vercel dev` 同时运行前端和 `api/` 下的函数。

## 数据库初始化

在 Neon 的 SQL Editor 中执行 [`db/neon-schema.sql`](./db/neon-schema.sql)。

## 环境变量

复制 `.env.example` 为 `.env.local`，至少填写：

- `DATABASE_URL`
- `TEACHER_CODE`
- `TEACHER_SESSION_SECRET`

若要启用教师端 AI 一键重构，再填写：

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`

## Vercel 部署

推荐流程：

1. 将项目推到 GitHub
2. 在 Vercel 中导入仓库
3. 在 Vercel 项目环境变量中配置 `.env.example` 中的值
4. 在 Neon 执行 `db/neon-schema.sql`
5. 触发部署

项目已包含：

- `api/` 目录下的 Vercel Functions
- `vercel.json` 中的 SPA 回退规则
- 适用于 BrowserRouter 的前端路由配置

## Cloudflare 域名

若域名解析放在 Cloudflare：

1. 先在 Vercel 项目里添加你的自定义域名
2. 按 Vercel 提示在 Cloudflare 增加对应的 `CNAME` 或 `A` 记录
3. 等待 Vercel 验证通过并签发证书

## 内容读取策略

- 优先读取 Neon 中已发布文章
- 本地开发或后端不可用时，自动回退到 `public/content/*.json`

