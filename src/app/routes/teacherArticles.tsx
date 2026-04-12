import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isTeacherAuthed } from "../../features/auth/teacherSession";
import { apiGet } from "../../lib/api";

type ArticleRow = {
  id: string;
  title: string;
  unit: string;
  published: boolean;
  created_at: string;
};

export function TeacherArticlesRoute() {
  const authed = isTeacherAuthed();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    apiGet<ArticleRow[]>("/api/teacher/articles", true)
      .then((rows) => {
        if (!cancelled) {
          setErr(null);
          setArticles(rows);
        }
      })
      .catch((error) => {
        if (!cancelled) setErr(error instanceof Error ? error.message : "加载文章失败。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authed]);

  if (!authed) return <Navigate to="/t/login" replace />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/t/dashboard" className="text-sm underline text-slate-600 hover:text-slate-900">
          回控制台
        </Link>
        <div className="text-sm font-semibold text-slate-900">文章管理</div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">所有文章</h1>
        <Link to="/t/articles/new/edit" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          新增文章
        </Link>
      </div>

      {err && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">加载中…</div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="mb-4 text-slate-500">暂无文章</div>
          <Link to="/t/articles/new/edit" className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-200">
            创建第一篇文章
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <ul className="divide-y">
            {articles.map((article) => (
              <li key={article.id}>
                <Link to={`/t/articles/${article.id}/edit`} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      {article.title}
                      <span className={`rounded px-2 py-0.5 text-xs font-normal ${article.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {article.published ? "已发布" : "草稿"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {article.unit || "未分单元"} · ID: {article.id} · 创建于 {new Date(article.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-slate-400">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
