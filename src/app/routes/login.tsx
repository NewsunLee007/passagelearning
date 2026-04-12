import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithClassAndName } from "../../features/auth/login";
import { TEXTBOOK_UNITS } from "../../features/content/catalog";

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
        <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          七年级下册英语
        </div>
        <div className="space-y-4">
          <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-secondary sm:text-6xl">
            把教材语篇真正整理成可学习、可操作、可追踪的阅读流程。
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
            这里不再是散乱文章列表，而是按教材单元推进的互动阅读入口。先录入班级和姓名，再从每个单元的
            理解篇与写作篇开始学习。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TEXTBOOK_UNITS.map((unit) => (
            <div
              key={unit.unitNumber}
              className="rounded-[1.6rem] border border-white/75 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Unit {unit.unitNumber}</div>
              <div className="mt-2 font-display text-2xl text-secondary">{unit.theme}</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{unit.overview}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">学生登录</div>
        <h2 className="mt-3 font-display text-3xl text-secondary">先建立学习身份</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          目前使用“班级名称 + 学生姓名”进入系统。登录后会自动保存学习记录，并按教材目录进入阅读。
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
