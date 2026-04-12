import { randomUUID } from "node:crypto";
import { getSql, ensureBody, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const { userId = "", classId = "", articleId = "", type = "", value = "" } = await ensureBody(req);
    if (!userId || !classId || !articleId || !type || !value) {
      return sendError(res, 400, "Favorite payload is incomplete.");
    }

    const sql = getSql();
    const rows = await sql`
      select id
      from favorites
      where user_id = ${userId}
        and article_id = ${articleId}
        and type = ${type}
        and value = ${value}
      limit 1
    `;

    if (rows[0]) {
      await sql`
        delete from favorites
        where id = ${rows[0].id}
      `;
      return sendJson(res, 200, { active: false });
    }

    await sql`
      insert into favorites (id, user_id, class_id, article_id, type, value)
      values (${randomUUID()}, ${userId}, ${classId}, ${articleId}, ${type}, ${value})
    `;

    return sendJson(res, 200, { active: true });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to toggle favorite.");
  }
}

