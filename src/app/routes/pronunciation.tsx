import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";
import { getSession } from "../../features/auth/session";
import { fetchAttemptsFromServer, loadAttempts, mergeAttempts, saveAttempt, type Attempt } from "../../features/storage/attempts";
import { PronunciationScorer, type PronunciationScoreSavedPayload } from "../components/PronunciationScorer";

export function PronunciationRoute() {
  const { articleId } = useParams();
  const { data, loading, error } = useArticleDemo(articleId);
  const session = getSession();
  const [activeScorerId, setActiveScorerId] = useState<string | null>(null);
  const [detailSid, setDetailSid] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!session.userId.trim() || !data) return;
    fetchAttemptsFromServer({ userId: session.userId, articleId: data.article.id, taskPrefix: "pronunciation:" })
      .then((incoming) => {
        mergeAttempts(session.userId, data.article.id, incoming);
        setRefresh((x) => x + 1);
      })
      .catch(() => {});
  }, [data, session.userId]);

  const attempts = useMemo(() => (data ? loadAttempts(session.userId, data.article.id) : []), [data, refresh, session.userId]);
  const bestBySentence = useMemo(() => {
    const map = new Map<string, Attempt>();
    for (const a of attempts) {
      if (!a.taskKey.startsWith("pronunciation:")) continue;
      const sid = a.taskKey.slice("pronunciation:".length);
      if (!sid) continue;
      const prev = map.get(sid);
      if (!prev || Number(a.score) > Number(prev.score)) map.set(sid, a);
    }
    return map;
  }, [attempts]);

  function stopTts() {
    try {
      window.speechSynthesis.cancel();
    } catch {
    }
  }

  function playSystemVoice(text: string) {
    stopTts();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    ttsRef.current = u;
    try {
      window.speechSynthesis.speak(u);
    } catch {
    }
  }

  function scoreTone(score: number) {
    if (score >= 80) return "text-emerald-700 bg-emerald-50";
    if (score >= 60) return "text-amber-700 bg-amber-50";
    return "text-rose-700 bg-rose-50";
  }

  function renderSavedResult(attempt: Attempt) {
    const answer = attempt.answer as { result?: PronunciationScoreSavedPayload["result"] } | null;
    const result = answer?.result;
    if (!result) return null;
    return (
      <div className="mt-4 rounded-[1.2rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">历史最佳</div>
          <div className={["rounded-full px-3 py-1 text-sm font-bold", scoreTone(result.accuracyScore)].join(" ")}>
            {Math.round(result.accuracyScore)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1 text-base leading-7">
          {result.words.map((w, i) => (
            <span key={`${w.word}-${i}`} className={["rounded px-1.5 py-0.5 font-medium", scoreTone(w.accuracyScore)].join(" ")}>
              {w.word}
            </span>
          ))}
        </div>
      </div>
    );
  }

  function hasSavedResult(attempt: Attempt | undefined) {
    const answer = (attempt?.answer ?? null) as { result?: PronunciationScoreSavedPayload["result"] } | null;
    return Boolean(answer?.result?.words?.length);
  }

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
          const best = bestBySentence.get(sentence.id);
          const detailReady = hasSavedResult(best);
          return (
            <article
              key={sentence.id}
              className="rounded-[1.8rem] border border-white/70 bg-white/92 p-5 shadow-[0_16px_56px_rgba(15,23,42,0.06)] sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sentence {index + 1}</div>
                    {best ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        已完成 · 最高 {Math.round(Number(best.score) * 100)}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-base leading-8 text-secondary sm:text-lg">{sentence.text}</div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {sentence.audioUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        stopTts();
                        new Audio(sentence.audioUrl!).play().catch(() => {});
                      }}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      🔊 真人原音
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => playSystemVoice(sentence.text)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    🔈 系统朗读
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveScorerId(sentence.id)}
                    className="rounded-full bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-200"
                  >
                    🎤 跟读
                  </button>
                  {detailReady ? (
                    <button
                      type="button"
                      onClick={() => setDetailSid((curr) => (curr === sentence.id ? null : sentence.id))}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      {detailSid === sentence.id ? "收起详情" : "查看详情"}
                    </button>
                  ) : null}
                </div>
              </div>

              {activeScorerId === sentence.id && (
                <PronunciationScorer 
                  referenceText={sentence.text} 
                  onClose={() => setActiveScorerId(null)} 
                  onScoreSaved={(payload) => {
                    saveAttempt({
                      id: crypto.randomUUID(),
                      userId: session.userId,
                      classId: session.classId,
                      articleId: data.article.id,
                      taskKey: `pronunciation:${sentence.id}`,
                      answer: { action: "pronunciation_score", result: payload.result, referenceText: sentence.text },
                      score: payload.score,
                      durationMs: 0,
                      createdAt: new Date().toISOString()
                    }).catch(() => {});
                    setRefresh((x) => x + 1);
                  }}
                />
              )}

              {detailSid === sentence.id && detailReady && best ? renderSavedResult(best) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
