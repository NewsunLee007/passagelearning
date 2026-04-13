import { Link, useLocation } from "react-router-dom";
import type { TextbookArticleMeta } from "../../features/content/catalog";

const items = [
  { label: "概览", to: "" },
  { label: "阅读", to: "read" },
  { label: "词句", to: "sentence" },
  { label: "练习", to: "reading" },
  { label: "收藏", to: "quotes" }
];

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "");
}

export function ArticleSubnav({ article }: { article: TextbookArticleMeta }) {
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);

  return (
    <div className="border-b border-white/60 bg-white/55 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{article.unitLabel}</div>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="truncate font-display text-2xl text-secondary">{article.title}</h2>
              <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">{article.stageLabel}</span>
            </div>
          </div>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => {
            const to = item.to ? `/a/${article.id}/${item.to}` : `/a/${article.id}`;
            const active = currentPath === normalizePath(to);
            return (
              <Link
                key={item.label}
                to={to}
                className={[
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition sm:px-4",
                  active
                    ? "bg-secondary text-white shadow-sm"
                    : "border border-white/70 bg-white/78 text-slate-700 hover:border-slate-200 hover:bg-white"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
