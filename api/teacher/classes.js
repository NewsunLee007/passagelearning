import { getSql, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";
import { requireTeacher } from "../_lib/teacherAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (!requireTeacher(req, res)) return;

  try {
    const sql = getSql();
    const rows = await sql`
      select id, name
      from classes
      order by created_at desc
    `;
    return sendJson(res, 200, rows);
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to load classes.");
  }
}

