import {
  generateArticleSupport,
  hasArticleSupport,
  mergeArticleContent,
  mergeArticleSupport,
  pickArticleSupport
} from "../_lib/articles.js";
import { getSql, methodNotAllowed, sendError, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const slug = req.query.slug;
    const parts = Array.isArray(slug) ? slug.map((part) => String(part || "").trim()).filter(Boolean) : [];
    const articleId = String(parts[0] || "").trim();
    const wantsSupport = parts[1] === "support";
    const sql = getSql();

    if (!articleId) {
      const rows = await sql`
        select id, title, unit
        from articles
        where published = true
        order by created_at asc
      `;
      return sendJson(res, 200, rows);
    }

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

    const mergedContent = mergeArticleContent(row, versionContent);

    if (!wantsSupport) {
      return sendJson(res, 200, mergedContent);
    }

    if (hasArticleSupport(mergedContent)) {
      return sendJson(res, 200, pickArticleSupport(mergedContent));
    }

    const support = await generateArticleSupport(mergedContent);
    const enrichedContent = mergeArticleSupport(mergedContent, support);
    const serialized = JSON.stringify(enrichedContent);

    if (row.active_version_id) {
      await sql`
        update article_versions
        set content_json = ${serialized}
        where id = ${row.active_version_id}
      `;
    } else {
      await sql`
        update articles
        set content_json = ${serialized}
        where id = ${articleId}
      `;
    }

    return sendJson(res, 200, pickArticleSupport(enrichedContent));
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Failed to load articles.");
  }
}
