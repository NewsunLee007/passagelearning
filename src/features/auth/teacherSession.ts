import { apiPost, clearTeacherToken, getTeacherToken, hasTeacherToken, setTeacherToken } from "../../lib/api";

export function isTeacherAuthed() {
  return hasTeacherToken();
}

export function logoutTeacher() {
  clearTeacherToken();
}

export async function loginTeacherWithPassword(params: { username: string; password: string }) {
  const result = await apiPost<{ token: string }>("/api/teacher/login", params);
  setTeacherToken(result.token);
  return result;
}

export async function registerTeacher(params: { name: string; phone: string; password: string }) {
  return apiPost<{ teacherId: string; username: string }>("/api/teacher/register", params);
}

export async function loginTeacherWithCode(code: string) {
  const result = await apiPost<{ token: string }>("/api/teacher/login", { code });
  setTeacherToken(result.token);
  return result;
}

export function readTeacherToken() {
  return getTeacherToken();
}
