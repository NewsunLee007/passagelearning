import { apiPost } from "../../lib/api";

type StudentLoginResponse = {
  userId: string;
  classId: string;
  className: string;
  schoolCode?: string;
  studentName: string;
};

export async function loginWithClassAndName(params: { className: string; studentName: string; schoolCode?: string }) {
  const className = params.className.trim();
  const studentName = params.studentName.trim();
  const schoolCode = String(params.schoolCode || "").trim();

  if (!className || !studentName) {
    throw new Error("班级名称与学生姓名不能为空");
  }

  try {
    const result = await apiPost<StudentLoginResponse>("/api/session/student", { className, studentName, schoolCode });
    window.localStorage.setItem("className", result.className);
    window.localStorage.setItem("studentName", result.studentName);
    window.localStorage.setItem("classId", result.classId);
    window.localStorage.setItem("userId", result.userId);
    window.localStorage.setItem("schoolCode", String(result.schoolCode || schoolCode || ""));
    return { mode: "cloud" as const, classId: result.classId, userId: result.userId };
  } catch {
    const classId = `local:${className}`;
    const userId = `local:${className}:${studentName}`;
    window.localStorage.setItem("className", className);
    window.localStorage.setItem("studentName", studentName);
    window.localStorage.setItem("classId", classId);
    window.localStorage.setItem("userId", userId);
    window.localStorage.setItem("schoolCode", schoolCode);
    return { mode: "local" as const, classId, userId };
  }
}
