import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginTeacherWithCode } from "../../features/auth/teacherSession";

export function TeacherLoginRoute() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = useMemo(() => code.trim().length > 0, [code]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErr(null);
    try {
      await loginTeacherWithCode(code);
      nav("/t/dashboard");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "教师登录失败。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl py-12 px-4 sm:px-6 animate-fade-in">
      <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        <div className="bg-slate-50/50 p-8 sm:p-10 border-b border-slate-100">
          <h1 className="font-display text-[2rem] text-secondary">教师端登录</h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            输入教师口令进入文章管理与班级统计。部署后该口令由 Vercel 环境变量控制。
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-8 sm:p-10 space-y-6">
          <label className="block">
            <div className="text-sm font-bold text-slate-700 mb-2">教师口令</div>
            <input
              className="w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-5 py-4 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="输入 TEACHER_CODE"
              type="password"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-secondary px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            disabled={!canSubmit || submitting}
          >
            {submitting ? "验证中…" : "进入教师端"}
          </button>

          {err && <div className="rounded-[1rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{err}</div>}
        </form>
      </div>
    </div>
  );
}

