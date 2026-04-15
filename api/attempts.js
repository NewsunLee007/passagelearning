import { randomUUID } from "node:crypto";
import { getSql, ensureBody, methodNotAllowed, sendError, sendJson } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const userId = String(req.query.userId || "").trim();
      const articleId = String(req.query.articleId || "").trim();
      const taskPrefix = String(req.query.taskPrefix || "").trim();
      const limitRaw = Number(req.query.limit || 2000);
      const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(5000, Math.floor(limitRaw))) : 2000;

      if (!userId) return sendError(res, 400, "userId is required.");

      const sql = getSql();

      let rows;
      if (articleId && taskPrefix) {
        rows = await sql`
          select id, user_id, class_id, article_id, task_key, answer_json, score, duration_ms, created_at
          from attempts
          where user_id = ${userId}
            and article_id = ${articleId}
            and task_key like ${`${taskPrefix}%`}
          order by created_at desc
          limit ${limit}
        `;
      } else if (articleId) {
        rows = await sql`
          select id, user_id, class_id, article_id, task_key, answer_json, score, duration_ms, created_at
          from attempts
          where user_id = ${userId}
            and article_id = ${articleId}
          order by created_at desc
          limit ${limit}
        `;
      } else if (taskPrefix) {
        rows = await sql`
          select id, user_id, class_id, article_id, task_key, answer_json, score, duration_ms, created_at
          from attempts
          where user_id = ${userId}
            and task_key like ${`${taskPrefix}%`}
          order by created_at desc
          limit ${limit}
        `;
      } else {
        rows = await sql`
          select id, user_id, class_id, article_id, task_key, answer_json, score, duration_ms, created_at
          from attempts
          where user_id = ${userId}
          order by created_at desc
          limit ${limit}
        `;
      }

      return sendJson(
        res,
        200,
        (rows ?? []).map((row) => ({
          id: row.id,
          userId: row.user_id,
          classId: row.class_id,
          articleId: row.article_id,
          taskKey: row.task_key,
          answer: row.answer_json,
          score: Number(row.score || 0),
          durationMs: Number(row.duration_ms || 0),
          createdAt: row.created_at
        }))
      );
    } catch (error) {
      return sendError(res, 500, error instanceof Error ? error.message : "Failed to load attempts.");
    }
  }

  if (req.method !== "POST") return methodNotAllowed(res, ["GET", "POST"]);

  try {
    const {
      id = "",
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
        ${String(id || "").trim() || randomUUID()},
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
