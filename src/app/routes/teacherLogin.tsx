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
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">教师端登录</h1>
      <p className="mt-2 text-sm text-slate-600">输入教师口令进入文章管理与班级统计。部署后该口令由 Vercel 环境变量控制。</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border bg-white p-5">
        <label className="block">
          <div className="text-sm font-medium">教师口令</div>
          <input
            className="mt-2 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="输入 TEACHER_CODE"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          disabled={!canSubmit || submitting}
        >
          {submitting ? "登录中…" : "进入教师端"}
        </button>

        {err && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      </form>
    </div>
  );
}

