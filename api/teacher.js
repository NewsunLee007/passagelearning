import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mergeArticleContent } from "../_lib/articles.js";
import { createTeacherTokenWithPayload, requireTeacher } from "../_lib/teacherAuth.js";
import { ensureBody, getSql, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSchoolCode(value) {
  return String(value || "").trim().toLowerCase();
}

function buildStudentId(className, studentName, schoolCode) {
  const school = normalizeSchoolCode(schoolCode);
  const prefix = school ? `student:${school}:` : "student:";
  return `${prefix}${className.trim()}:${studentName.trim()}`.toLowerCase();
}

function buildPasswordHash(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(String(password || ""), salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function ensureTeacherSchema(sql) {
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

async function handleTeacherLogin(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

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
    await ensureTeacherSchema(sql);
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
}

async function handleTeacherRegister(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

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
  await ensureTeacherSchema(sql);

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
}

async function handleTeacherClasses(req, res) {
  if (!requireTeacher(req, res)) return;

  const classId = String(req.query.classId || "").trim();
  const sql = getSql();

  if (req.method === "POST") {
    const body = await ensureBody(req);
    const className = String(body.className || "").trim();
    const schoolCode = normalizeSchoolCode(body.schoolCode || "");
    if (!className) return sendError(res, 400, "Class name is required.");

    const classKey = schoolCode ? `${schoolCode}:${className}` : className;
    const rows = await sql`
      insert into classes (name)
      values (${classKey})
      on conflict (name) do update
      set name = excluded.name
      returning id, name
    `;
    return sendJson(res, 200, rows[0]);
  }

  if (req.method !== "GET") return methodNotAllowed(res, ["GET", "POST"]);

  if (!classId) {
    const rows = await sql`
      select id, name
      from classes
      order by created_at desc
    `;
    return sendJson(res, 200, rows);
  }

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
}

async function handleTeacherStudents(req, res) {
  if (!requireTeacher(req, res)) return;

  const sql = getSql();

  if (req.method === "GET") {
    const classId = String(req.query.classId || "").trim();
    if (!classId) return sendError(res, 400, "classId is required.");

    const rows = await sql`
      select id, name, created_at
      from profiles
      where class_id = ${classId}
        and role = 'student'
      order by created_at asc
      limit 5000
    `;
    return sendJson(res, 200, rows);
  }

  if (req.method === "POST") {
    const body = await ensureBody(req);
    const classId = String(body.classId || "").trim();
    const studentName = String(body.studentName || "").trim();
    if (!classId || !studentName) return sendError(res, 400, "classId and studentName are required.");

    const classRows = await sql`
      select id, name
      from classes
      where id = ${classId}
      limit 1
    `;
    const classRow = classRows[0];
    if (!classRow) return sendError(res, 404, "Class not found.");

    const rawName = String(classRow.name || "");
    const hasSchool = rawName.includes(":");
    const schoolCode = hasSchool ? rawName.split(":")[0] : "";
    const className = hasSchool ? rawName.split(":").slice(1).join(":") : rawName;
    const userId = buildStudentId(className, studentName, schoolCode);

    const rows = await sql`
      insert into profiles (id, class_id, name, role)
      values (${userId}, ${classId}, ${studentName}, 'student')
      on conflict (id) do update
      set class_id = excluded.class_id,
          name = excluded.name
      returning id, name, created_at
    `;

    return sendJson(res, 200, {
      ...rows[0],
      className,
      schoolCode
    });
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}

async function handleTeacherArticles(req, res, parts) {
  if (parts[1] === "save") {
    if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
    if (!requireTeacher(req, res)) return;

    const { randomUUID } = await import("node:crypto");
    const {
      articleId = "",
      title = "",
      unit = "",
      coverUrl = "",
      content = {},
      published = false,
      note = ""
    } = await ensureBody(req);

    const cleanTitle = String(title).trim();
    if (!cleanTitle) return sendError(res, 400, "Title is required.");

    const nextArticleId = String(articleId).trim() || `article-${Date.now()}`;
    const sql = getSql();

    await sql`
      insert into articles (id, title, unit, cover_url, content_json, published)
      values (${nextArticleId}, ${cleanTitle}, ${String(unit)}, ${String(coverUrl)}, ${JSON.stringify(content)}, ${Boolean(published)})
      on conflict (id) do update
      set title = excluded.title,
          unit = excluded.unit,
          cover_url = excluded.cover_url,
          content_json = excluded.content_json,
          published = excluded.published
    `;

    const versionId = randomUUID();
    await sql`
      insert into article_versions (id, article_id, content_json, note)
      values (${versionId}, ${nextArticleId}, ${JSON.stringify(content)}, ${String(note || "Saved from teacher editor")})
    `;

    await sql`
      update articles
      set active_version_id = ${versionId}
      where id = ${nextArticleId}
    `;

    return sendJson(res, 200, { articleId: nextArticleId, versionId });
  }

  if (parts[1]) {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    if (!requireTeacher(req, res)) return;

    const articleId = String(parts[1] || "").trim();
    if (!articleId) return sendError(res, 400, "Article id is required.");

    const sql = getSql();
    const rows = await sql`
      select id, title, unit, cover_url, content_json, published, active_version_id
      from articles
      where id = ${articleId}
      limit 1
    `;
    const row = rows[0];
    if (!row) return sendError(res, 404, "Article not found.");

    let versionContent = null;
    if (row.active_version_id) {
      const versions = await sql`
        select content_json
        from article_versions
        where id = ${row.active_version_id}
        limit 1
      `;
      versionContent = versions[0]?.content_json || null;
    }

    return sendJson(res, 200, {
      ...mergeArticleContent(row, versionContent),
      published: row.published
    });
  }

  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  if (!requireTeacher(req, res)) return;

  const sql = getSql();
  const rows = await sql`
    select id, title, unit, published, created_at
    from articles
    order by created_at desc
  `;
  return sendJson(res, 200, rows);
}

async function handleTeacherGenerateArticle(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!requireTeacher(req, res)) return;

  const { text = "", title = "", unit = "" } = await ensureBody(req);
  if (String(text).trim().length < 50) {
    return sendError(res, 400, "Text is too short.");
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || "";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  if (!apiKey) return sendError(res, 500, "Missing DEEPSEEK_API_KEY.");

  const systemPrompt = `You are an expert English teacher. Return valid JSON only.
The top-level JSON shape must be:
{
  "article": { "title": "...", "unit": "...", "paragraphs": [{ "id": "p1", "sentenceIds": ["s1"] }] },
  "sentences": [{ "id": "s1", "text": "...", "paragraphId": "p1", "tr": "...", "g": "...", "d": "...", "audioUrl": "" }],
  "lexicon": { "word": { "phonetic": "...", "pos": "...", "meaningZh": "..." } },
  "readingQuestions": [{ "id": "rq1", "type": "single_choice", "stem": "...", "options": ["A", "B", "C", "D"], "answer": "A", "rationaleZh": "...", "evidenceSentenceIds": ["s1"] }]
}
Keep IDs stable and references valid. Include 5-10 lexicon entries and 3-5 reading questions.`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Title: ${title}\nUnit: ${unit}\n\nText:\n${text}` }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return sendError(res, 502, `DeepSeek request failed: ${detail}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return sendError(res, 502, "DeepSeek returned an empty response.");

  return sendJson(res, 200, { data: JSON.parse(content) });
}

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const slug = req.query.slug;
    const parts = Array.isArray(slug) ? slug.map((part) => String(part || "").trim()).filter(Boolean) : (typeof slug === "string" ? slug.split("/").filter(Boolean) : []);
    const route = String(parts[0] || "").trim();

    if (route === "login") return await handleTeacherLogin(req, res);
    if (route === "register") return await handleTeacherRegister(req, res);
    if (route === "classes") return await handleTeacherClasses(req, res);
    if (route === "students") return await handleTeacherStudents(req, res);
    if (route === "articles") return await handleTeacherArticles(req, res, parts);
    if (route === "generate-article") return await handleTeacherGenerateArticle(req, res);

    return sendError(res, 404, "Not found.");
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Teacher API failed.");
  }
}
