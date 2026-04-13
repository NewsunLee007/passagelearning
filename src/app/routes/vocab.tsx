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

function normalizeWord(token: string) {
  const clean = token.replace(/[.,!?;:—"“”'’()[\]{}*]+$/g, "").replace(/^[("“”'’]+/g, "");
  return clean.toLowerCase();
}

export function VocabRoute() {
  const { articleId } = useParams();
  const { data, loading, error, supportLoading, supportError } = useArticleDemo(articleId);

  const entries = useMemo(() => {
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

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  return (
    <div className="space-y-4">
      <section className="rounded-[1.8rem] border border-white/70 bg-white/88 p-5 shadow-[0_16px_56px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">词汇短语</div>
            <h1 className="mt-2 font-display text-3xl text-secondary">音 · 形 · 意 · 用</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{entries.length} 个词条</span>
            {supportLoading ? <span className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">资料补全中</span> : null}
            {supportError ? <span className="rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-700">自动补全失败</span> : null}
          </div>
        </div>
      </section>

      {!entries.length ? (
        <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-white/82 p-6 text-sm text-slate-500">
          当前文章还没有可展示的词汇资料。
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <article
              key={entry.term}
              className="rounded-[1.6rem] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-2xl text-secondary">{entry.term}</h2>
                    <button
                      type="button"
                      onClick={() =>
                        new Audio(
                          entry.audioUrlOverride ?? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(entry.term)}&type=2`
                        )
                          .play()
                          .catch(() => {})
                      }
                      className="rounded-full bg-primary/8 px-3 py-1 text-sm font-semibold text-primary"
                    >
                      发音
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">{entry.phonetic ?? "/…/"}</div>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">{entry.pos ?? "词性待补全"}</div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <InfoBlock title="词义" tone="emerald">
                  {entry.meaningZh ?? (supportLoading ? "系统正在补全词义…" : "暂无词义")}
                </InfoBlock>
                <InfoBlock title="用法" tone="amber">
                  {entry.usageZh ?? (supportLoading ? "系统正在补全用法…" : "暂无用法说明")}
                </InfoBlock>
                <InfoBlock title="例句" tone="blue">
                  {entry.example ?? "暂无例句"}
                </InfoBlock>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoBlock({
  children,
  title,
  tone
}: {
  children: string;
  title: string;
  tone: "emerald" | "amber" | "blue";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-blue-50 text-blue-700";

  return (
    <div className="rounded-[1.2rem] bg-slate-50 p-4">
      <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{title}</div>
      <div className="mt-3 text-sm leading-7 text-slate-700">{children}</div>
    </div>
  );
}
