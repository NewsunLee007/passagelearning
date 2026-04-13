import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession } from "../../features/auth/session";
import { getAdjacentArticles, getTextbookArticle } from "../../features/content/catalog";
import { useArticleDemo } from "../../features/content/useArticleDemo";

const taskCards = [
  {
    to: "read",
    title: "先读原文",
    desc: "进入阅读页，直接点词、点句、跟读，不再先做额外操作。"
  },
  {
    to: "sentence",
    title: "再看词句",
    desc: "一个页面同时看词汇音形意用和句子译文、结构、详解。"
  },
  {
    to: "reading",
    title: "最后练习",
    desc: "做篇章理解，必要时再去收藏页记录优美句子。"
  }
];

export function ArticleHomeRoute() {
  const { articleId } = useParams();
  const session = getSession();
  const { data, error, loading } = useArticleDemo(articleId);
  const articleMeta = getTextbookArticle(articleId);
  const adjacent = getAdjacentArticles(articleId);

  const studentLabel = useMemo(() => {
    return [session.className.trim(), session.studentName.trim()].filter(Boolean).join(" · ");
  }, [session.className, session.studentName]);

  if (loading) return <div className="text-sm text-slate-600">正在加载文章内容…</div>;
  if (error || !data) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-6">
        <div className="text-sm font-semibold text-red-600">内容加载失败</div>
        <div className="mt-2 text-sm text-slate-700">错误信息：{error ?? "unknown"}</div>
      </div>
    );
  }

  const sentenceCount = data.sentences.length;
  const paragraphCount = data.article.paragraphs.length;
  const questionCount = data.readingQuestions?.length ?? 0;

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_22px_80px_rgba(15,23,42,0.08)]">
        <div className="bg-[linear-gradient(135deg,rgba(194,101,52,0.12),rgba(22,101,52,0.08))] px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>{articleMeta?.unitLabel ?? data.article.unit}</span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-primary">{articleMeta?.stageLabel ?? data.article.stageLabel ?? "语篇"}</span>
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-4xl text-secondary sm:text-5xl">{data.article.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            {articleMeta?.summary ?? data.article.summary ?? "从原文出发完成阅读、词句理解和读后产出。"}
          </p>
          {studentLabel && <div className="mt-4 text-sm text-slate-500">{studentLabel}</div>}
        </div>

        <div className="grid gap-5 px-6 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">学习路径</div>
                <h2 className="mt-2 font-display text-2xl text-secondary">阅读、词句、练习</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {taskCards.map((task, index) => (
                <Link
                  key={task.to}
                  to={task.to}
                  className="group rounded-[1.4rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,247,245,0.95))] p-5 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Task</span>
                  </div>
                  <div className="mt-4 font-display text-2xl text-secondary group-hover:text-primary">{task.title}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{task.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="space-y-4 rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(250,249,246,0.98),rgba(255,255,255,0.94))] p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">阅读面板</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <MetaStat label="段落" value={String(paragraphCount)} />
                <MetaStat label="句子" value={String(sentenceCount)} />
                <MetaStat label="读后题" value={String(questionCount)} />
              </div>
            </div>
            <div className="rounded-[1.3rem] bg-slate-50/80 p-4">
              <div className="text-sm font-semibold text-secondary">进入方式</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                这一页只负责定路径。真正的操作集中在左侧导航和上方菜单里。
              </p>
            </div>
            <Link
              to="read"
              className="inline-flex w-full items-center justify-center rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary/92"
            >
              直接进入沉浸式阅读
            </Link>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-6 shadow-[0_16px_56px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">原文预览</div>
          <div className="mt-4 space-y-4 text-[15px] leading-8 text-slate-700">
            {data.article.paragraphs.map((paragraph, index) => (
              <p key={paragraph.id}>
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/8 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                {paragraph.sentenceIds
                  .map((sid) => data.sentences.find((sentence) => sentence.id === sid)?.text ?? "")
                  .filter(Boolean)
                  .join(" ")}
              </p>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-6 shadow-[0_16px_56px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">教材进度</div>
            <div className="mt-4 space-y-3">
              {adjacent.previous ? (
                <Link to={`/a/${adjacent.previous.id}`} className="block rounded-[1.2rem] border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50">
                  <div className="text-xs text-slate-400">上一篇</div>
                  <div className="mt-1 font-medium text-secondary">{adjacent.previous.title}</div>
                </Link>
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">这是第一篇核心语篇。</div>
              )}
              {adjacent.next ? (
                <Link to={`/a/${adjacent.next.id}`} className="block rounded-[1.2rem] border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50">
                  <div className="text-xs text-slate-400">下一篇</div>
                  <div className="mt-1 font-medium text-secondary">{adjacent.next.title}</div>
                </Link>
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">这已经是本册最后一篇核心语篇。</div>
              )}
            </div>
          </div>

          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-secondary">
            ← 返回学习大厅
          </Link>
        </aside>
      </section>
    </div>
  );
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-secondary">{value}</div>
    </div>
  );
}
