import { Link, useParams } from "react-router-dom";
import { getTextbookArticle } from "../../features/content/catalog";
import { useArticleDemo } from "../../features/content/useArticleDemo";

export function ArticleHomeRoute() {
  const { articleId } = useParams();
  const { data, error, loading } = useArticleDemo(articleId);
  const articleMeta = getTextbookArticle(articleId);

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
    <div className="space-y-8 pb-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/90 shadow-[0_22px_80px_rgba(15,23,42,0.06)]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(194,101,52,0.06),rgba(22,101,52,0.04),transparent_60%)] pointer-events-none" />
        
        <div className="relative px-6 py-10 sm:px-10 lg:py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <span>{articleMeta?.unitLabel ?? data.article.unit}</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{articleMeta?.stageLabel ?? data.article.stageLabel ?? "语篇"}</span>
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-[2.5rem] leading-[1.1] text-secondary sm:text-[3.2rem]">{data.article.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            {articleMeta?.summary ?? data.article.summary ?? "开启互动阅读之旅，先读顺原文，再攻克生词与长难句，最后完成读后检测。"}
          </p>
        </div>

        <div className="relative grid border-t border-slate-100/50 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100/50 bg-white/50 backdrop-blur-sm">
          
          <div className="p-6 sm:p-8 flex flex-col justify-between group hover:bg-primary/5 transition-colors">
            <div>
              <div className="text-4xl mb-4">📖</div>
              <h3 className="font-bold text-xl text-secondary">沉浸阅读</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                全文共 {paragraphCount} 段，{sentenceCount} 句话。<br/>
                支持原声音频与划词翻译。
              </p>
            </div>
            <Link
              to="read"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3.5 text-base font-bold text-white shadow-[0_8px_20px_rgba(47,110,99,0.2)] transition hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              开始阅读 →
            </Link>
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between group hover:bg-accent/5 transition-colors">
            <div>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-bold text-xl text-secondary">词句攻坚</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                包含 {data.vocabItems?.length ?? 0} 个核心词条与逐句结构拆解，扫清阅读障碍。
              </p>
            </div>
            <Link
              to="sentence"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 px-5 py-3.5 text-base font-bold text-accent transition hover:bg-accent/15"
            >
              查看词句
            </Link>
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between group hover:bg-blue-500/5 transition-colors">
            <div>
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-bold text-xl text-secondary">读后检测</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                提供 {questionCount} 道阅读理解题，检验学习成果，查看详细解析。
              </p>
            </div>
            <Link
              to="reading"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              打开练习
            </Link>
          </div>

        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-6 shadow-[0_16px_56px_rgba(15,23,42,0.05)] sm:p-8 sm:px-10">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">原文预览</div>
          <div className="mt-6 space-y-5 text-[17px] sm:text-[19px] leading-[1.8] sm:leading-[2] text-slate-800 font-serif tracking-wide">
            {data.article.paragraphs.map((paragraph, index) => (
              <p key={paragraph.id} className="text-justify">
                <span className="mr-3 inline-flex h-6 w-6 sm:h-7 sm:w-7 -translate-y-[2px] items-center justify-center rounded-full bg-primary/10 text-[11px] sm:text-xs font-semibold text-primary font-sans tracking-normal">
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

        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-secondary bg-white/60 px-5 py-3 rounded-2xl border border-white/80 shadow-sm transition hover:bg-white/80">
            ← 返回学习大厅
          </Link>
        </div>
      </section>
    </div>
  );
}
