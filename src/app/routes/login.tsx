import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithClassAndName } from "../../features/auth/login";
import { TEXTBOOK_BOOKS } from "../../features/content/catalog";

export function LoginRoute() {
  const nav = useNavigate();
  const [className, setClassName] = useState(() => window.localStorage.getItem("className") ?? "");
  const [studentName, setStudentName] = useState(() => window.localStorage.getItem("studentName") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => className.trim() && studentName.trim(), [className, studentName]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrMsg(null);
    try {
      await loginWithClassAndName({ className, studentName });
      nav("/dashboard");
    } catch (e: unknown) {
      setErrMsg(String((e as { message?: string })?.message ?? e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-8rem)] items-center gap-8 py-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.36em] text-primary/80">外研版 Junior English</div>
          <div className="font-display text-5xl leading-[1.02] text-secondary sm:text-6xl">初中英语</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TEXTBOOK_BOOKS.map((book) => {
            const articleCount = book.units.reduce((sum, unit) => sum + unit.articles.length, 0);
            return (
            <div
              key={book.id}
              className="rounded-[1.6rem] border border-white/75 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{book.shortLabel}</div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-semibold",
                    book.loaded ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  ].join(" ")}
                >
                  {book.loaded ? "已导入" : "待导入"}
                </span>
              </div>
              <div className="mt-2 font-display text-2xl text-secondary">{book.label}</div>
              <div className="mt-4 text-xs text-slate-500">
                {book.units.length} 个单元 · {articleCount} 篇语篇
              </div>
            </div>
          );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">学生登录</div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <label className="block">
            <div className="text-sm font-medium text-slate-700">班级名称</div>
            <input
              className="mt-2 w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="例如：七（14）班"
              autoComplete="organization"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-slate-700">学生姓名</div>
            <input
              className="mt-2 w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="例如：李明"
              autoComplete="name"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary/92 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!canSubmit || submitting}
          >
            {submitting ? "正在进入学习大厅…" : "进入学习大厅"}
          </button>

          {errMsg && (
            <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errMsg}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
