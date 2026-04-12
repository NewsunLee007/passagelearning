import { randomUUID } from "node:crypto";
import { getSql, ensureBody, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const { userId = "", classId = "", articleId = "", sentenceId = "" } = await ensureBody(req);
    if (!userId || !classId || !articleId || !sentenceId) {
      return sendError(res, 400, "Quote payload is incomplete.");
    }

    const sql = getSql();
    const rows = await sql`
      select id
      from quotes
      where user_id = ${userId}
        and article_id = ${articleId}
        and sentence_id = ${sentenceId}
      limit 1
    `;

    if (rows[0]) {
      await sql`
        delete from quotes
        where id = ${rows[0].id}
      `;
      return sendJson(res, 200, { active: false });
    }

    await sql`
      insert into quotes (id, user_id, class_id, article_id, sentence_id)
      values (${randomUUID()}, ${userId}, ${classId}, ${articleId}, ${sentenceId})
    `;

    return sendJson(res, 200, { active: true });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to toggle quote.");
  }
}

