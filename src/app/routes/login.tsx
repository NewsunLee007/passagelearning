import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithClassAndName } from "../../features/auth/login";

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
      nav(`/dashboard`);
    } catch (e: any) {
      setErrMsg(String(e?.message ?? e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">开始学习</h1>
      <p className="mt-2 text-sm text-slate-600">
        先用“班级名称 + 学生姓名”进入示范文章。后续接入 Supabase 后会自动记录学习数据。
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border bg-white p-5">
        <label className="block">
          <div className="text-sm font-medium">班级名称</div>
          <input
            className="mt-2 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="例如：七（2）班"
            autoComplete="organization"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">学生姓名</div>
          <input
            className="mt-2 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="例如：李明"
            autoComplete="name"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit || submitting}
        >
          {submitting ? "正在进入…" : "进入文章"}
        </button>

        {errMsg && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errMsg}
          </div>
        )}
      </form>
    </div>
  );
}
