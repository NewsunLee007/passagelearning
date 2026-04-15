import { getSql, ensureBody, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

function normalizeSchoolCode(value) {
  return String(value || "").trim().toLowerCase();
}

function buildStudentId(className, studentName, schoolCode) {
  const school = normalizeSchoolCode(schoolCode);
  const prefix = school ? `student:${school}:` : "student:";
  return `${prefix}${className.trim()}:${studentName.trim()}`.toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const { className = "", studentName = "", schoolCode = "" } = await ensureBody(req);
    const classLabel = className.trim();
    const studentLabel = studentName.trim();
    const school = normalizeSchoolCode(schoolCode);

    if (!classLabel || !studentLabel) {
      return sendError(res, 400, "Class name and student name are required.");
    }

    const classKey = school ? `${school}:${classLabel}` : classLabel;
    const sql = getSql();
    const existingClass = await sql`
      select id, name
      from classes
      where name = ${classKey}
      limit 1
    `;

    const classRow =
      existingClass[0] ||
      (
        await sql`
          insert into classes (name)
          values (${classKey})
          returning id, name
        `
      )[0];

    const userId = buildStudentId(classLabel, studentLabel, school);

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
      className: classLabel,
      schoolCode: school,
      studentName: studentLabel
    });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Student login failed.");
  }
}
