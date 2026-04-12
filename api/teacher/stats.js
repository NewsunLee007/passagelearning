import { getSql, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";
import { requireTeacher } from "../_lib/teacherAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (!requireTeacher(req, res)) return;

  try {
    const classId = String(req.query.classId || "").trim();
    if (!classId) return sendError(res, 400, "classId is required.");

    const sql = getSql();
    const [profiles, attempts] = await Promise.all([
      sql`
        select count(*)::int as count
        from profiles
        where class_id = ${classId}
      `,
      sql`
        select task_key, score
        from attempts
        where class_id = ${classId}
        order by created_at desc
        limit 500
      `
    ]);

    return sendJson(res, 200, {
      studentsCount: profiles[0]?.count || 0,
      attempts
    });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to load stats.");
  }
}

