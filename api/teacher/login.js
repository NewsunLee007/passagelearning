import { scryptSync, timingSafeEqual } from "node:crypto";
import { createTeacherTokenWithPayload } from "../_lib/teacherAuth.js";
import { ensureBody, getSql, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

async function ensureSchema(sql) {
  await sql`
    create table if not exists teacher_accounts (
      id text primary key,
      username text not null unique,
      name text not null,
      phone text not null,
      password_hash text not null,
      role text not null default 'teacher',
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists teacher_accounts_phone_idx on teacher_accounts (phone)`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const body = await ensureBody(req);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");
    const legacyCode = String(body.code || "").trim();

    const adminUsername = normalizeUsername(process.env.ADMIN_USERNAME || "admin");
    const adminPassword = String(process.env.ADMIN_PASSWORD || "");

    if (username && password) {
      if (adminPassword && username === adminUsername && password === adminPassword) {
        return sendJson(res, 200, { token: createTeacherTokenWithPayload({ role: "admin", teacherId: "admin" }) });
      }

      const sql = getSql();
      await ensureSchema(sql);
      const rows = await sql`
        select id, username, password_hash, role
        from teacher_accounts
        where username = ${username}
        limit 1
      `;
      const row = rows[0];
      if (!row) return sendError(res, 401, "账号或密码错误。");

      const [saltHex, hashHex] = String(row.password_hash).split(":");
      const salt = Buffer.from(saltHex, "hex");
      const expected = Buffer.from(hashHex, "hex");
      const actual = scryptSync(password, salt, expected.length);
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        return sendError(res, 401, "账号或密码错误。");
      }

      return sendJson(res, 200, {
        token: createTeacherTokenWithPayload({ role: row.role || "teacher", teacherId: row.id || row.username })
      });
    }

    if (legacyCode) {
      const expected = String(process.env.TEACHER_CODE || "").trim();
      if (!expected) return sendError(res, 500, "Missing TEACHER_CODE.");
      if (legacyCode !== expected) return sendError(res, 401, "Teacher code is incorrect.");
      return sendJson(res, 200, { token: createTeacherTokenWithPayload({ role: "admin", teacherId: "admin" }) });
    }

    return sendError(res, 400, "Username/password or code is required.");
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Teacher login failed.");
  }
}
