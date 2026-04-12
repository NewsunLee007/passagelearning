import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TEXTBOOK_UNITS } from "../../features/content/catalog";

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
              <h1 className="font-display text-4xl text-secondary sm:text-5xl">按单元推进，不再在文章堆里迷路。</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                当前目录已按《七年级下册英语》六个单元重整。每个单元固定两篇核心语篇：先读
                <span className="font-semibold text-secondary">理解篇</span>，再进
                <span className="font-semibold text-secondary">写作篇</span>，任务顺序也会跟着教材走。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1.5">6 个单元</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5">12 篇核心语篇</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5">阅读 + 词句 + 理解 + 仿写</span>
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
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Units</div>
            <h2 className="mt-1 font-display text-3xl text-secondary">本册语篇结构</h2>
          </div>
          <p className="max-w-xl text-right text-sm leading-6 text-slate-500">
            每个单元都按教材原顺序展开。点击语篇先看任务路径，再进入沉浸式阅读。
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {TEXTBOOK_UNITS.map((unit) => (
            <section
              key={unit.unitNumber}
              className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
            >
              <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(194,101,52,0.08),rgba(22,101,52,0.06))] px-6 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Unit {unit.unitNumber}</div>
                <h3 className="mt-2 font-display text-2xl text-secondary">{unit.theme}</h3>
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
    </div>
  );
}
