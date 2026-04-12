import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const contentDir = join(rootDir, "public", "content");
const index = JSON.parse(readFileSync(join(contentDir, "index.json"), "utf8"));
const sql = neon(databaseUrl);

for (const article of index) {
  const articlePath = join(contentDir, `${article.id}.json`);
  const payload = JSON.parse(readFileSync(articlePath, "utf8"));
  const versionId = randomUUID();
  const title = payload.article?.title ?? article.title;
  const unit = payload.article?.unit ?? article.unit;
  const coverUrl = payload.article?.coverUrl ?? "";
  const content = JSON.stringify(payload);

  console.log(`Seeding ${article.id} -> ${title}`);

  await sql`
    insert into articles (id, title, unit, cover_url, content_json, published)
    values (${article.id}, ${title}, ${unit}, ${coverUrl}, ${content}, ${true})
    on conflict (id) do update
    set title = excluded.title,
        unit = excluded.unit,
        cover_url = excluded.cover_url,
        content_json = excluded.content_json,
        published = excluded.published
  `;

  await sql`
    insert into article_versions (id, article_id, content_json, note)
    values (${versionId}, ${article.id}, ${content}, ${"Seeded from repaired textbook content"})
  `;

  await sql`
    update articles
    set active_version_id = ${versionId}
    where id = ${article.id}
  `;
}

console.log(`Seeded ${index.length} textbook articles.`);
