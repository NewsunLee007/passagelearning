import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";

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

    for (const [key, info] of Object.entries(lexicon)) {
      if (next.has(key)) continue;
      next.set(key, {
        term: key,
        phonetic: info.phonetic,
        pos: info.pos,
        meaningZh: info.meaningZh,
        usageZh: info.usageZh,
        example: info.example,
        audioUrlOverride: info.audioUrlOverride
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
    <div className="space-y-4">
      <section className="rounded-[1.8rem] border border-white/70 bg-white/88 p-5 shadow-[0_16px_56px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">词句资料</div>
            <h1 className="mt-2 font-display text-3xl text-secondary">音形意用 · 译文结构详解</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              词汇和句子合并到同一页，手机上不用来回跳。先看核心词条，再顺着句子核对译文、句式和理解重点。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{vocabEntries.length} 个词条</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{data.sentences.length} 句</span>
            {supportLoading ? <span className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">解析补全中</span> : null}
            {supportError ? <span className="rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-700">自动补全失败</span> : null}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[1.8rem] border border-white/70 bg-white/88 p-5 shadow-[0_16px_56px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">词汇板块</div>
            <h2 className="mt-2 font-display text-2xl text-secondary">核心词条</h2>
          </div>
          <div className="text-sm text-slate-500">点击发音直接听单词</div>
        </div>

        {!vocabEntries.length ? (
          <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-white/82 p-4 text-sm text-slate-500">
            当前文章还没有可展示的词汇资料。
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {vocabEntries.map((entry) => (
              <article key={entry.term} className="rounded-[1.4rem] border border-slate-200/70 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-secondary">{entry.term}</h3>
                    <div className="mt-1 text-sm text-slate-500">{entry.phonetic ?? "/…/"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      new Audio(
                        entry.audioUrlOverride ?? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(entry.term)}&type=2`
                      )
                        .play()
                        .catch(() => {})
                    }
                    className="rounded-full bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary"
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

      <section className="space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">句子板块</div>
          <h2 className="mt-2 font-display text-2xl text-secondary">逐句解析</h2>
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
              className="rounded-[1.6rem] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]"
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
                      return;
                    }
                    const utterance = new SpeechSynthesisUtterance(sentence.text);
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="rounded-full bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary"
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
