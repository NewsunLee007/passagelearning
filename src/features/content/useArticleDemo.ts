import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import { getTextbookArticle } from "./catalog";

export type ArticleSentence = {
  id: string;
  text: string;
  paragraphId: string;
  tr?: string;
  g?: string;
  d?: string;
  audioUrl?: string;
};

export type ArticleDemo = {
  meta?: { schemaVersion?: string };
  article: {
    id: string;
    title: string;
    unit: string;
    coverUrl?: string;
    stage?: string;
    stageLabel?: string;
    unitNumber?: number;
    unitTheme?: string;
    bookOrder?: number;
    summary?: string;
    paragraphs: { id: string; sentenceIds: string[] }[];
  };
  sentences: ArticleSentence[];
  vocabItems?: { id: string; term: string; meaningZh: string; distractorsZh?: string[]; exampleSentenceId?: string }[];
  sentenceTasks?: unknown[];
  readingQuestions?: unknown[];
  quoteCandidates?: { sentenceId: string; reasonZh?: string }[];
  lexicon?: Record<
    string,
    {
      phonetic?: string;
      pos?: string;
      meaningZh?: string;
      usageZh?: string;
      example?: string;
      audioUrlOverride?: string;
    }
  >;
};

type ArticleSupport = {
  meta?: { supportGeneratedAt?: string | null };
  sentences?: { id: string; tr?: string; g?: string; d?: string; audioUrl?: string }[];
  lexicon?: ArticleDemo["lexicon"];
};

export function useArticleDemo(articleId?: string) {
  const [data, setData] = useState<ArticleDemo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const localPath = articleId ? `/content/${articleId}.json` : "/content/article-demo.json";

      try {
        if (articleId) {
          const cloudData = await apiGet<ArticleDemo>(`/api/articles/${articleId}`);
          if (!cancelled) {
            setData(withCachedSupport(normalizeArticle(articleId, cloudData)));
            setLoading(false);
          }
          return;
        }
      } catch {
        // Fall through to local content for local dev and offline use.
      }

      try {
        const response = await fetch(localPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = (await response.json()) as ArticleDemo;
        if (!cancelled) setData(withCachedSupport(normalizeArticle(articleId, json)));
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "内容加载失败");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  useEffect(() => {
    if (!articleId || !data || hasEnoughSupport(data)) return;

    let cancelled = false;
    setSupportLoading(true);
    setSupportError(null);

    apiGet<ArticleSupport>(`/api/articles/${articleId}/support`)
      .then((support) => {
        if (cancelled) return;
        writeSupportCache(articleId, support);
        setData((current) => (current ? mergeSupportIntoArticle(current, support) : current));
      })
      .catch((supportLoadError) => {
        if (!cancelled) {
          setSupportError(supportLoadError instanceof Error ? supportLoadError.message : "解析资料生成失败");
        }
      })
      .finally(() => {
        if (!cancelled) setSupportLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, data]);

  return { data, error, loading, supportLoading, supportError };
}

function normalizeParagraphs(sentences: ArticleSentence[]) {
  const rebuilt: { id: string; sentenceIds: string[] }[] = [];
  let current: { id: string; sentenceIds: string[] } | null = null;

  for (const sentence of sentences) {
    if (!current || current.id !== sentence.paragraphId) {
      current = { id: sentence.paragraphId, sentenceIds: [] };
      rebuilt.push(current);
    }
    current.sentenceIds.push(sentence.id);
  }

  return rebuilt;
}

function normalizeArticle(articleId: string | undefined, payload: ArticleDemo): ArticleDemo {
  const textbookMeta = getTextbookArticle(articleId ?? payload.article.id);
  const paragraphs = normalizeParagraphs(payload.sentences ?? []);

  return {
    ...payload,
    article: {
      ...payload.article,
      title: textbookMeta?.title ?? payload.article.title,
      unit: textbookMeta?.unitLabel ?? payload.article.unit,
      stage: textbookMeta?.stage ?? payload.article.stage,
      stageLabel: textbookMeta?.stageLabel ?? payload.article.stageLabel,
      unitNumber: textbookMeta?.unitNumber ?? payload.article.unitNumber,
      unitTheme: textbookMeta?.unitTheme ?? payload.article.unitTheme,
      bookOrder: textbookMeta?.bookOrder ?? payload.article.bookOrder,
      summary: textbookMeta?.summary ?? payload.article.summary,
      paragraphs: paragraphs.length ? paragraphs : payload.article.paragraphs
    }
  };
}

function supportCacheKey(articleId: string) {
  return `articleSupport:${articleId}`;
}

function readSupportCache(articleId: string) {
  try {
    const raw = window.localStorage.getItem(supportCacheKey(articleId));
    if (!raw) return null;
    return JSON.parse(raw) as ArticleSupport;
  } catch {
    return null;
  }
}

function writeSupportCache(articleId: string, support: ArticleSupport) {
  try {
    window.localStorage.setItem(supportCacheKey(articleId), JSON.stringify(support));
  } catch {
    // Ignore local cache failures.
  }
}

function mergeSupportIntoArticle(article: ArticleDemo, support: ArticleSupport) {
  const sentenceSupport = new Map((support.sentences ?? []).map((sentence) => [sentence.id, sentence]));

  return {
    ...article,
    meta: {
      ...(article.meta ?? {}),
      ...(support.meta ?? {})
    },
    sentences: (article.sentences ?? []).map((sentence) => {
      const next = sentenceSupport.get(sentence.id);
      return next
        ? {
            ...sentence,
            tr: next.tr ?? sentence.tr,
            g: next.g ?? sentence.g,
            d: next.d ?? sentence.d,
            audioUrl: next.audioUrl ?? sentence.audioUrl
          }
        : sentence;
    }),
    lexicon: {
      ...(article.lexicon ?? {}),
      ...(support.lexicon ?? {})
    }
  };
}

function withCachedSupport(article: ArticleDemo) {
  const support = readSupportCache(article.article.id);
  return support ? mergeSupportIntoArticle(article, support) : article;
}

function hasEnoughSupport(article: ArticleDemo) {
  const supportedSentences = (article.sentences ?? []).filter((sentence) => sentence.tr && sentence.g && sentence.d).length;
  return supportedSentences >= Math.ceil((article.sentences?.length ?? 0) * 0.8) && Object.keys(article.lexicon ?? {}).length > 0;
}
