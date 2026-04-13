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
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,_rgba(194,101,52,0.22),_transparent_48%),radial-gradient(circle_at_top_right,_rgba(22,101,52,0.16),_transparent_46%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              教材语篇地图
            </div>
            <div>
              <h1 className="font-display text-4xl text-secondary sm:text-5xl">先看书架，再进单元，不再在文章堆里迷路。</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                当前系统已经按初中英语外研版三年六册建立书架结构。其中七下、八下已导入完整互动课文，
                每个单元固定两篇核心语篇：先读
                <span className="font-semibold text-secondary">理解篇</span>，再进
                <span className="font-semibold text-secondary">写作篇</span>。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1.5">6 册书架</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5">2 册已导入</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5">22 篇真人课文</span>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.95))] p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">当前学习档案</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-slate-500">班级</div>
                <div className="mt-1 text-xl font-semibold text-secondary">{className}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">学生</div>
                <div className="mt-1 text-xl font-semibold text-secondary">{studentName}</div>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link to="/me/report" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  查看学习报告
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    window.localStorage.removeItem("className");
                    window.localStorage.removeItem("studentName");
                    window.localStorage.removeItem("classId");
                    window.localStorage.removeItem("userId");
                    nav("/login");
                  }}
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary/90"
                >
                  切换账号
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bookshelf</div>
            <h2 className="mt-1 font-display text-3xl text-secondary">六册总览</h2>
          </div>
          <p className="max-w-xl text-right text-sm leading-6 text-slate-500">
            已导入册次可以直接进入单元学习，未导入册次保留位置，后续接入时不需要再改系统骨架。
          </p>
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
                <p className="mt-3 text-sm leading-7 text-slate-600">{book.overview}</p>
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
            <h2 className="mt-1 font-display text-3xl text-secondary">已导入册次</h2>
          </div>
          <p className="max-w-xl text-right text-sm leading-6 text-slate-500">
            当前先开放七下与八下。点击语篇先看任务路径，再进入沉浸式阅读。
          </p>
        </div>

        <div className="space-y-8">
          {LOADED_TEXTBOOK_BOOKS.map((book) => (
            <section key={book.id} className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{book.shortLabel}</div>
                  <h3 className="mt-1 font-display text-3xl text-secondary">{book.label}</h3>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">{book.overview}</p>
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
