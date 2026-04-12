import { mergeArticleContent } from "../_lib/articles.js";
import { getSql, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const articleId = String(req.query.articleId || "").trim();
    if (!articleId) return sendError(res, 400, "Article id is required.");

    const sql = getSql();
    const rows = await sql`
      select id, title, unit, cover_url, content_json, active_version_id
      from articles
      where id = ${articleId}
        and published = true
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

    return sendJson(res, 200, mergeArticleContent(row, versionContent));
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to load article.");
  }
}

