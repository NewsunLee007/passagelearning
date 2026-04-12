import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { isTeacherAuthed } from "../../features/auth/teacherSession";
import { apiGet, apiPost } from "../../lib/api";

type TeacherArticlePayload = {
  article: { id: string; title: string; unit: string; coverUrl?: string };
  published?: boolean;
};

export function TeacherArticleEditRoute() {
  const authed = isTeacherAuthed();
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const isNew = articleId === "new";

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [contentJson, setContentJson] = useState("{\n  \"article\": { \"paragraphs\": [] },\n  \"sentences\": [],\n  \"lexicon\": {},\n  \"readingQuestions\": []\n}");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!authed || isNew || !articleId) return;

    let cancelled = false;
    setLoading(true);
    setErr(null);

    apiGet<TeacherArticlePayload & Record<string, unknown>>(`/api/teacher/articles/${articleId}`, true)
      .then((payload) => {
        if (cancelled) return;
        setTitle(payload.article?.title || "");
        setUnit(payload.article?.unit || "");
        setCoverUrl(payload.article?.coverUrl || "");
        setPublished(Boolean(payload.published));
        setContentJson(JSON.stringify(payload, null, 2));
      })
      .catch((error) => {
        if (!cancelled) setErr(error instanceof Error ? error.message : "加载文章失败。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authed, articleId, isNew]);

  async function handleGenerate() {
    if (!title.trim() || !rawText.trim()) {
      setErr("请输入标题和英文原文，然后再生成。");
      return;
    }

    setGenerating(true);
    setErr(null);
    try {
      const result = await apiPost<{ data: Record<string, unknown> }>("/api/teacher/generate-article", { title, unit, text: rawText }, true);
      const nextContent = {
        ...result.data,
        article: {
          ...(result.data.article as Record<string, unknown> | undefined),
          title,
          unit,
          coverUrl
        }
      };
      setContentJson(JSON.stringify(nextContent, null, 2));
    } catch (error) {
      setErr(error instanceof Error ? error.message : "AI 生成失败。");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(publishNow = false) {
    if (!title.trim()) {
      setErr("标题不能为空。");
      return;
    }

    let parsedContent: Record<string, unknown>;
    try {
      parsedContent = JSON.parse(contentJson) as Record<string, unknown>;
    } catch {
      setErr("JSON 格式错误，请先修正。");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const response = await apiPost<{ articleId: string }>("/api/teacher/articles/save", {
        articleId: isNew ? "" : articleId,
        title,
        unit,
        coverUrl,
        content: parsedContent,
        published: publishNow || published,
        note: isNew ? "Initial creation" : "Updated in teacher editor"
      }, true);

      setPublished(publishNow || published);
      if (isNew) {
        navigate(`/t/articles/${response.articleId}/edit`);
        return;
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : "保存失败。");
    } finally {
      setLoading(false);
    }
  }

  if (!authed) return <Navigate to="/t/login" replace />;

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/t/articles" className="text-sm text-slate-500 hover:text-slate-900">
          回列表
        </Link>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-slate-900">{isNew ? "新增文章" : "编辑文章"}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">状态：{published ? <span className="font-medium text-emerald-600">已发布</span> : "草稿"}</span>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={loading || generating}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 disabled:opacity-50"
          >
            保存草稿
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading || generating}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            发布
          </button>
        </div>
      </div>

      {err && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-slate-900">基础信息</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">文章标题</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="例如：Growing happiness"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">单元</label>
              <input
                type="text"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="例如：Unit 4"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">封面图 URL</label>
              <input
                type="text"
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
            <h2 className="font-semibold text-amber-900">AI 一键重构</h2>
            <p className="text-xs leading-relaxed text-amber-700">
              粘贴原始英文文本，系统将生成结构化 JSON，包括句子译文、语法分析、词汇表和阅读理解题。
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-amber-900">原始英文文本</label>
              <textarea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                className="min-h-[180px] w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="在此粘贴文章纯文本..."
              />
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-50"
            >
              {generating ? "生成中…" : "开始 AI 分析与生成"}
            </button>
          </div>
        </div>

        <div className="flex min-h-[520px] flex-col rounded-xl border bg-white">
          <div className="flex items-center justify-between rounded-t-xl border-b bg-slate-50 p-4">
            <h2 className="font-semibold text-slate-900">结构化内容 (JSON)</h2>
            {loading && <span className="text-xs text-slate-500">处理中…</span>}
          </div>
          <textarea
            value={contentJson}
            onChange={(event) => setContentJson(event.target.value)}
            className="min-h-[520px] w-full flex-1 resize-none rounded-b-xl bg-slate-900 p-4 font-mono text-sm text-emerald-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
