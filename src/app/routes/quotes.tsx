import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";
import { getSession } from "../../features/auth/session";
import { loadQuotes, toggleQuote, updateQuoteNote } from "../../features/storage/quotes";

export function QuotesRoute() {
  const { articleId } = useParams();
  const { data, loading, error } = useArticleDemo(articleId);
  const session = getSession();
  const [refresh, setRefresh] = useState(0);

  const quotesList = useMemo(() => {
    return loadQuotes(session.userId, data?.article.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, data?.article.id, session.userId]);

  const activeSet = useMemo(() => {
    return new Set(quotesList.map((q) => q.sentenceId));
  }, [quotesList]);

  const reasonMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const q of data?.quoteCandidates ?? []) {
      if (q.sentenceId) m.set(q.sentenceId, q.reasonZh ?? "");
    }
    return m;
  }, [data?.quoteCandidates]);

  async function onToggle(sentenceId: string) {
    await toggleQuote({
      userId: session.userId,
      classId: session.classId,
      articleId: data!.article.id,
      sentenceId
    });
    setRefresh((x) => x + 1);
  }

  async function onSaveNote(sentenceId: string, note: string) {
    await updateQuoteNote({
      userId: session.userId,
      articleId: data!.article.id,
      sentenceId,
      note
    });
    setRefresh((x) => x + 1);
  }

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  return (
    <div className="space-y-4">
      <section className="rounded-[1.8rem] border border-white/70 bg-white/88 p-5 shadow-[0_16px_56px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">优美句子</div>
        <h1 className="mt-2 font-display text-3xl text-secondary">收藏与积累</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">这一页只保留可收藏句子和个人笔记，减少跳转和重复按钮。</p>
      </section>

      <div className="rounded-[1.6rem] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
        <div className="text-sm font-semibold">可收藏句子（点击 ★ 收藏）</div>
        <p className="mt-2 text-sm text-slate-600">
          建议每篇至少收藏 3 句：1 句开头点题、1 句表达观点、1 句结尾升华或提问。
        </p>

        <div className="mt-4 space-y-2">
          {data.sentences.map((s) => {
            const active = activeSet.has(s.id);
            const reason = reasonMap.get(s.id);
            return (
              <div key={s.id} className="rounded-lg border p-3">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(s.id)}
                    className={[
                      "mt-0.5 rounded-md border px-2 py-1 text-sm",
                      active ? "border-amber-300 bg-amber-50" : "hover:bg-slate-50"
                    ].join(" ")}
                    aria-pressed={active}
                    title={active ? "取消收藏" : "收藏"}
                  >
                    {active ? "★" : "☆"}
                  </button>
                  <div className="min-w-0">
                    <div className="text-sm leading-6 text-slate-900">{s.text}</div>
                    {reason && <div className="mt-1 text-xs text-slate-500">建议理由：{reason}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
        <div className="text-sm font-semibold">我的收藏（{activeSet.size}）</div>
        {activeSet.size ? (
          <div className="mt-4 space-y-4">
            {data.sentences
              .filter((s) => activeSet.has(s.id))
              .map((s) => {
                const quoteObj = quotesList.find((q) => q.sentenceId === s.id);
                return (
                  <div key={s.id} className="rounded-lg border p-3">
                    <div className="text-sm leading-6 text-slate-900">{s.text}</div>
                    <div className="mt-3">
                      <textarea
                        className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                        rows={2}
                        placeholder="写下你的笔记或仿写句子…"
                        defaultValue={quoteObj?.note ?? ""}
                        onBlur={(e) => {
                          if (e.target.value !== quoteObj?.note) {
                            onSaveNote(s.id, e.target.value);
                          }
                        }}
                      />
                      <div className="mt-1 text-right text-xs text-slate-400">（失去焦点自动保存）</div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">还没有收藏。先从你最喜欢的一句开始。</p>
        )}
      </div>
    </div>
  );
}
