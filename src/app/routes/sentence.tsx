import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";
import { getSession } from "../../features/auth/session";
import { saveAttempt } from "../../features/storage/attempts";

type LexiconItem = {
  phonetic?: string;
  pos?: string;
  meaningZh?: string;
  usageZh?: string;
  example?: string;
  audioUrlOverride?: string;
};

type SentenceTask = {
  sentenceId: string;
  promptZh?: string;
  focusPointsZh?: string[];
};

function normalizeWord(token: string) {
  const clean = token.replace(/[.,!?;:—"“”'’()[\]{}*]+$/g, "").replace(/^[("“”'’]+/g, "");
  return clean.toLowerCase();
}

export function SentenceRoute() {
  const { articleId } = useParams();
  const { data, loading, error, supportLoading, supportError } = useArticleDemo(articleId);

  const vocabEntries = useMemo(() => {
    const lexicon = data?.lexicon ?? {};
    const next = new Map<
      string,
      {
        term: string;
        phonetic?: string;
        pos?: string;
        meaningZh?: string;
        usageZh?: string;
        example?: string;
        audioUrlOverride?: string;
      }
    >();

    for (const item of data?.vocabItems ?? []) {
      const key = normalizeWord(item.term);
      if (!key) continue;
      const info: LexiconItem | undefined = lexicon[key];
      const sentence = item.exampleSentenceId ? data?.sentences.find((entry) => entry.id === item.exampleSentenceId) : undefined;
      next.set(key, {
        term: item.term,
        phonetic: info?.phonetic,
        pos: info?.pos,
        meaningZh: info?.meaningZh ?? item.meaningZh,
        usageZh: info?.usageZh,
        example: info?.example ?? sentence?.text,
        audioUrlOverride: info?.audioUrlOverride
      });
    }

    return Array.from(next.values());
  }, [data]);

  const taskMap = useMemo(() => {
    const next = new Map<string, SentenceTask>();
    for (const task of (data?.sentenceTasks ?? []) as SentenceTask[]) {
      if (task?.sentenceId) next.set(task.sentenceId, task);
    }
    return next;
  }, [data?.sentenceTasks]);

  const quoteReasonMap = useMemo(() => {
    const next = new Map<string, string>();
    for (const item of data?.quoteCandidates ?? []) {
      if (item.sentenceId) next.set(item.sentenceId, item.reasonZh ?? "");
    }
    return next;
  }, [data?.quoteCandidates]);

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <section className="space-y-4 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(47,110,99,0.10),rgba(217,130,76,0.10),rgba(59,130,246,0.08))] p-5 shadow-[0_22px_70px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">词汇</div>
            <h1 className="mt-2 font-display text-3xl text-secondary sm:text-4xl">核心词条</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-white/70 px-3 py-1.5 font-semibold text-slate-600">{vocabEntries.length} 个</span>
            <span className="rounded-full bg-white/70 px-3 py-1.5 font-semibold text-slate-600">{data.sentences.length} 句</span>
            {supportLoading ? <span className="rounded-full bg-amber-100 px-3 py-1.5 font-semibold text-amber-800">资料补全中</span> : null}
            {supportError ? <span className="rounded-full bg-red-100 px-3 py-1.5 font-semibold text-red-800">资料补全失败</span> : null}
          </div>
        </div>

        {!vocabEntries.length ? (
          <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-white/82 p-4 text-sm text-slate-500">
            当前文章还没有可展示的词汇资料。
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {vocabEntries.map((entry) => (
              <article key={entry.term} className="rounded-[1.6rem] border border-white/70 bg-white/92 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-secondary sm:text-2xl">{entry.term}</h3>
                    <div className="mt-1 text-sm text-slate-500">{entry.phonetic ?? "/…/"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      new Audio(
                        entry.audioUrlOverride ?? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(entry.term)}&type=2`
                      )
                        .play()
                        .catch(() => {});
                      
                      const { userId, classId } = getSession();
                      saveAttempt({
                        id: crypto.randomUUID(),
                        userId,
                        classId,
                        articleId: data!.article.id,
                        taskKey: `vocab:${entry.term}`,
                        answer: { action: "play_audio" },
                        score: 1,
                        durationMs: 0,
                        createdAt: new Date().toISOString()
                      }).catch(() => {});
                    }}
                    className="rounded-full bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/15"
                  >
                    发音
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{entry.pos ?? "词性待补全"}</span>
                </div>

                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">词义</div>
                    <div className="mt-1">{entry.meaningZh ?? (supportLoading ? "系统正在补全词义…" : "暂无词义")}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">用法</div>
                    <div className="mt-1">{entry.usageZh ?? (supportLoading ? "系统正在补全用法…" : "暂无用法说明")}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">例句</div>
                    <div className="mt-1">{entry.example ?? "暂无例句"}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(47,110,99,0.08),rgba(217,130,76,0.08))] p-5 shadow-[0_22px_70px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">句子</div>
            <h2 className="mt-2 font-display text-3xl text-secondary sm:text-4xl">逐句解析</h2>
          </div>
          <div className="text-xs font-semibold text-slate-500">点击朗读可听该句音频</div>
        </div>
      </section>

      <div className="grid gap-4">
        {data.sentences.map((sentence, index) => {
          const task = taskMap.get(sentence.id);
          const reason = quoteReasonMap.get(sentence.id);
          const structure = sentence.g ?? task?.promptZh ?? "";
          const detail = sentence.d ?? task?.focusPointsZh?.join("；") ?? reason ?? "";

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
                <button
                  type="button"
                  onClick={() => {
                    const url = sentence.audioUrl;
                    if (url) {
                      new Audio(url).play().catch(() => {});
                    } else {
                      const utterance = new SpeechSynthesisUtterance(sentence.text);
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(utterance);
                    }
                    
                    const { userId, classId } = getSession();
                    saveAttempt({
                      id: crypto.randomUUID(),
                      userId,
                      classId,
                      articleId: data!.article.id,
                      taskKey: `sentence:${sentence.id}`,
                      answer: { action: "play_audio" },
                      score: 1,
                      durationMs: 0,
                      createdAt: new Date().toISOString()
                    }).catch(() => {});
                  }}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(47,110,99,0.22)] transition hover:bg-primary/92"
                >
                  朗读
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <SentenceBlock title="译文" tone="blue">
                  {sentence.tr ?? (supportLoading ? "系统正在补全译文…" : "暂无译文")}
                </SentenceBlock>
                <SentenceBlock title="句式结构" tone="amber">
                  {structure || (supportLoading ? "系统正在分析句式…" : "暂无结构说明")}
                </SentenceBlock>
                <SentenceBlock title="详解" tone="slate">
                  {detail || (supportLoading ? "系统正在补全详解…" : "暂无详解")}
                </SentenceBlock>
              </div>

              {!!task?.focusPointsZh?.length && (
                <div className="mt-4 rounded-[1.2rem] bg-rose-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">阅读关注点</div>
                  <ul className="mt-2 space-y-1 text-sm leading-7 text-slate-700">
                    {task.focusPointsZh.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SentenceBlock({
  children,
  title,
  tone
}: {
  children: string;
  title: string;
  tone: "blue" | "amber" | "slate";
}) {
  const toneClass =
    tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-600";

  return (
    <div className="rounded-[1.2rem] bg-slate-50 p-4">
      <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{title}</div>
      <div className="mt-3 text-sm leading-7 text-slate-700">{children}</div>
    </div>
  );
}
