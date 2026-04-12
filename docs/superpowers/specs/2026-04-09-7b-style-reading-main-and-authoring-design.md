# 互动阅读系统：7B U4 风格阅读主页面 + 教师编辑与 AI 重构（设计稿）

## 1. Summary
将现有 `interactive-reader` 升级为“进入文章先沉浸式阅读”的课堂互动形态，**彻底复刻** [7B U4 阅读篇章1 课堂互动.html](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025级学生教学文件/15%20教学创新尝试/06%20教材解读/7B%20U4%20阅读篇章1%20课堂互动.html) 的核心交互与视觉语言（绿/灰/琥珀、封面头图、顶部控制条、底部收藏条、词卡/句子解析弹层、读后练习抽屉、逐句朗读高亮），同时 **保留现有四类任务子页面**（词汇/拆句/阅读题/优美句子）作为系统化练习入口。

并补齐“系统更智能、支持修改文章”的能力：在 **Supabase** 中引入文章内容版本管理；教师端支持**手动编辑**与**AI 一键重构（DeepSeek）**生成新版本并发布，学生端读取已发布版本。

## 2. Goals（目标）
1. 新增阅读主页面：进入文章后默认先到“沉浸式阅读页”，一屏解决课堂投屏与手机阅读互动。
2. 7B 同款交互完整实现：点词、点句、逐句朗读高亮、双语切换、字号与倍速、底部收藏条、收藏夹弹层、读后练习抽屉。
3. 收藏与统计闭环：词/句收藏均可沉淀；读后练习抽屉做题**写入 attempts**；“我的报告/教师端”可看到统计。
4. 教师可改文章：支持教师手动编辑与 AI 一键重构，最终保存到 Supabase（版本化 + 发布）。
5. 界面全面美化：使用“界面美化”技能对视觉系统进行统一升级，使阅读主页面与 7B U4 观感一致。

## 3. Non-Goals（非目标）
1. 本阶段不要求实现“多教师账号体系”的完整权限模型（先沿用现有教师入口策略，后续可升级）。
2. 不在本阶段实现“题目反作弊”或严肃考试模式（课堂学习场景优先体验）。
3. 不强制全量生成句子 MP3；策略为“优先 mp3，缺失降级浏览器 TTS”。

## 4. Current State（现状）
### 4.1 现有前端
- 项目：`interactive-reader`（Vite + React + TS + Tailwind）。
- 文章加载：`useArticleDemo` 已支持按 `articleId` 动态加载 `/public/content/*.json`：[useArticleDemo.ts](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025级学生教学文件/15%20教学创新尝试/06%20教材解读/interactive-reader/src/features/content/useArticleDemo.ts)
- 任务子页已可作答并记录本地 attempts：  
  - 词汇：[vocab.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025级学生教学文件/15%20教学创新尝试/06%20教材解读/interactive-reader/src/app/routes/vocab.tsx)  
  - 拆句：[sentence.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025级学生教学文件/15%20教学创新尝试/06%20教材解读/interactive-reader/src/app/routes/sentence.tsx)  
  - 阅读题：[reading.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025级学生教学文件/15%20教学创新尝试/06%20教材解读/interactive-reader/src/app/routes/reading.tsx)
- 收藏：句子收藏已实现，并支持笔记（本地 + 可选 Supabase）：[quotes.ts](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025级学生教学文件/15%20教学创新尝试/06%20教材解读/interactive-reader/src/features/storage/quotes.ts) 与 [quotes.tsx](file:///Users/newsunlee/SynologyDrive/02教学工作/07%2025级学生教学文件/15%20教学创新尝试/06%20教材解读/interactive-reader/src/app/routes/quotes.tsx)

### 4.2 参考标杆（7B U4）
7B U4 的关键能力：
- 顶部按钮组：双语切换、播放/暂停、倍速、字号
- 正文按段落渲染：词可点（词卡弹层）；句可点（句子解析弹层）
- 逐句播放：播放时高亮当前句并滚动定位
- 底部收藏条：收藏夹预览、清空、读后练习抽屉

## 5. UX / IA 设计（新增阅读主页面）
### 5.1 路由设计
- 新增：`/a/:articleId/read`（阅读主页面）
- 保留：`/a/:articleId`（任务链总览/文章概览页）
- 子任务页保持不变：`/vocab`、`/sentence`、`/reading`、`/quotes`
- 入口策略：从 Dashboard 点击文章卡片后，默认进入 `/a/:articleId/read`；阅读页提供“任务链”入口跳转回 `/a/:articleId`。

### 5.2 阅读主页面结构（7B 同款）
1. 顶部封面区域（Cover Header）  
   - `coverUrl` + `title` + `unit` + 学生信息（className / studentName）
2. 顶部控制条（Controls）  
   - 显示/隐藏中文  
   - 播放朗读 / 暂停 / 继续  
   - 倍速（0.8 / 1.0 / 1.2）  
   - 字号 A- / A+  
   - 进入任务链（跳转到 `/a/:articleId`）
3. 正文区（按段落）
   - 句子 block：句子点击 → 解析弹层；播放时高亮当前句并自动滚动到中间
   - 词语 span：点击 → 词卡弹层
4. 底部条（Bottom Bar）
   - 📚 收藏夹入口 + 预览条（最多 3 个） + 🗑️ 清空
   - 📝 读后练习：打开抽屉面板（Exercise Panel）
5. 弹层/抽屉
   - Word Modal（词卡）
   - Grammar Modal（句子解析）
   - Favs Modal（收藏夹总览：词/句分区）
   - Exercise Panel（读后练习）

## 6. 功能规格（7B U4 全量复刻）
### 6.1 点词：Word Modal
交互：
- 点击正文单词 → 弹层展示：单词、音标、词性、中文释义、发音按钮、收藏按钮
发音：
- 默认：有道 `https://dict.youdao.com/dictvoice?audio=${word}&type=2`
- 允许单词级覆盖：`lexicon[word].audioUrlOverride`
收藏：
- 收藏类型：`word`，值为标准化后的 `wordLower`（短语允许空格）

### 6.2 点句：Grammar Modal（译文 + 结构 + 详解）
交互：
- 点击句子或点击“📖解析图标” → 弹层展示：原文、译文、句式结构、详解、句子朗读按钮、收藏按钮
朗读：
- 优先 `sentences[i].audioUrl` 的 mp3；缺失则使用浏览器 TTS
收藏：
- 收藏类型：`sentence`，值为 `sentenceId`

### 6.3 逐句播放：Play All
行为：
- 播放顺序按文章 paragraphs 的 sentenceIds 线性展开
- 当前句高亮；播放下一句前自动滚动到视口中部
- 支持暂停/续播、倍速
音频策略：
- 每句优先 mp3；缺失降级浏览器 TTS

### 6.4 双语切换 + 字号
- 双语：显示每句 `tr`（仿 7B 的 `.bilingual-mode`）
- 字号：阅读区 font-size 调整（阅读页局部，不影响全站）

### 6.5 收藏系统（词 + 句）
- 底部预览条最多显示 3 个收藏（词或句子截断）
- 收藏夹弹层分区展示：
  - 单词/短语：列表 + 删除
  - 句子：列表 + 删除
- 一键清空：清空当前文章的全部收藏

### 6.6 读后练习抽屉（Exercise Panel）
内容来源：`readingQuestions[]`
交互：
- 单选题卡片（仿 7B 的 option button 选中/对错样式）
- 提交后展示正确答案 + 解析 + 原文依据
统计：
- 提交写入 attempts，taskKey：`reading-drawer:${rqId}`

## 7. 数据 Schema（文章内容 JSON）
从现有 `article-demo.json` 扩展（兼容已有字段），新增/补齐：
### 7.1 `article`
- `coverUrl?: string`（新增：封面图）

### 7.2 `sentences[]`
- `tr: string`（新增，必填）
- `g: string`（新增，必填）
- `d: string`（新增，必填）
- `audioUrl?: string`（新增，可选）

### 7.3 `lexicon`（新增）
```json
{
  "lexicon": {
    "imagine": { "phonetic": "/ɪˈmædʒɪn/", "pos": "v.", "meaningZh": "想象；设想" },
    "live": { "phonetic": "/laɪv/", "pos": "adj.", "meaningZh": "现场的", "audioUrlOverride": "https://..." }
  }
}
```

## 8. 存储与统计
### 8.1 本地存储（MVP 兜底）
- attempts：沿用现有 `attempts:${userId}:${articleId}`
- favorites：新增 `favorites:${userId}:${articleId}`，结构含 word + sentence 两类（并与现有 quotes 兼容迁移）

### 8.2 Supabase（推荐落地）
#### 表设计（新增/扩展）
- `articles`：`id, title, unit, cover_url, published, active_version_id, created_at`
- `article_versions`：`id, article_id, content_json, created_by, note, created_at`
- `favorites`（新增）：`id, user_id, class_id, article_id, type('word'|'sentence'), value, created_at`
- `attempts`：沿用现有

#### 读取策略
- 学生端：读取 `articles.published=true` 的列表，进入文章后根据 `active_version_id` 拉取 `content_json`
- 前端仍保留本地读取 `/public/content` 的 fallback（用于离线/不配 Supabase 情况）

## 9. 教师编辑 + AI 一键重构（Supabase）
### 9.1 教师端 UI（新增页面/入口）
- 教师文章列表：选择文章 → 进入编辑台
- 编辑台包含两种模式：
  1) 手动编辑：可编辑标题、封面图、段落句子、tr/g/d、题目、词典条目
  2) AI 重构：粘贴新文本 → 设置参数（题目数/词汇数/难度）→ 调用后端生成 → 可视化检查 → 保存为新版本
- 发布：选择某个版本设置为 active_version_id

### 9.2 AI 调用安全方式
- 必须通过 Supabase Edge Function 调用 DeepSeek（key 存在 Supabase secrets）
- 前端不持有模型密钥，不直接调用模型 API

## 10. 界面美化（执行阶段使用“界面美化”技能）
视觉目标完全对齐 7B U4：配色、按钮形态、弹层、底部条、阴影、圆角、字号、触控反馈（移动端）。
实施策略：
- Tailwind theme 扩展 primary/secondary/accent/background
- 阅读主页面使用“封面头图 + 卡片/抽屉/弹层”的统一组件体系
- 全站保持可访问性对比度（投屏模式更强）

## 11. 验收标准（Acceptance Criteria）
1. 进入文章默认到 `/read`，页面视觉/交互与 7B U4 高度一致。
2. 点词弹层能显示 lexicon 信息并可发音；点句弹层能显示 tr/g/d 并可朗读。
3. Play All 可逐句播放、高亮、滚动、倍速、暂停续播。
4. 收藏系统支持词+句，底部预览、收藏夹弹层、清空可用。
5. 读后练习抽屉可作答判分，提交写入 attempts，报告页能统计到。
6. 教师端能对文章进行手动编辑与 AI 重构，保存版本并发布；学生端读取发布版本。

## 12. 风险与对策
- JSON 内容质量参差：教师编辑台提供“AI 生成后人工微调”的流程，且支持版本回滚。
- 音频资源缺失：策略为 mp3 优先、缺失降级 TTS，不阻断使用。

