import { getSql, ensureBody, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

function buildStudentId(className, studentName) {
  return `student:${className.trim()}:${studentName.trim()}`.toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const { className = "", studentName = "" } = await ensureBody(req);
    const classLabel = className.trim();
    const studentLabel = studentName.trim();

    if (!classLabel || !studentLabel) {
      return sendError(res, 400, "Class name and student name are required.");
    }

    const sql = getSql();
    const existingClass = await sql`
      select id, name
      from classes
      where name = ${classLabel}
      limit 1
    `;

    const classRow =
      existingClass[0] ||
      (
        await sql`
          insert into classes (name)
          values (${classLabel})
          returning id, name
        `
      )[0];

    const userId = buildStudentId(classLabel, studentLabel);

    await sql`
      insert into profiles (id, class_id, name, role)
      values (${userId}, ${classRow.id}, ${studentLabel}, 'student')
      on conflict (id) do update
      set class_id = excluded.class_id,
          name = excluded.name
    `;

    return sendJson(res, 200, {
      userId,
      classId: classRow.id,
      className: classRow.name,
      studentName: studentLabel
    });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Student login failed.");
  }
}

