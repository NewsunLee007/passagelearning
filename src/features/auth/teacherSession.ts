import { apiPost, clearTeacherToken, getTeacherToken, hasTeacherToken, setTeacherToken } from "../../lib/api";

export function isTeacherAuthed() {
  return hasTeacherToken();
}

export function logoutTeacher() {
  clearTeacherToken();
}

export async function loginTeacherWithCode(code: string) {
  const result = await apiPost<{ token: string }>("/api/teacher/login", { code });
  setTeacherToken(result.token);
  return result;
}

export function readTeacherToken() {
  return getTeacherToken();
}
