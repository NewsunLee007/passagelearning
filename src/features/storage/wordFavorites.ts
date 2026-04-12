import { apiPost } from "../../lib/api";

export type WordFavorite = {
  term: string;
  createdAt: string;
};

function lsKey(userId: string, articleId: string) {
  return `wordFavs:${userId}:${articleId}`;
}

export function loadWordFavs(userId: string, articleId: string): WordFavorite[] {
  const raw = window.localStorage.getItem(lsKey(userId, articleId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WordFavorite[]) : [];
  } catch {
    return [];
  }
}

export function clearWordFavs(userId: string, articleId: string) {
  window.localStorage.removeItem(lsKey(userId, articleId));
}

export async function toggleWordFav(params: { userId: string; classId: string; articleId: string; term: string }) {
  const { userId, articleId, term } = params;
  const list = loadWordFavs(userId, articleId);
  const idx = list.findIndex((x) => x.term === term);

  if (idx >= 0) {
    list.splice(idx, 1);
    window.localStorage.setItem(lsKey(userId, articleId), JSON.stringify(list));
    try {
      await apiPost("/api/favorites/toggle", { ...params, type: "word", value: term });
    } catch {
      // Keep local state even if cloud sync fails.
    }
    return { active: false };
  }

  list.unshift({ term, createdAt: new Date().toISOString() });
  window.localStorage.setItem(lsKey(userId, articleId), JSON.stringify(list));

  try {
    await apiPost("/api/favorites/toggle", { ...params, type: "word", value: term });
  } catch {
    // Keep local state even if cloud sync fails.
  }

  return { active: true };
}
