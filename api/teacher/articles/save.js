import { randomUUID } from "node:crypto";
import { getSql, ensureBody, methodNotAllowed, sendError, sendJson } from "../../_lib/db.js";
import { requireTeacher } from "../../_lib/teacherAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!requireTeacher(req, res)) return;

  try {
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
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to save article.");
  }
}

