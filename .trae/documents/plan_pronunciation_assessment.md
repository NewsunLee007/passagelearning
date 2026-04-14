# 互动阅读 - 朗读打分与发音评测功能实施计划

## 1. 需求总结
为互动阅读系统引入“朗读打分与发音评测”功能。学生在学习句子时，可以点击录音按钮朗读课文，系统将基于 **Azure 语音发音评测 (Pronunciation Assessment)** 服务，自动给出发音总分，并对句子中的每个单词进行打分和颜色高亮（例如：读得好的标绿，读错的标红），实现真正的双向互动。

## 2. 当前状态分析
- 目前系统的句子学习主要集中在 `src/app/routes/sentence.tsx`（词句攻坚页）和 `src/app/routes/read.tsx`（主阅读页弹窗）。
- 系统现有的功能仅限于“单向播放”（TTS 或音频 URL 播放），没有录音和语音识别能力。
- 为了实现精确到“单词级别”的发音打分，需要引入专业的语音评测引擎，结合用户的选择，采用微软 Azure Speech 服务。

## 3. 具体的修改步骤

### 步骤 1：安装依赖与配置
- **操作**：在前端项目中安装微软官方 SDK：`npm install microsoft-cognitiveservices-speech-sdk`。
- **原因**：官方 SDK 能够完美解决不同浏览器（Chrome/Safari）录音格式不兼容的问题，并且原生支持流式传输和发音评测，避免将大体积音频文件通过 Vercel Serverless 转发导致超时。

### 步骤 2：建立安全的后端 Token 颁发接口
- **文件**：新建 `api/speech/token.js`
- **逻辑**：创建一个 Vercel Serverless 函数。该函数读取环境变量 `AZURE_SPEECH_KEY` 和 `AZURE_SPEECH_REGION`，向 Azure 服务器请求一个**临时授权 Token**，并返回给前端。
- **原因**：绝对不能把 Azure 的核心密钥直接写在前端代码中，通过临时 Token 机制既保证了安全，又允许前端直连 Azure 提升速度。

### 步骤 3：封装前端发音评测 Hook 与 UI 组件
- **新建 Hook**：`src/features/audio/usePronunciation.ts`
  - 负责调用 `/api/speech/token` 获取临时凭证。
  - 初始化麦克风流，设置 `PronunciationAssessmentConfig`（传入目标句子的文本作为参考依据）。
  - 管理录音状态：`idle` (空闲)、`recording` (录音中)、`analyzing` (分析中)、`done` (完成)。
  - 解析并返回 Azure 的打分数据（准确度、流畅度、完整度，以及**每个单词的具体得分**）。
- **新建组件**：`src/app/components/PronunciationScorer.tsx`
  - 包含一个录音交互按钮（按住说话/点击开始）。
  - 包含一个结果展示面板：展示大号的总分（0-100）。
  - **单词高亮展示**：将原句拆分成单词，根据返回的单词级准确度分数渲染不同颜色（例如：>80分绿色，60-80分橙色，<60分红色/带下划线）。

### 步骤 4：无缝集成到现有学习流程
- **修改文件 1**：`src/app/routes/sentence.tsx`
  - 在每个句子的“朗读”按钮旁，增加一个“跟读评测”按钮。点击后在句子下方展开 `PronunciationScorer` 评测面板。
- **修改文件 2**：`src/app/routes/read.tsx`
  - 在阅读主页，当学生点击文章中的某句话弹出“句法解析”面板时，同样在该面板中嵌入 `PronunciationScorer` 组件，方便学生在上下文语境中直接进行口语挑战。

## 4. 假设与决策
- **API 选型**：使用 Azure Cognitive Services (Speech)。这是目前市面上英语发音评测最成熟、文档最完善的方案。
- **环境要求**：部署和测试前，**您需要在 Vercel 后台（以及本地 `.env`）配置两个环境变量**：`AZURE_SPEECH_KEY` 和 `AZURE_SPEECH_REGION`。
- **音频流策略**：采用“前端 SDK 直接推流给 Azure”的方案，避免了 Vercel API 处理音频流带来的 4.5MB 载荷限制和请求超时风险。

## 5. 验收标准 (Verification)
1. 环境变量配置正确后，前端不报错。
2. 在句子页点击“跟读评测”，浏览器能正确唤起麦克风授权。
3. 录音结束后，系统能在 2 秒内给出 0-100 的综合评分。
4. 原文句子会被重新渲染，并且故意读错的单词会被精准标红，读准的单词标绿。