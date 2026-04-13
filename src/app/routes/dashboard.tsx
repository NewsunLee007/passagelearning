import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LibraryIllustration } from "../components/EditorialArt";
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
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            六册阅读系统
          </div>
          <h1 className="max-w-3xl font-display text-4xl leading-tight text-secondary sm:text-5xl">初中英语六册阅读系统</h1>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-white/80 px-3 py-1.5">6 册结构</span>
            <span className="rounded-full bg-white/80 px-3 py-1.5">2 册已导入</span>
            <span className="rounded-full bg-white/80 px-3 py-1.5">22 篇真人课文</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/me/report" className="rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary/92">
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

        <div className="space-y-4">
          <LibraryIllustration />
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="rounded-[1.6rem] border border-white/70 bg-white/84 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-slate-500">班级</div>
                  <div className="mt-1 text-xl font-semibold text-secondary">{className}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">学生</div>
                  <div className="mt-1 text-xl font-semibold text-secondary">{studentName}</div>
                </div>
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
              className="rounded-[1.6rem] bg-white/84 px-5 py-4 text-sm font-semibold text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition hover:bg-white"
            >
              切换账号
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bookshelf</div>
            <h2 className="mt-1 font-display text-3xl text-secondary">全部册次</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TEXTBOOK_BOOKS.map((book) => {
            const articleCount = book.units.reduce((sum, unit) => sum + unit.articles.length, 0);
            const firstArticle = book.units[0]?.articles[0];
            return (
              <section
                key={book.id}
                className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_16px_46px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{book.shortLabel}</div>
                    <h3 className="mt-2 font-display text-2xl text-secondary">{book.label}</h3>
                  </div>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      book.loaded ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    ].join(" ")}
                  >
                    {book.loaded ? "已导入" : "待导入"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5">{book.units.length} 个单元</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5">{articleCount} 篇语篇</span>
                </div>
                {book.loaded && firstArticle ? (
                  <Link
                    to={`/a/${firstArticle.id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary"
                  >
                    进入本册
                    <span>→</span>
                  </Link>
                ) : (
                  <div className="mt-5 text-sm text-slate-400">保留书位，等待后续资源接入。</div>
                )}
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

        <div className="space-y-8">
          {LOADED_TEXTBOOK_BOOKS.map((book) => (
            <section key={book.id} className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{book.shortLabel}</div>
                  <h3 className="mt-1 font-display text-3xl text-secondary">{book.label}</h3>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {book.units.map((unit) => (
                  <section
                    key={`${book.id}-${unit.unitNumber}`}
                    className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                  >
                    <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(194,101,52,0.08),rgba(22,101,52,0.06))] px-6 py-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {book.shortLabel} · Unit {unit.unitNumber}
                      </div>
                      <h4 className="mt-2 font-display text-2xl text-secondary">{unit.theme}</h4>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{unit.overview}</p>
                    </div>

                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                      {unit.articles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/a/${article.id}`}
                          className="group flex h-full flex-col rounded-[1.4rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,245,0.92))] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">{article.stageLabel}</span>
                            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{article.stage}</span>
                          </div>
                          <div className="mt-4 flex-1">
                            <div className="font-display text-2xl leading-tight text-secondary transition group-hover:text-primary">{article.title}</div>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{article.summary}</p>
                          </div>
                          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                            进入任务页
                            <span className="transition group-hover:translate-x-1">→</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
