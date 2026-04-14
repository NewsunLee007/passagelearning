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
    <div className="grid min-h-[calc(100dvh-8rem)] items-start gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_360px] animate-fade-in">
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(47,110,99,0.14),rgba(217,130,76,0.16),rgba(59,130,246,0.12))] shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div 
            className="absolute inset-y-0 right-0 w-[60%] pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to left, black 40%, transparent)',
              WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent)',
            }}
          >
            <img
              alt="互动阅读插画"
              className="h-full w-full object-cover opacity-95 mix-blend-multiply"
              src="https://p.ipic.vip/7hrt3q.png"
            />
          </div>

          <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-center min-h-[220px]">
            <div className="space-y-4 max-w-xl">
              <h1 
                className="text-4xl sm:text-[2.8rem] leading-[1.2] drop-shadow-md font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-primary"
                style={{ fontFamily: '"YouYuan", "STXingkai", "FZShuTi", "KaiTi", cursive' }}
              >
                欢迎来到互动阅读
              </h1>
            </div>
          </div>
        </div>

        <TextbookDirectory books={TEXTBOOK_BOOKS} interactive={false} />
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-7 lg:sticky lg:top-8 lg:max-w-[360px]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">学生登录</div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <label className="block">
            <div className="text-sm font-medium text-slate-700">学校 / 机构代码 (选填)</div>
            <input
              className="mt-1.5 w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              placeholder="例如：newsun"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-slate-700">班级名称</div>
            <input
              type="number"
              className="mt-1.5 w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="数字格式，例如：701"
              autoComplete="organization"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-slate-700">学生姓名</div>
            <input
              className="mt-1.5 w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="例如：李明"
              autoComplete="name"
            />
          </label>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              className="w-full rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-secondary/92 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
              disabled={!canSubmit || submitting}
            >
              {submitting ? "正在进入学习大厅…" : "进入学习大厅"}
            </button>
            
            <button
              type="button"
              onClick={async () => {
                setClassName("000");
                setStudentName("体验用户");
                setSubmitting(true);
                try {
                  await loginWithClassAndName({ className: "000", studentName: "体验用户" });
                  nav("/dashboard");
                } catch (e: unknown) {
                  setErrMsg(String((e as { message?: string })?.message ?? e));
                  setSubmitting(false);
                }
              }}
              className="w-full rounded-full border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              免注册体验
            </button>
          </div>

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
