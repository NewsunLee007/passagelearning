import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TEXTBOOK_BOOKS } from "../../features/content/catalog";
import { TextbookDirectory } from "../components/TextbookDirectory";

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
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_272px] lg:items-start">
        <div className="space-y-5 pt-2">
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

        <div className="rounded-[1.8rem] border border-white/70 bg-white/84 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] lg:ml-auto lg:w-full lg:max-w-[272px]">
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
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Directory</div>
          <h2 className="mt-1 font-display text-3xl text-secondary">教材目录</h2>
        </div>

        <TextbookDirectory books={TEXTBOOK_BOOKS} />
      </section>
    </div>
  );
}
