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
  lexicon?: Record<string, { phonetic?: string; pos?: string; meaningZh?: string; audioUrlOverride?: string }>;
};

export function useArticleDemo(articleId?: string) {
  const [data, setData] = useState<ArticleDemo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
            setData(normalizeArticle(articleId, cloudData));
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
        if (!cancelled) setData(normalizeArticle(articleId, json));
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

  return { data, error, loading };
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
