import { randomBytes, scryptSync } from "node:crypto";
import { ensureBody, getSql, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function buildPasswordHash(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(String(password || ""), salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
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
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");

    if (!name || !phone || password.length < 6) {
      return sendError(res, 400, "请填写姓名、手机号，并设置至少 6 位密码。");
    }

    const username = normalizeUsername(phone);
    const teacherId = `teacher:${username}`;
    const passwordHash = buildPasswordHash(password);

    const sql = getSql();
    await ensureSchema(sql);

    const exists = await sql`
      select id
      from teacher_accounts
      where username = ${username}
      limit 1
    `;
    if (exists[0]) return sendError(res, 409, "该手机号已注册，请直接登录。");

    await sql`
      insert into teacher_accounts (id, username, name, phone, password_hash, role)
      values (${teacherId}, ${username}, ${name}, ${phone}, ${passwordHash}, 'teacher')
    `;

    return sendJson(res, 200, { teacherId, username });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Teacher register failed.");
  }
}

