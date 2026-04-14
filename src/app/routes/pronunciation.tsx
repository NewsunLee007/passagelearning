import { useState } from "react";
import { useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";
import { getSession } from "../../features/auth/session";
import { saveAttempt } from "../../features/storage/attempts";
import { PronunciationScorer } from "../components/PronunciationScorer";

export function PronunciationRoute() {
  const { articleId } = useParams();
  const { data, loading, error } = useArticleDemo(articleId);
  const [activeScorerId, setActiveScorerId] = useState<string | null>(null);

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(5,150,105,0.08),rgba(4,120,87,0.08))] p-5 shadow-[0_22px_70px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">跟读挑战</div>
            <h2 className="mt-2 font-display text-3xl text-secondary sm:text-4xl">朗读课文句子，挑战完美发音</h2>
          </div>
          <div className="text-xs font-semibold text-slate-500">完成跟读的句子分数将记入学习报告</div>
        </div>
      </section>

      <div className="grid gap-4">
        {data.sentences.map((sentence, index) => {
          return (
            <article
              key={sentence.id}
              className="rounded-[1.8rem] border border-white/70 bg-white/92 p-5 shadow-[0_16px_56px_rgba(15,23,42,0.06)] sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sentence {index + 1}</div>
                  <div className="mt-2 text-base leading-8 text-secondary sm:text-lg">{sentence.text}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveScorerId(sentence.id)}
                    className="rounded-full bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-200"
                  >
                    🎤 跟读
                  </button>
                </div>
              </div>

              {activeScorerId === sentence.id && (
                <PronunciationScorer 
                  referenceText={sentence.text} 
                  onClose={() => setActiveScorerId(null)} 
                  onScoreSaved={(score) => {
                    const { userId, classId } = getSession();
                    saveAttempt({
                      id: crypto.randomUUID(),
                      userId,
                      classId,
                      articleId: data.article.id,
                      taskKey: `pronunciation:${sentence.id}`,
                      answer: { action: "pronunciation_score" },
                      score,
                      durationMs: 0,
                      createdAt: new Date().toISOString()
                    }).catch(() => {});
                  }}
                />
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
