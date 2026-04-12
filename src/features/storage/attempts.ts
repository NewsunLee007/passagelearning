import { apiPost } from "../../lib/api";

export type Attempt = {
  id: string;
  userId: string;
  classId: string;
  articleId: string;
  taskKey: string;
  answer: unknown;
  score: number;
  durationMs: number;
  createdAt: string;
};

function lsKey(userId: string, articleId: string) {
  return `attempts:${userId}:${articleId}`;
}

export function loadAttempts(userId: string, articleId: string): Attempt[] {
  const raw = window.localStorage.getItem(lsKey(userId, articleId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Attempt[]) : [];
  } catch {
    return [];
  }
}

export function loadAllAttempts(userId: string): Attempt[] {
  const allAttempts: Attempt[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(`attempts:${userId}:`)) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) allAttempts.push(...parsed);
        }
      } catch {
        // Ignore malformed local data.
      }
    }
  }
  return allAttempts;
}

export async function saveAttempt(attempt: Attempt) {
  const attempts = loadAttempts(attempt.userId, attempt.articleId);
  attempts.push(attempt);
  window.localStorage.setItem(lsKey(attempt.userId, attempt.articleId), JSON.stringify(attempts));

  try {
    await apiPost("/api/attempts", attempt);
  } catch {
    // Local-first fallback keeps the learning flow available offline.
  }
}

