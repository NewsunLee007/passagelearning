import { getSql, methodNotAllowed, sendError, sendJson } from "./_lib/db.js";

function normalizeSchoolCode(value) {
  return String(value || "").trim().toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const scope = String(req.query.scope || "").trim();
    const period = String(req.query.period || "").trim();
    const classId = String(req.query.classId || "").trim();
    const schoolCode = normalizeSchoolCode(req.query.schoolCode || "");

    if (scope !== "class" && scope !== "school") return sendError(res, 400, "scope must be class or school.");
    if (period !== "month" && period !== "all") return sendError(res, 400, "period must be month or all.");
    if (scope === "class" && !classId) return sendError(res, 400, "classId is required for class scope.");
    if (scope === "school" && !schoolCode) return sendError(res, 400, "schoolCode is required for school scope.");

    const sql = getSql();

    let rows;
    if (scope === "class") {
      if (period === "month") {
        rows = await sql`
          select p.id as user_id, p.name as student_name, sum(a.score)::float as score_sum
          from attempts a
          join profiles p on p.id = a.user_id
          where a.class_id = ${classId}
            and a.created_at >= date_trunc('month', now())
          group by p.id, p.name
          order by score_sum desc
          limit 50
        `;
      } else {
        rows = await sql`
          select p.id as user_id, p.name as student_name, sum(a.score)::float as score_sum
          from attempts a
          join profiles p on p.id = a.user_id
          where a.class_id = ${classId}
          group by p.id, p.name
          order by score_sum desc
          limit 50
        `;
      }
    } else {
      const prefix = `${schoolCode}:`;
      if (period === "month") {
        rows = await sql`
          select p.id as user_id, p.name as student_name, sum(a.score)::float as score_sum
          from attempts a
          join profiles p on p.id = a.user_id
          join classes c on c.id = a.class_id
          where c.name like ${`${prefix}%`}
            and a.created_at >= date_trunc('month', now())
          group by p.id, p.name
          order by score_sum desc
          limit 50
        `;
      } else {
        rows = await sql`
          select p.id as user_id, p.name as student_name, sum(a.score)::float as score_sum
          from attempts a
          join profiles p on p.id = a.user_id
          join classes c on c.id = a.class_id
          where c.name like ${`${prefix}%`}
          group by p.id, p.name
          order by score_sum desc
          limit 50
        `;
      }
    }

    const payload = (rows ?? []).map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      studentName: row.student_name,
      points: Math.round(Number(row.score_sum || 0) * 100)
    }));

    return sendJson(res, 200, payload);
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Leaderboard failed.");
  }
}

