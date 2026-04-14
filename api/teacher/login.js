import { createTeacherToken } from "../_lib/teacherAuth.js";
import { ensureBody, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const { code = "" } = await ensureBody(req);
    
    // For local development, fallback to a default password if env is not set
    const expected = process.env.TEACHER_CODE || "123456";

    if (String(code).trim() !== expected) {
      return sendError(res, 401, "您输入的密码不正确，或者注册信息有误。");
    }

    return sendJson(res, 200, { token: createTeacherToken() });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Teacher login failed.");
  }
}

