import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";

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
            setData(cloudData);
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
        if (!cancelled) setData(json);
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

