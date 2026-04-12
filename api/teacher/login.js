import { createTeacherToken } from "../_lib/teacherAuth.js";
import { ensureBody, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const { code = "" } = await ensureBody(req);
    const expected = process.env.TEACHER_CODE || "";

    if (!expected) return sendError(res, 500, "Missing TEACHER_CODE.");
    if (String(code).trim() !== expected) return sendError(res, 401, "Teacher code is incorrect.");

    return sendJson(res, 200, { token: createTeacherToken() });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Teacher login failed.");
  }
}

