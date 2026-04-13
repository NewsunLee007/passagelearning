import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithClassAndName } from "../../features/auth/login";
import { TEXTBOOK_BOOKS } from "../../features/content/catalog";
import { TextbookDirectory } from "../components/TextbookDirectory";

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
    <div className="grid min-h-[calc(100dvh-8rem)] items-start gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <TextbookDirectory books={TEXTBOOK_BOOKS} interactive={false} />
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-7 lg:sticky lg:top-8 lg:max-w-[360px]">
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
