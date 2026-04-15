# 计划：积分榜 + 跟读挑战持久化/目录入口/移动端优化

## Summary
- 增加学生侧积分榜：班内榜、校内榜；同时支持“本月榜”和“历史总榜”，积分按学习提交得分累计，展示真实姓名。
- 升级跟读挑战：
  - 跟读结果持久保存（云端 attempts 表为准，本地缓存兜底）。
  - 跟读列表每句显示“已完成”和该句“最高分”摘要，点开可直接查看历史最佳的评分详情。
  - 每句提供“真人原音 + 系统朗读”两个听音入口，先听再跟读。
- 顶部导航新增“跟读挑战”“积分榜”一级入口；跟读挑战入口先进入目录选择（册别/单元/文章），选定后再进入跟读界面。
- 针对手机竖屏优化：顶部导航、跟读挑战页、评分卡、积分榜页。

## Current State Analysis（基于代码现状）
- 学生会话：`getSession()` 仅包含 `className/studentName/classId/userId`，无“学校/机构代码”字段。[session.ts](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/features/auth/session.ts)
- 登录页已有“学校/机构代码(选填)”输入，但未接入状态与提交逻辑。[login.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/routes/login.tsx)
- 跟读挑战页已独立：`/a/:articleId/pronunciation`。当前仅能“录音评测→保存一次 attempt”，没有读取历史最高分、没有“已完成/最高分”摘要、没有听音入口。[pronunciation.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/routes/pronunciation.tsx)
- attempts：
  - 前端本地保存：`saveAttempt()` 将 attempt 写入 localStorage，并 POST `/api/attempts`；失败则仅本地保留。[attempts.ts](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/features/storage/attempts.ts)
  - 后端 `/api/attempts` 仅支持 POST，且会忽略前端传入的 attempt.id，服务端自己生成随机 id（不利于“拉取云端 attempts 回填本地”去重/合并）。[attempts.js](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/api/attempts.js)
- 顶部导航：在 `AppLayout` 内，当前无“跟读挑战/积分榜”一级入口，且移动端按钮较多，存在竖屏拥挤风险。[AppLayout.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/layout/AppLayout.tsx)

## Assumptions & Decisions（已与用户确认）
- 校内维度：按学生登录时填写的“学校/机构代码”划分。
- 积分榜积分：按提交得分累计（vocab/sentence/reading 的 0/1；pronunciation 为 0~1）。
- 榜单时间范围：同时提供“本月榜”和“历史总榜”。
- 跟读句子摘要显示：显示该句历史最高分。
- 听音策略：同时提供“真人原音 + 系统朗读（TTS）”。
- 顶部入口可见：仅学生登录后显示。
- 榜单姓名：显示真实姓名。

## Proposed Changes

### A. 数据模型与后端 API
1) 学校代码接入（Student Session）
- 修改学生登录前端：把“学校/机构代码”做成受控输入，随登录请求提交；并写入 localStorage，扩展 `getSession()` 返回 `schoolCode`。
- 修改 `/api/session/student`：接收 `schoolCode`（可空）。为了避免不同学校同名班级冲突，采用“班级唯一键”策略：
  - 在写入 `classes` 表时，将 `classes.name` 作为唯一键存储为 `${schoolCode}:${className}`（schoolCode 为空时用 `default` 或空前缀策略）。
  - `profiles` 仍然引用 `class_id`，学生侧展示仍使用原始 `className`（localStorage）。
  - 同时在响应中回传 `schoolCode`，供前端落盘。
- 涉及文件：
  - [login.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/routes/login.tsx)
  - [login.ts](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/features/auth/login.ts)
  - [session.ts](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/features/auth/session.ts)
  - [student.js](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/api/session/student.js)

2) attempts 持久化可回填（GET + 使用前端 id）
- 修改 `/api/attempts`：
  - POST：优先使用前端传入的 `attempt.id` 写库（缺省才服务端生成），保证“云端/本地”可用同一 id 去重合并。
  - GET：新增只读拉取能力，支持参数：
    - `userId`（必填）
    - `articleId`（选填）
    - `taskPrefix`（选填，例如 `pronunciation:`）
    - `limit`（选填，默认 2000，上限 5000）
  - 返回 attempts 基本字段（id/user_id/class_id/article_id/task_key/answer_json/score/duration_ms/created_at）。
- 修改前端 `attempts.ts`：
  - 新增 `mergeAttemptsFromServer(attempts)`：按 id 去重合并写入 localStorage。
  - 在“跟读挑战页 / 积分榜页”加载时，优先拉取云端并合并到本地缓存；拉取失败则使用本地缓存。
- 涉及文件：
  - [attempts.js](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/api/attempts.js)
  - [attempts.ts](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/features/storage/attempts.ts)

3) 积分榜 API（新增 /api/leaderboard）
- 新增 `GET /api/leaderboard`，参数：
  - `scope=class|school`
  - `period=month|all`
  - `classId`（scope=class 时必填）
  - `schoolCode`（scope=school 时必填）
- 统计口径：sum(score) as points，按 points desc 排序，返回 Top 50：
  - `userId`
  - `studentName`（来自 profiles.name，显示真实姓名）
  - `points`
  - `rank`
- school 过滤实现：
  - 通过 `classes.name`（班级唯一键）解析前缀匹配 `${schoolCode}:` 来过滤同校班级（避免依赖数据库 schema 变更）。
- 涉及文件：
  - 新增：`api/leaderboard.js`

### B. 前端页面与路由
4) 顶部导航新增入口（学生登录后可见）
- 在 `AppLayout` 顶部导航按钮区新增：
  - “跟读挑战” → `/pronunciation`
  - “积分榜” → `/leaderboard`
- 竖屏优化：按钮文案更短、padding 更紧、点击区域保留；必要时对低频入口做折叠为“更多”（本期先不做复杂弹层，优先做到可滚动且不拥挤）。
- 涉及文件：
  - [AppLayout.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/layout/AppLayout.tsx)

5) 跟读挑战“目录选择”页（从主页进入先选册别/单元/文章）
- 新增路由：`/pronunciation`（独立于文章）
- 页面内容：复用教材目录 UI（books→units→articles），但点击“进入”跳转到 `/a/:articleId/pronunciation`。
- 为避免改动过大：给 `TextbookDirectory` 增加可选 prop `buildArticleLink(articleId)`，默认仍为 `/a/:articleId`，在 `/pronunciation` 页面传入自定义链接。
- 涉及文件：
  - [TextbookDirectory.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/components/TextbookDirectory.tsx)
  - 新增：`src/app/routes/pronunciationHub.tsx`（或同名路由文件）
  - [App.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/App.tsx)

6) 跟读挑战页增强（听音 + 已完成/最高分 + 可复看）
- 在 `/a/:articleId/pronunciation`：
  - 页面加载：调用 `GET /api/attempts?userId=...&articleId=...&taskPrefix=pronunciation:`，合并回本地 attempts。
  - 每句卡片：
    - 左侧句子文本
    - 右侧按钮区：真人原音（有则显示）、系统朗读（始终显示）、🎤 跟读
    - 若已完成：显示“已完成”徽标 + “最高 XX”摘要
    - 展开区：
      - 默认不展开评分详情；点击“查看详情”展示历史最佳 result（来自 attempt.answer_json 中保存的评分详情）
      - 点击 🎤 跟读会打开评测控件；若刷出更高分则更新最高分与详情
- 修改 `PronunciationScorer`：
  - `onScoreSaved` 回调升级为传出 `score + result`（完整评分对象），便于保存可复看的详情。
- 保存 attempt.answer_json：`{ action: "pronunciation_score", result: <azureResult>, referenceText }`
- 涉及文件：
  - [pronunciation.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/routes/pronunciation.tsx)
  - [PronunciationScorer.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/components/PronunciationScorer.tsx)
  - [attempts.ts](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/features/storage/attempts.ts)
  - [read.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/routes/read.tsx)（若存在句子弹窗内的跟读入口，也需要同步使用新 onScoreSaved payload 以保存详情）

7) 新增“积分榜”页面
- 新增路由：`/leaderboard`
- 页面结构：
  - 一级 Tab：班内榜｜校内榜
  - 二级 Tab：本月榜｜历史总榜
  - 榜单列表：排名、姓名、积分；高亮当前用户行
  - 加载策略：调用 `/api/leaderboard`；错误时降级为“本地 attempts 估算”（仅作为兜底提示）
- 涉及文件：
  - 新增：`src/app/routes/leaderboard.tsx`
  - [App.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/App.tsx)

### C. 移动端竖屏专项优化（CSS/布局层）
- 目标页面：跟读挑战页、跟读评分卡、积分榜页、顶部导航栏。
- 主要策略：
  - 操作按钮区从“单行横排”改为“可换行/上下布局”，避免挤压句子正文。
  - 评分卡：分数区在窄屏下减少横向分栏，改为两行/网格自适应；关闭按钮靠近安全区；词块间距更紧凑。
  - 榜单：Tab 固定顶部；列表行高度与字号下调；Top3 样式保留但不占太多高度。
- 涉及文件：
  - [pronunciation.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/routes/pronunciation.tsx)
  - [PronunciationScorer.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/components/PronunciationScorer.tsx)
  - 新增：[leaderboard.tsx]（同上）
  - [AppLayout.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025%E7%BA%A7%E5%AD%A6%E7%94%9F%E6%95%99%E5%AD%A6%E6%96%87%E4%BB%B6/15%20%E6%95%99%E5%AD%A6%E5%88%9B%E6%96%B0%E5%B0%9D%E8%AF%95/06%20%E6%95%99%E6%9D%90%E8%A7%A3%E8%AF%BB/interactive-reader/src/app/layout/AppLayout.tsx)

## Verification（验收与自测）
1) 构建验证
- `npm run build` 通过。

2) 学校代码与校内榜
- 学生 A 使用学校代码 `s1`、班级 `701` 登录；学生 B 使用学校代码 `s2`、班级 `701` 登录。
- 确认：
  - 两个 `classId` 不相同（避免冲突）。
  - A 查看“校内榜”仅看到 `s1` 学校内同学；B 同理。

3) 积分榜正确性
- 在同一班级内做：词汇/拆句/阅读/跟读，确认积分 = 各提交 score 累加。
- 切换“本月榜/历史总榜”，确认本月榜仅统计当月 created_at。

4) 跟读挑战持久化与复看
- 对同一句连续跟读两次（分数一次低一次高）：
  - 列表显示“最高分”为较高分。
  - 点击“查看详情”能看到历史最佳的词级别高亮详情。
- 换浏览器/清 localStorage 后重新登录：
  - 进入该文章跟读挑战页能通过云端拉取恢复“已完成/最高分/详情”。

5) 听音功能
- 对有 `sentence.audioUrl` 的句子点击“真人原音”能播放。
- 对无 `sentence.audioUrl` 的句子：
  - 真人原音按钮不可用或隐藏（按实现细节），系统朗读可用。

6) 竖屏体验
- iPhone 竖屏：顶部导航不遮挡、不溢出；跟读句子卡按钮不挤压；评分卡不横向溢出；积分榜切换与列表可用。

