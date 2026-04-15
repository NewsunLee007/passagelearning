export function getSession() {
  const className = (window.localStorage.getItem("className") ?? "").trim();
  const studentName = (window.localStorage.getItem("studentName") ?? "").trim();
  const classId = (window.localStorage.getItem("classId") ?? "").trim();
  const userId = (window.localStorage.getItem("userId") ?? "").trim();
  const schoolCode = (window.localStorage.getItem("schoolCode") ?? "").trim();
  return { className, studentName, classId, userId, schoolCode };
}
