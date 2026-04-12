import { randomUUID } from "node:crypto";
import { getSql, ensureBody, methodNotAllowed, sendError, sendJson } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const {
      userId = "",
      classId = "",
      articleId = "",
      taskKey = "",
      answer = {},
      score = 0,
      durationMs = 0,
      createdAt
    } = await ensureBody(req);

    if (!userId || !classId || !articleId || !taskKey) {
      return sendError(res, 400, "Attempt payload is incomplete.");
    }

    const sql = getSql();
    await sql`
      insert into attempts (id, user_id, class_id, article_id, task_key, answer_json, score, duration_ms, created_at)
      values (
        ${randomUUID()},
        ${userId},
        ${classId},
        ${articleId},
        ${taskKey},
        ${JSON.stringify(answer)},
        ${Number(score) || 0},
        ${Number(durationMs) || 0},
        ${createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()}
      )
    `;

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to save attempt.");
  }
}

