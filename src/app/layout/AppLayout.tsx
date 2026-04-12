import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getSession } from "../../features/auth/session";
import { getTextbookArticle } from "../../features/content/catalog";

type ScreenMode = "normal" | "classroom";

function getInitialMode(): ScreenMode {
  const saved = window.localStorage.getItem("screenMode");
  return saved === "classroom" ? "classroom" : "normal";
}

export function AppLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<ScreenMode>(() => getInitialMode());
  const session = getSession();

  useEffect(() => {
    document.documentElement.dataset.screen = mode;
    window.localStorage.setItem("screenMode", mode);
  }, [mode]);

  const articleMeta = useMemo(() => {
    const match = location.pathname.match(/^\/a\/([^/]+)/);
    return getTextbookArticle(match?.[1]);
  }, [location.pathname]);

  const showTopBar = useMemo(() => !location.pathname.startsWith("/t/"), [location.pathname]);
  const isRead = location.pathname.includes("/read");

  return (
    <div className="min-h-dvh">
      {showTopBar && (
        <header className="sticky top-0 z-20 border-b border-white/60 bg-[#f6f2e9]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
            <button className="text-left" onClick={() => nav(session.studentName ? "/dashboard" : "/login")} type="button">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Interactive Reader</div>
              <div className="font-display text-2xl text-secondary">互动阅读</div>
            </button>

            {articleMeta && !isRead && (
              <div className="hidden min-w-0 flex-1 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-600 lg:block">
                <span className="font-medium text-secondary">{articleMeta.unitLabel}</span>
                <span className="mx-2 text-slate-300">/</span>
                <span>{articleMeta.title}</span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {session.studentName ? (
                <div className="hidden rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-600 md:block">
                  {session.className} · {session.studentName}
                </div>
              ) : null}
              <Link to="/dashboard" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/80">
                学习大厅
              </Link>
              <Link to="/me/report" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/80">
                我的报告
              </Link>
              <Link to="/t/login" className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                教师端
              </Link>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                onClick={() => setMode((current) => (current === "classroom" ? "normal" : "classroom"))}
                aria-pressed={mode === "classroom"}
                title="课堂大屏：更大字号、更强对比"
              >
                {mode === "classroom" ? "大屏模式" : "标准模式"}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={isRead ? "px-0 py-0" : "mx-auto max-w-6xl px-4 py-6 sm:px-6"}>{<Outlet />}</main>
    </div>
  );
}
