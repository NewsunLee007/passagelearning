import { Link, useParams } from "react-router-dom";
import { getAdjacentArticles, getTextbookArticle } from "../../features/content/catalog";
import { useArticleDemo } from "../../features/content/useArticleDemo";

export function ArticleHomeRoute() {
  const { articleId } = useParams();
  const { data, error, loading } = useArticleDemo(articleId);
  const articleMeta = getTextbookArticle(articleId);
  const adjacent = getAdjacentArticles(articleId);

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
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-white/80 px-3 py-1.5">{paragraphCount} 段</span>
            <span className="rounded-full bg-white/80 px-3 py-1.5">{sentenceCount} 句</span>
            <span className="rounded-full bg-white/80 px-3 py-1.5">{questionCount} 道题</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 px-6 py-5 sm:px-8">
          <Link
            to="read"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/92"
          >
            进入阅读
          </Link>
          <Link
            to="sentence"
            className="inline-flex items-center justify-center rounded-full border border-primary/15 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/14"
          >
            查看词句
          </Link>
          <Link
            to="reading"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            打开练习
          </Link>
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
