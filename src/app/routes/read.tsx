import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSession } from "../../features/auth/session";
import { getAdjacentArticles, getTextbookArticle } from "../../features/content/catalog";
import { useArticleDemo } from "../../features/content/useArticleDemo";
import { loadQuotes, toggleQuote } from "../../features/storage/quotes";
import { loadWordFavs, toggleWordFav } from "../../features/storage/wordFavorites";
import { saveAttempt } from "../../features/storage/attempts";
import { PronunciationScorer, type PronunciationScoreSavedPayload } from "../components/PronunciationScorer";

type LexiconItem = {
  phonetic?: string;
  pos?: string;
  meaningZh?: string;
  usageZh?: string;
  example?: string;
  audioUrlOverride?: string;
};

type Sentence = {
  id: string;
  text: string;
  paragraphId: string;
  tr?: string;
  g?: string;
  d?: string;
  audioUrl?: string;
};

type ReadingQuestion = {
  id: string;
  type: "single_choice";
  stem: string;
  options: string[];
  answer: string;
  rationaleZh?: string;
  evidenceSentenceIds?: string[];
};

type SentenceTaskHint = {
  sentenceId: string;
  promptZh?: string;
  focusPointsZh?: string[];
};

function normalizeWord(token: string) {
  const clean = token.replace(/[.,!?;:—"“”'’()[\]{}*]+$/g, "").replace(/^[("“”'’]+/g, "");
  return clean.toLowerCase();
}

function clipText(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function ReadingMainRoute() {
  const nav = useNavigate();
  const { articleId } = useParams();
  const session = getSession();
  const { data, loading, error, supportLoading, supportError } = useArticleDemo(articleId);

  const [isBilingual, setIsBilingual] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [fontSize, setFontSize] = useState(20);

  const [currentSid, setCurrentSid] = useState<string | null>(null);
  const [playIdx, setPlayIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [wordModal, setWordModal] = useState<{ open: boolean; token: string; word: string }>(() => ({
    open: false,
    token: "",
    word: ""
  }));
  const [grammarModal, setGrammarModal] = useState<{ open: boolean; sid: string | null }>(() => ({
    open: false,
    sid: null
  }));
  const [favModalOpen, setFavModalOpen] = useState(false);
  const [refreshFavs, setRefreshFavs] = useState(0);

  const sentences = useMemo(() => (data?.sentences ?? []) as Sentence[], [data?.sentences]);
  const lexicon = useMemo(() => {
    const next: Record<string, LexiconItem> = { ...(data?.lexicon ?? {}) };
    for (const item of data?.vocabItems ?? []) {
      const key = normalizeWord(item.term);
      if (!key || next[key]) continue;
      next[key] = {
        meaningZh: item.meaningZh
      };
    }
    return next;
  }, [data?.lexicon, data?.vocabItems]);
  const questions = (data?.readingQuestions ?? []) as ReadingQuestion[];
  const sentenceTaskById = useMemo(() => {
    const next = new Map<string, SentenceTaskHint>();
    for (const task of (data?.sentenceTasks ?? []) as SentenceTaskHint[]) {
      if (!task?.sentenceId) continue;
      next.set(task.sentenceId, task);
    }
    return next;
  }, [data?.sentenceTasks]);
  const quoteReasonBySentence = useMemo(() => {
    const next = new Map<string, string>();
    for (const item of data?.quoteCandidates ?? []) {
      if (item.sentenceId) next.set(item.sentenceId, item.reasonZh ?? "");
    }
    return next;
  }, [data?.quoteCandidates]);
  const vocabInfoByTerm = useMemo(() => {
    const next = new Map<
      string,
      {
        meaningZh?: string;
        exampleSentence?: string;
      }
    >();
    for (const item of data?.vocabItems ?? []) {
      const key = normalizeWord(item.term);
      if (!key) continue;
      const sentence = item.exampleSentenceId ? sentences.find((entry) => entry.id === item.exampleSentenceId) : undefined;
      next.set(key, {
        meaningZh: item.meaningZh,
        exampleSentence: sentence?.text
      });
    }
    return next;
  }, [data?.vocabItems, sentences]);

  const byId = useMemo(() => {
    const m = new Map<string, Sentence>();
    for (const s of sentences) m.set(s.id, s);
    return m;
  }, [sentences]);

  const linearSentenceIds = useMemo(() => {
    const ids: string[] = [];
    for (const p of data?.article.paragraphs ?? []) ids.push(...p.sentenceIds);
    return ids.filter((x) => byId.has(x));
  }, [data?.article.paragraphs, byId]);

  const sentenceFavSet = useMemo(() => {
    const list = loadQuotes(session.userId, data?.article.id ?? "");
    return new Set(list.map((q) => q.sentenceId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFavs, data?.article.id, session.userId]);

  const wordFavSet = useMemo(() => {
    const list = loadWordFavs(session.userId, data?.article.id ?? "");
    return new Set(list.map((w) => w.term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFavs, data?.article.id, session.userId]);

  useEffect(() => {
    if (!session.className.trim() || !session.studentName.trim()) nav("/login", { replace: true });
  }, [nav, session.className, session.studentName]);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      try {
        audioRef.current?.pause();
      } catch {
        // Ignore playback cleanup errors during unmount.
      }
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore speech cleanup errors during unmount.
      }
    };
  }, []);

  function closeAll() {
    setWordModal({ open: false, token: "", word: "" });
    setGrammarModal({ open: false, sid: null });
    setFavModalOpen(false);
  }

  function stopPlayback() {
    setIsPlaying(false);
    setPaused(false);
    setPlayIdx(null);
    setCurrentSid(null);
    try {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    } catch {
      // Ignore audio cleanup errors when stopping playback.
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore TTS cleanup errors when stopping playback.
    }
  }

  function scrollToSentence(sid: string) {
    const el = document.getElementById(`sent-${sid}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function playSentenceById(sid: string) {
    const s = byId.get(sid);
    if (!s) return;
    setCurrentSid(sid);
    scrollToSentence(sid);

    const mp3 = s.audioUrl;
    if (mp3) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancellation errors before switching audio source.
      }
      const a = audioRef.current;
      if (!a) return;
      a.onended = null;
      a.src = mp3;
      a.playbackRate = rate;
      a.onended = () => {
        if (playIdx == null) {
          setIsPlaying(false);
          setPaused(false);
          setCurrentSid(null);
          return;
        }
        const next = playIdx + 1;
        if (next >= linearSentenceIds.length) {
          stopPlayback();
          return;
        }
        setPlayIdx(next);
      };
      a.play().catch(() => {
        stopPlayback();
      });
      return;
    }

    try {
      audioRef.current?.pause();
    } catch {
      // Ignore audio pause errors before falling back to TTS.
    }

    const u = new SpeechSynthesisUtterance(s.text);
    u.rate = Math.max(0.5, Math.min(2, rate));
    u.onend = () => {
      if (playIdx == null) {
        setIsPlaying(false);
        setPaused(false);
        setCurrentSid(null);
        return;
      }
      const next = playIdx + 1;
      if (next >= linearSentenceIds.length) {
        stopPlayback();
        return;
      }
      setPlayIdx(next);
    };
    ttsRef.current = u;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      stopPlayback();
    }
  }

  useEffect(() => {
    if (playIdx == null) return;
    const sid = linearSentenceIds[playIdx];
    if (!sid) return;
    setIsPlaying(true);
    setPaused(false);
    playSentenceById(sid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIdx]);

  function onPlayAll() {
    closeAll();
    if (!linearSentenceIds.length) return;
    if (paused) {
      const a = audioRef.current;
      if (a && a.src && a.paused) {
        setPaused(false);
        a.play().catch(() => stopPlayback());
        return;
      }
      try {
        window.speechSynthesis.resume();
        setPaused(false);
        return;
      } catch {
        // Ignore resume errors and fall through to restarting playback.
      }
    }
    setPlayIdx(0);
  }

  function onPause() {
    setPaused(true);
    const a = audioRef.current;
    if (a && a.src) {
      try {
        a.pause();
      } catch {
        // Ignore audio pause errors.
      }
      return;
    }
    try {
      window.speechSynthesis.pause();
    } catch {
      // Ignore TTS pause errors.
    }
  }

  async function onToggleSentenceFav(sid: string) {
    if (!data) return;
    await toggleQuote({ userId: session.userId, classId: session.classId, articleId: data.article.id, sentenceId: sid });
    setRefreshFavs((x) => x + 1);
  }

  async function onToggleWordFav(word: string) {
    if (!data) return;
    await toggleWordFav({ userId: session.userId, classId: session.classId, articleId: data.article.id, term: word });
    setRefreshFavs((x) => x + 1);
  }

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  const coverUrl = data.article.coverUrl;
  const articleMeta = getTextbookArticle(data.article.id);
  const adjacent = getAdjacentArticles(data.article.id);
  const hasNaturalAudio = sentences.some((sentence) => sentence.audioUrl);

  return (
    <div className="pb-44 md:pb-[52vh] animate-fade-in">
      <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(241,247,245,0.92))] shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>{articleMeta?.unitLabel ?? data.article.unit}</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{articleMeta?.stageLabel ?? data.article.stageLabel ?? "语篇"}</span>
            </div>
            <h1 className="mt-4 max-w-4xl font-display text-[2.7rem] leading-[0.98] text-secondary sm:text-[3.6rem]">{data.article.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              {articleMeta?.summary ?? data.article.summary ?? "进入沉浸式阅读，先读顺原文，再完成读后理解。"}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{data.article.paragraphs.length} 段</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{sentences.length} 句</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{questions.length} 道练习</span>
              {coverUrl ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>配图已接入</span>
                </>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {adjacent.previous ? (
                <Link
                  to={`/a/${adjacent.previous.id}/read`}
                  className="rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  ← 上一篇
                </Link>
              ) : null}
              {adjacent.next ? (
                <Link
                  to={`/a/${adjacent.next.id}/read`}
                  className="rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  下一篇 →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[72px] md:top-[72px] z-30 mt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.8rem] border border-white/80 bg-white/86 p-3 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBilingual((x) => !x)}
                className={[
                  "rounded-full px-4 py-2.5 text-sm font-semibold transition",
                  isBilingual
                    ? "bg-primary text-white shadow-[0_12px_24px_rgba(47,110,99,0.2)]"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                ].join(" ")}
              >
                {isBilingual ? "隐藏中文" : "显示中文"}
              </button>

              {!isPlaying || paused ? (
                <button
                  type="button"
                  onClick={onPlayAll}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  {paused ? "继续朗读" : hasNaturalAudio ? "真人朗读" : "系统朗读"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(217,130,76,0.22)] transition hover:bg-accent/92"
                >
                  暂停
                </button>
              )}

              <select
                value={String(rate)}
                onChange={(e) => setRate(Number(e.target.value))}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-primary/15"
              >
                <option value="0.8">0.8x</option>
                <option value="0.9">0.9x</option>
                <option value="1">1.0x</option>
                <option value="1.2">1.2x</option>
              </select>

              <button
                type="button"
                onClick={() => nav(`/a/${data.article.id}/pronunciation`)}
                className="ml-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(5,150,105,0.22)] transition hover:bg-emerald-700"
              >
                跟读挑战
              </button>

              <button
                type="button"
                onClick={() => nav(`/a/${data.article.id}/reading`)}
                className="ml-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(217,130,76,0.22)] transition hover:bg-accent/92"
              >
                读后练习
              </button>

              <div className="ml-auto flex items-center rounded-full border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setFontSize((s) => Math.max(16, s - 2))}
                  className="px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  A-
                </button>
                <div className="h-6 w-px bg-slate-200" />
                <button
                  type="button"
                  onClick={() => setFontSize((s) => Math.min(34, s + 2))}
                  className="px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  A+
                </button>
              </div>
            </div>

            {(supportLoading || supportError) ? (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {supportLoading ? <span className="rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">解析补全中</span> : null}
                {supportError ? <span className="rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-700">解析补全失败</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <main className="mx-auto mt-8 w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8" style={{ fontSize }}>
        {data.article.paragraphs.map((p) => (
          <div
            key={p.id}
            className="space-y-3 rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/70 sm:p-8"
          >
            <div className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Paragraph {p.id.split("-p")[1] ?? p.id}
            </div>
            <div className="space-y-3 leading-[2.05] text-secondary">
              {p.sentenceIds
                .map((sid) => byId.get(sid))
                .filter(Boolean)
                .map((s) => (
                  <div key={s!.id} className="inline">
                    <span
                      id={`sent-${s!.id}`}
                      className={[
                        "ir-sentence inline rounded px-0.5",
                        currentSid === s!.id ? "ir-sentence-highlight" : "",
                        sentenceFavSet.has(s!.id) ? "ir-sentence-collected" : ""
                      ].join(" ")}
                      onClick={() => {
                        stopPlayback();
                        setGrammarModal({ open: true, sid: s!.id });
                      }}
                    >
                      {renderSentence(s!.text, {
                        onWordClick: (token) => {
                          stopPlayback();
                          const w = normalizeWord(token);
                          if (!w) return;
                          setWordModal({ open: true, token, word: w });
                        },
                        wordFavSet
                      })}
                    </span>
                    <button
              type="button"
              className="ml-1 inline-block align-middle text-base opacity-60 transition hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                stopPlayback();
                setGrammarModal({ open: true, sid: s!.id });
              }}
              title="句子解析与跟读"
            >
              📖
            </button>
                    {isBilingual && <div className="mt-2 border-l-2 border-primary/20 pl-3 text-[0.82em] leading-7 text-slate-500">{s!.tr ?? "（暂无译文）"}</div>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </main>

      {wordModal.open && (
        <Modal onClose={() => setWordModal({ open: false, token: "", word: "" })}>
          <WordModalBody
            word={wordModal.word}
            info={lexicon?.[wordModal.word]}
            fallbackMeaning={vocabInfoByTerm.get(wordModal.word)?.meaningZh}
            fallbackExample={vocabInfoByTerm.get(wordModal.word)?.exampleSentence}
            isFav={wordFavSet.has(wordModal.word)}
            onToggleFav={() => onToggleWordFav(wordModal.word)}
            supportLoading={supportLoading}
            supportError={supportError}
          />
        </Modal>
      )}

      {grammarModal.open && grammarModal.sid && (
        <Modal onClose={() => setGrammarModal({ open: false, sid: null })}>
          <GrammarModalBody
            sentence={byId.get(grammarModal.sid)!}
            taskHint={sentenceTaskById.get(grammarModal.sid)}
            quoteReason={quoteReasonBySentence.get(grammarModal.sid) ?? ""}
            isFav={sentenceFavSet.has(grammarModal.sid)}
            onToggleFav={() => onToggleSentenceFav(grammarModal.sid!)}
            onPlay={(sid) => {
              stopPlayback();
              setPlayIdx(null);
              setIsPlaying(true);
              setPaused(false);
              playSentenceById(sid);
            }}
            onScoreSaved={(payload) => {
              saveAttempt({
                id: crypto.randomUUID(),
                userId: session.userId,
                classId: session.classId,
                articleId: data.article.id,
                taskKey: `pronunciation:${grammarModal.sid}`,
                answer: { action: "pronunciation_score", result: payload.result, referenceText: byId.get(grammarModal.sid!)?.text ?? "" },
                score: payload.score,
                durationMs: 0,
                createdAt: new Date().toISOString()
              }).catch(() => {});
            }}
            supportLoading={supportLoading}
            supportError={supportError}
          />
        </Modal>
      )}

      {favModalOpen && (
        <Modal onClose={() => setFavModalOpen(false)}>
          <FavsModalBody
            articleId={data.article.id}
            userId={session.userId}
            wordFavs={loadWordFavs(session.userId, data.article.id)}
            sentenceFavs={loadQuotes(session.userId, data.article.id)}
            sentenceText={(sid) => byId.get(sid)?.text ?? sid}
            onRemoveWord={(term) => onToggleWordFav(term)}
            onRemoveSentence={(sid) => onToggleSentenceFav(sid)}
          />
        </Modal>
      )}
    </div>
  );
}

function renderSentence(
  sentence: string,
  opts: { onWordClick: (token: string) => void; wordFavSet: Set<string> }
) {
  const tokens = sentence.split(/\s+/);
  return tokens.map((token, i) => {
    const w = normalizeWord(token);
    const fav = w && opts.wordFavSet.has(w);
    return (
      <span
        key={`${token}-${i}`}
        className={["ir-word", fav ? "ir-word-collected" : ""].join(" ")}
        onClick={(e) => {
          e.stopPropagation();
          opts.onWordClick(token);
        }}
      >
        {token}
        {i === tokens.length - 1 ? "" : " "}
      </span>
    );
  });
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5" onMouseDown={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function WordModalBody(params: {
  word: string;
  info?: LexiconItem;
  fallbackMeaning?: string;
  fallbackExample?: string;
  isFav: boolean;
  onToggleFav: () => void;
  supportLoading: boolean;
  supportError: string | null;
}) {
  const { word, info, fallbackMeaning, fallbackExample, isFav, onToggleFav, supportLoading, supportError } = params;
  const phonetic = info?.phonetic ?? "/…/";
  const meaning = info?.meaningZh ?? fallbackMeaning ?? (supportLoading ? "系统正在补充词义…" : "暂无详细释义");
  const pos = info?.pos ?? (supportLoading ? "生成中" : "未标注");
  const usage = info?.usageZh ?? (supportLoading ? "系统正在补充用法…" : supportError ? "本次未生成成功，可稍后重试。" : "暂无用法说明");
  const example = info?.example ?? fallbackExample ?? "";

  function play() {
    const url = info?.audioUrlOverride ?? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
    new Audio(url).play().catch(() => {});
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black text-primary">{word}</div>
          <button type="button" onClick={play} className="text-2xl">
            🔊
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={onToggleFav} className="text-2xl" style={{ color: isFav ? "#D97706" : "#000" }}>
            {isFav ? "★" : "☆"}
          </button>
        </div>
      </div>
      <div className="mt-2 text-lg text-slate-500">{phonetic}</div>
      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-primary">词性</div>
          <div className="mt-1 text-base text-slate-900">{pos}</div>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="text-xs font-bold uppercase text-emerald-700">词义</div>
          <div className="mt-1 text-base text-slate-900">{meaning}</div>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <div className="text-xs font-bold uppercase text-amber-700">用法</div>
          <div className="mt-1 text-sm leading-7 text-slate-800">{usage}</div>
        </div>
        <div className="rounded-2xl bg-blue-50 p-4">
          <div className="text-xs font-bold uppercase text-blue-700">例句</div>
          <div className="mt-1 text-sm leading-7 text-slate-800">{example || "暂无例句"}</div>
        </div>
      </div>
    </div>
  );
}

function GrammarModalBody(params: {
  sentence: Sentence;
  taskHint?: SentenceTaskHint;
  quoteReason?: string;
  isFav: boolean;
  onToggleFav: () => void;
  onPlay: (sid: string) => void;
  onScoreSaved?: (payload: PronunciationScoreSavedPayload) => void;
  supportLoading: boolean;
  supportError: string | null;
}) {
  const { sentence, taskHint, quoteReason, isFav, onToggleFav, onPlay, onScoreSaved, supportLoading, supportError } = params;
  const detail = sentence.d ?? quoteReason ?? taskHint?.focusPointsZh?.join("；") ?? "";
  const structure = sentence.g ?? taskHint?.promptZh ?? "";
  const [showScorer, setShowScorer] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="text-xl font-bold text-secondary">句子解析</div>
        <button type="button" onClick={onToggleFav} className="text-2xl" style={{ color: isFav ? "#D97706" : "#000" }}>
          {isFav ? "★" : "☆"}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <div className="relative rounded-xl bg-green-50 p-4">
          <div className="text-xs font-bold uppercase text-green-600">原文</div>
          <div className="mt-1 pr-10 text-sm font-medium text-slate-900">{sentence.text}</div>
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <button type="button" onClick={() => onPlay(sentence.id)} className="text-xl" title="播放原音">
              🔊
            </button>
            <button type="button" onClick={() => setShowScorer(true)} className="text-xl" title="跟读评测">
              🎤
            </button>
          </div>
        </div>

        {showScorer && (
          <PronunciationScorer 
            referenceText={sentence.text} 
            onClose={() => setShowScorer(false)} 
            onScoreSaved={onScoreSaved}
          />
        )}

        <div className="rounded-xl bg-blue-50 p-4">
          <div className="text-xs font-bold uppercase text-blue-600">译文</div>
          <div className="mt-1 text-sm text-slate-800">
            {sentence.tr ?? (supportLoading ? "系统正在补全译文…" : supportError ? "本次解析生成失败，请稍后再试。" : "（暂无译文）")}
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 p-4">
          <div className="text-xs font-bold uppercase text-amber-600">句式结构</div>
          <div className="mt-1 text-sm text-slate-800">
            {structure || (supportLoading ? "系统正在分析句式…" : "（暂无结构）")}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-600">详解</div>
          <div className="mt-1 text-sm leading-7 text-slate-800">
            {detail || (supportLoading ? "系统正在补全详解…" : "（暂无详解）")}
          </div>
        </div>

        {!!taskHint?.focusPointsZh?.length && (
          <div className="rounded-xl bg-rose-50 p-4">
            <div className="text-xs font-bold uppercase text-rose-600">阅读关注点</div>
            <ul className="mt-2 space-y-1 text-sm leading-7 text-slate-800">
              {taskHint.focusPointsZh.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </div>
        )}

        {supportError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            当前文章的词句资料生成失败，页面会先展示已有内容。
          </div>
        ) : null}
        {supportLoading ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            正在后台补全译文、结构和详解，稍等片刻会自动更新。
          </div>
        ) : null}
        {!!quoteReason && !sentence.d && (
          <div className="rounded-xl bg-indigo-50 p-4">
            <div className="text-xs font-bold uppercase text-indigo-600">摘录价值</div>
            <div className="mt-1 text-sm leading-7 text-slate-800">{quoteReason}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FavsModalBody(params: {
  userId: string;
  articleId: string;
  wordFavs: { term: string; createdAt: string }[];
  sentenceFavs: { sentenceId: string; createdAt: string }[];
  sentenceText: (sid: string) => string;
  onRemoveWord: (term: string) => void;
  onRemoveSentence: (sid: string) => void;
}) {
  const { wordFavs, sentenceFavs, sentenceText, onRemoveWord, onRemoveSentence } = params;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-black text-primary">我的收藏</div>
      </div>

      <div className="mt-6 space-y-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-secondary">
            <span>🔤</span>
            <span>单词/短语</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {wordFavs.length ? (
              wordFavs.map((w) => (
                <div key={w.term} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                  <span className="font-bold text-slate-800">{w.term}</span>
                  <button type="button" onClick={() => onRemoveWord(w.term)} className="text-red-400">
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-sm text-slate-400">暂无收藏</div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 font-bold text-secondary">
            <span>📄</span>
            <span>句子</span>
          </div>
          <div className="mt-3 space-y-2">
            {sentenceFavs.length ? (
              sentenceFavs.map((s) => (
                <div key={s.sentenceId} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="text-sm text-slate-800">{clipText(sentenceText(s.sentenceId), 80)}</div>
                  <button type="button" onClick={() => onRemoveSentence(s.sentenceId)} className="text-red-400">
                    ❌
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-slate-400">暂无收藏</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
