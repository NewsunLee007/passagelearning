import { getSql, methodNotAllowed, sendError, sendJson } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const sql = getSql();
    const rows = await sql`
      select id, title, unit
      from articles
      where published = true
      order by created_at asc
    `;
    return sendJson(res, 200, rows);
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to load articles.");
  }
}

