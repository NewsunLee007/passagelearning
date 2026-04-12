import { getSql, ensureBody, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const { userId = "", articleId = "", sentenceId = "", note = "" } = await ensureBody(req);
    if (!userId || !articleId || !sentenceId) {
      return sendError(res, 400, "Quote note payload is incomplete.");
    }

    const sql = getSql();
    await sql`
      update quotes
      set note = ${note}
      where user_id = ${userId}
        and article_id = ${articleId}
        and sentence_id = ${sentenceId}
    `;

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to save quote note.");
  }
}

