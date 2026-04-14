import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginTeacherWithPassword, registerTeacher } from "../../features/auth/teacherSession";

export function TeacherLoginRoute() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const [regForm, setRegForm] = useState({
    name: "",
    phone: "",
    password: "",
    passwordConfirm: ""
  });

  const canSubmitLogin = useMemo(() => loginForm.username.trim() && loginForm.password.trim(), [loginForm]);
  const canSubmitReg = useMemo(() => regForm.name.trim() && regForm.phone.trim() && regForm.password.trim() && regForm.passwordConfirm.trim(), [regForm]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    if (!canSubmitLogin) return;

    setSubmitting(true);
    setErr(null);
    try {
      await loginTeacherWithPassword({ username: loginForm.username.trim(), password: loginForm.password });
      nav("/t/dashboard");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "教师登录失败。");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRegister(event: FormEvent) {
    event.preventDefault();
    if (!canSubmitReg) return;

    if (regForm.password !== regForm.passwordConfirm) {
      setErr("两次输入的密码不一致，请重新检查。");
      return;
    }

    setSubmitting(true);
    setErr(null);

    try {
      await registerTeacher({ name: regForm.name.trim(), phone: regForm.phone.trim(), password: regForm.password });
      await loginTeacherWithPassword({ username: regForm.phone.trim(), password: regForm.password });
      nav("/t/dashboard");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "教师注册失败。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-8rem)] items-start gap-8 py-6 lg:grid-cols-2 animate-fade-in relative">
      {/* 补充：返回主页控件 */}
      <Link 
        to="/" 
        className="absolute top-0 left-4 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-secondary lg:hidden"
      >
        ← 返回主页
      </Link>

      <section className="relative hidden lg:flex flex-col justify-center overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(47,110,99,0.14),rgba(217,130,76,0.16),rgba(59,130,246,0.12))] p-12 shadow-[0_20px_60px_rgba(15,23,42,0.06)] min-h-[500px]">
        <Link 
          to="/" 
          className="absolute top-8 left-8 z-50 flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white"
        >
          ← 返回主页
        </Link>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Teacher Portal</span>
          </div>
          <h1 className="text-4xl font-display leading-[1.2] text-secondary drop-shadow-sm">
            统一教师工作台
            <br />
            <span className="text-primary">赋能每一堂英语课</span>
          </h1>
          <p className="max-w-md text-lg text-slate-600 leading-relaxed">
            管理教学班级、掌控学情数据、编辑教材语篇。从这里开始，构建您的数字化课堂互动闭环。
          </p>
        </div>
        <div
          className="absolute inset-y-0 right-0 w-[80%] pointer-events-none"
          style={{
            maskImage: "linear-gradient(to left, black 40%, transparent)",
            WebkitMaskImage: "linear-gradient(to left, black 40%, transparent)"
          }}
        >
          <img
            alt="教师工作台"
            className="h-full w-full object-cover opacity-90 mix-blend-multiply"
            src="https://p.ipic.vip/7hrt3q.png"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-md lg:mt-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button
              className={`flex-1 py-5 text-base font-bold transition-colors ${mode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setMode('login')}
              type="button"
            >
              登录
            </button>
            <button
              className={`flex-1 py-5 text-base font-bold transition-colors ${mode === 'register' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setMode('register')}
              type="button"
            >
              教师注册
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={onLogin} className="p-8 sm:p-10 space-y-5">
              <label className="block">
                <div className="text-sm font-bold text-slate-700 mb-2">用户名 / 手机号</div>
                <input
                  className="w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-5 py-4 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                  value={loginForm.username}
                  onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
                  placeholder="请输入您的账号"
                  type="text"
                />
              </label>

              <label className="block">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-bold text-slate-700">密码</div>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-xs font-semibold text-primary hover:text-primary/80"
                  >
                    {showPassword ? "隐藏" : "显示"}
                  </button>
                </div>
                <input
                  className="w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-5 py-4 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  placeholder="请输入密码"
                  type={showPassword ? "text" : "password"}
                />
              </label>

              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-secondary px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                disabled={!canSubmitLogin || submitting}
              >
                {submitting ? "登录中…" : "进入工作台"}
              </button>

              {err && (
                <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{err}</div>
              )}
            </form>
          ) : (
            <form onSubmit={onRegister} className="p-8 sm:p-10 space-y-5 animate-fade-in">
              <label className="block">
                <div className="text-sm font-bold text-slate-700 mb-1.5">教师姓名</div>
                <input
                  className="w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="如：李老师"
                />
              </label>

              <label className="block">
                <div className="text-sm font-bold text-slate-700 mb-1.5">手机号码</div>
                <input
                  type="tel"
                  className="w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  placeholder="作为登录账号"
                />
              </label>

              <label className="block">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="text-sm font-bold text-slate-700">设置密码</div>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-xs font-semibold text-primary hover:text-primary/80"
                  >
                    {showPassword ? "隐藏" : "显示"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="至少 6 位"
                />
              </label>

              <label className="block">
                <div className="text-sm font-bold text-slate-700 mb-1.5">确认密码</div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-[1rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-base outline-none transition focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                  value={regForm.passwordConfirm}
                  onChange={(e) => setRegForm({ ...regForm, passwordConfirm: e.target.value })}
                  placeholder="请再次输入密码"
                />
              </label>

              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-primary px-6 py-4 text-base font-bold text-white shadow-[0_8px_20px_rgba(47,110,99,0.2)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                disabled={!canSubmitReg || submitting}
              >
                {submitting ? "正在提交…" : "免费注册"}
              </button>

              {err && <div className="rounded-[1rem] border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">{err}</div>}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
