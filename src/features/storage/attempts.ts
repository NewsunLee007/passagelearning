import { apiGet, apiPost } from "../../lib/api";

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

function isLocalIdentity(value: string) {
  return value.startsWith("local:");
}

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

export function mergeAttempts(userId: string, articleId: string, incoming: Attempt[]) {
  const attempts = loadAttempts(userId, articleId);
  const byId = new Map<string, Attempt>();
  for (const a of attempts) byId.set(a.id, a);
  for (const a of incoming) {
    if (!a?.id) continue;
    byId.set(a.id, a);
  }
  const next = Array.from(byId.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  window.localStorage.setItem(lsKey(userId, articleId), JSON.stringify(next));
  return next;
}

export async function fetchAttemptsFromServer(params: {
  userId: string;
  articleId?: string;
  taskPrefix?: string;
  limit?: number;
}) {
  if (isLocalIdentity(params.userId)) return [];
  const query = new URLSearchParams();
  query.set("userId", params.userId);
  if (params.articleId) query.set("articleId", params.articleId);
  if (params.taskPrefix) query.set("taskPrefix", params.taskPrefix);
  if (params.limit) query.set("limit", String(params.limit));
  return apiGet<Attempt[]>(`/api/attempts?${query.toString()}`);
}

export async function saveAttempt(attempt: Attempt) {
  const attempts = loadAttempts(attempt.userId, attempt.articleId);
  attempts.push(attempt);
  window.localStorage.setItem(lsKey(attempt.userId, attempt.articleId), JSON.stringify(attempts));

  if (isLocalIdentity(attempt.userId) || isLocalIdentity(attempt.classId)) return;
  try {
    await apiPost("/api/attempts", attempt);
  } catch {
    // Local-first fallback keeps the learning flow available offline.
  }
}
