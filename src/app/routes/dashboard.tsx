import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../../lib/api";

type ArticleMeta = {
  id: string;
  title: string;
  unit: string;
};

export function DashboardRoute() {
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const className = window.localStorage.getItem("className") ?? "";
  const studentName = window.localStorage.getItem("studentName") ?? "";

  useEffect(() => {
    if (!className.trim() || !studentName.trim()) {
      nav("/login", { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const cloudArticles = await apiGet<ArticleMeta[]>("/api/articles");
        if (!cancelled) setArticles(cloudArticles);
      } catch {
        try {
          const response = await fetch("/content/index.json");
          if (!response.ok) throw new Error("无法加载文章列表");
          const localArticles = (await response.json()) as ArticleMeta[];
          if (!cancelled) setArticles(localArticles);
        } catch {
          if (!cancelled) {
            setArticles([
              {
                id: "u8-article",
                title: "Delicious memories",
                unit: "Unit 3 Food matters"
              }
            ]);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav, className, studentName]);

  if (loading) {
    return <div className="text-sm text-slate-600">正在加载文章目录…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between rounded-xl border bg-white p-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">学习大厅</h1>
          <p className="mt-1 text-sm text-slate-600">欢迎回来，{className} 的 {studentName}</p>
        </div>
        <button
          onClick={() => {
            window.localStorage.removeItem("studentName");
            nav("/login");
          }}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          切换账号
        </button>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">请选择要学习的文章</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/a/${article.id}/read`}
              className="group flex flex-col rounded-lg border p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="text-xs font-medium text-slate-500">{article.unit}</span>
              <span className="mt-1 text-base font-semibold group-hover:underline">{article.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

