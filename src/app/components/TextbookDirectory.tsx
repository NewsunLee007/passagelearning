import { Link } from "react-router-dom";
import type { TextbookBook } from "../../features/content/catalog";

export function TextbookDirectory({
  books,
  interactive = true
}: {
  books: TextbookBook[];
  interactive?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      {books.map((book) => {
        const articleCount = book.units.reduce((sum, unit) => sum + unit.articles.length, 0);
        const firstArticle = book.units[0]?.articles[0];

        return (
          <details key={book.id} className="group border-b border-slate-100/90 last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{book.shortLabel}</span>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                      book.loaded ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    ].join(" ")}
                  >
                    {book.loaded ? "已导入" : "待导入"}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-secondary sm:text-2xl">{book.label}</h3>
                <div className="mt-2 text-sm text-slate-500">
                  {book.units.length} 个单元 · {articleCount} 篇语篇
                </div>
              </div>

              <div className="flex items-center gap-3">
                {interactive && book.loaded && firstArticle ? (
                  <Link
                    to={`/a/${firstArticle.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="hidden rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15 sm:inline-flex"
                  >
                    打开
                  </Link>
                ) : null}
                <span className="text-sm text-slate-400 transition group-open:rotate-180">⌃</span>
              </div>
            </summary>

            <div className="border-t border-slate-100/90 px-5 py-4 sm:px-6">
              {book.loaded ? (
                <div className="space-y-4">
                  {book.units.map((unit) => (
                    <details
                      key={`${book.id}-${unit.unitNumber}`}
                      className="group overflow-hidden rounded-[1.6rem] border border-slate-100/90 bg-white/70"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 [&::-webkit-details-marker]:hidden">
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Unit {unit.unitNumber}</div>
                          <div className="mt-1 text-base font-semibold text-secondary sm:text-lg">{unit.theme}</div>
                        </div>
                        <span className="text-sm text-slate-400 transition group-open:rotate-180">⌃</span>
                      </summary>
                      <div className="border-t border-slate-100/80 px-3 py-3 sm:px-4">
                        <div className="space-y-2">
                          {unit.articles.map((article) =>
                            interactive ? (
                              <Link
                                key={article.id}
                                to={`/a/${article.id}`}
                                className="flex items-center justify-between gap-4 rounded-[1.1rem] px-3 py-3 transition hover:bg-slate-50"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">{article.stageLabel}</div>
                                  <div className="mt-1 truncate text-sm font-semibold text-secondary sm:text-base">{article.title}</div>
                                </div>
                                <span className="text-sm text-slate-400">进入</span>
                              </Link>
                            ) : (
                              <div key={article.id} className="rounded-[1.1rem] px-3 py-3">
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">{article.stageLabel}</div>
                                <div className="mt-1 text-sm font-semibold text-secondary sm:text-base">{article.title}</div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="text-sm leading-7 text-slate-500">{book.overview}</div>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
