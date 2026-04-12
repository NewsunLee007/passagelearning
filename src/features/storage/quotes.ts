import { apiPost } from "../../lib/api";

export type Quote = {
  sentenceId: string;
  note?: string;
  createdAt: string;
};

function lsKey(userId: string, articleId: string) {
  return `quotes:${userId}:${articleId}`;
}

export function loadQuotes(userId: string, articleId: string): Quote[] {
  const raw = window.localStorage.getItem(lsKey(userId, articleId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Quote[]) : [];
  } catch {
    return [];
  }
}

export function loadAllQuotes(userId: string): Quote[] {
  const allQuotes: Quote[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(`quotes:${userId}:`)) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) allQuotes.push(...parsed);
        }
      } catch {
        // Ignore malformed local data.
      }
    }
  }
  return allQuotes;
}

export async function toggleQuote(params: {
  userId: string;
  classId: string;
  articleId: string;
  sentenceId: string;
}) {
  const { userId, articleId, sentenceId } = params;
  const list = loadQuotes(userId, articleId);
  const idx = list.findIndex((q) => q.sentenceId === sentenceId);

  if (idx >= 0) {
    list.splice(idx, 1);
    window.localStorage.setItem(lsKey(userId, articleId), JSON.stringify(list));
    try {
      await apiPost("/api/quotes/toggle", params);
    } catch {
      // Keep local state even if cloud sync fails.
    }
    return { active: false };
  }

  list.unshift({ sentenceId, createdAt: new Date().toISOString() });
  window.localStorage.setItem(lsKey(userId, articleId), JSON.stringify(list));
  try {
    await apiPost("/api/quotes/toggle", params);
  } catch {
    // Keep local state even if cloud sync fails.
  }
  return { active: true };
}

export async function updateQuoteNote(params: {
  userId: string;
  articleId: string;
  sentenceId: string;
  note: string;
}) {
  const { userId, articleId, sentenceId, note } = params;
  const list = loadQuotes(userId, articleId);
  const idx = list.findIndex((q) => q.sentenceId === sentenceId);
  if (idx < 0) return;

  list[idx].note = note;
  window.localStorage.setItem(lsKey(userId, articleId), JSON.stringify(list));

  try {
    await apiPost("/api/quotes/note", params);
  } catch {
    // Keep local note if cloud sync fails.
  }
}
