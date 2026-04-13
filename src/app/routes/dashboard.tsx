import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LOADED_TEXTBOOK_BOOKS, TEXTBOOK_BOOKS } from "../../features/content/catalog";

export function DashboardRoute() {
  const nav = useNavigate();

  const className = window.localStorage.getItem("className") ?? "";
  const studentName = window.localStorage.getItem("studentName") ?? "";

  useEffect(() => {
    if (!className.trim() || !studentName.trim()) {
      nav("/login", { replace: true });
    }
  }, [nav, className, studentName]);

  return (
    <div className="space-y-10 pb-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.36em] text-primary/80">外研版 Junior English</div>
            <div className="font-display text-4xl leading-tight text-secondary sm:text-5xl">初中英语</div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-white/80 px-3 py-1.5">6 册结构</span>
            <span className="rounded-full bg-white/80 px-3 py-1.5">2 册已导入</span>
            <span className="rounded-full bg-white/80 px-3 py-1.5">22 篇真人课文</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/me/report" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
              查看学习报告
            </Link>
            <a
              href="https://wordflow.newsunenglish.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white/84 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              词汇学习
            </a>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/70 bg-white/84 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm text-slate-500">班级</div>
              <div className="mt-1 text-2xl font-semibold text-secondary">{className}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">学生</div>
              <div className="mt-1 text-2xl font-semibold text-secondary">{studentName}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              window.localStorage.removeItem("className");
              window.localStorage.removeItem("studentName");
              window.localStorage.removeItem("classId");
              window.localStorage.removeItem("userId");
              nav("/login");
            }}
            className="mt-5 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            切换账号
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bookshelf</div>
            <h2 className="mt-1 font-display text-3xl text-secondary">全部册次</h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/86 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          {TEXTBOOK_BOOKS.map((book) => {
            const articleCount = book.units.reduce((sum, unit) => sum + unit.articles.length, 0);
            const firstArticle = book.units[0]?.articles[0];
            return (
              <section
                key={book.id}
                className="grid gap-4 border-b border-slate-100/90 px-5 py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{book.shortLabel}</div>
                    <h3 className="mt-2 text-xl font-semibold text-secondary sm:text-2xl">{book.label}</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span
                      className={[
                        "rounded-full px-3 py-1.5 font-semibold",
                        book.loaded ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      ].join(" ")}
                    >
                      {book.loaded ? "已导入" : "待导入"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5">{book.units.length} 个单元</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5">{articleCount} 篇语篇</span>
                  </div>
                </div>

                <div className="flex items-center sm:justify-end">
                  {book.loaded && firstArticle ? (
                    <Link
                      to={`/a/${firstArticle.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/14"
                    >
                      打开
                      <span>→</span>
                    </Link>
                  ) : (
                    <div className="text-sm text-slate-400">待接入</div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Loaded Books</div>
            <h2 className="mt-1 font-display text-3xl text-secondary">开始学习</h2>
          </div>
        </div>

        <div className="space-y-4">
          {LOADED_TEXTBOOK_BOOKS.map((book) => (
            <details
              key={book.id}
              className="group overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/86 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
              open
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{book.shortLabel}</div>
                  <h3 className="mt-1 font-display text-3xl text-secondary">{book.label}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">{book.units.length} 个单元</span>
                  <span className="text-sm text-slate-400 transition group-open:rotate-180">⌃</span>
                </div>
              </summary>

              <div className="border-t border-slate-100/90 px-4 py-3 sm:px-6 sm:py-4">
                <div className="space-y-3">
                  {book.units.map((unit) => (
                    <section key={`${book.id}-${unit.unitNumber}`} className="rounded-[1.4rem] bg-slate-50/70 px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Unit {unit.unitNumber}</div>
                          <h4 className="mt-1 text-lg font-semibold text-secondary">{unit.theme}</h4>
                        </div>
                      </div>

                      <div className="mt-4 divide-y divide-slate-200/80 rounded-[1rem] border border-slate-200/80 bg-white">
                        {unit.articles.map((article) => (
                          <Link
                            key={article.id}
                            to={`/a/${article.id}`}
                            className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">{article.stageLabel}</div>
                              <div className="mt-1 truncate text-base font-medium text-secondary">{article.title}</div>
                            </div>
                            <span className="text-sm text-slate-400">进入</span>
                          </Link>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
