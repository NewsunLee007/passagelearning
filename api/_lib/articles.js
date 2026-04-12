export function mergeArticleContent(row, versionContent) {
  const content = versionContent || row.content_json || {};
  const article = content.article || {};
  return {
    ...content,
    article: {
      ...article,
      id: row.id,
      title: row.title,
      unit: row.unit || article.unit || "",
      coverUrl: row.cover_url || article.coverUrl || ""
    }
  };
}

