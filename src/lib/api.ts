const TEACHER_TOKEN_KEY = "teacherSessionToken";

type FetchOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  teacher?: boolean;
};

async function requestJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (options.teacher) {
    const token = getTeacherToken();
    if (!token) {
      throw new Error("教师会话已失效，请重新登录。");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body == null ? undefined : JSON.stringify(options.body)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(String(data?.error ?? `HTTP ${response.status}`));
  }
  return data as T;
}

export function getTeacherToken() {
  return window.localStorage.getItem(TEACHER_TOKEN_KEY) ?? "";
}

export function setTeacherToken(token: string) {
  window.localStorage.setItem(TEACHER_TOKEN_KEY, token);
}

export function clearTeacherToken() {
  window.localStorage.removeItem(TEACHER_TOKEN_KEY);
}

export function hasTeacherToken() {
  return Boolean(getTeacherToken());
}

export async function apiGet<T>(path: string, teacher = false) {
  return requestJson<T>(path, { teacher });
}

export async function apiPost<T>(path: string, body: unknown, teacher = false) {
  return requestJson<T>(path, { method: "POST", body, teacher });
}

