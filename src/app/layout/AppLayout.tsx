import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArticleSubnav } from "../components/ArticleSubnav";
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
  const navItems = [
    { to: "/dashboard", label: "学习大厅" },
    { to: "/me/report", label: "我的报告" }
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      {showTopBar ? (
        <aside className="hidden border-r border-white/60 bg-[#f7f2e9]/88 lg:flex lg:min-h-dvh lg:flex-col lg:px-5 lg:py-6">
          <button className="text-left" onClick={() => nav(session.studentName ? "/dashboard" : "/login")} type="button">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Interactive Reader</div>
            <div className="mt-1 font-display text-3xl text-secondary">互动阅读</div>
          </button>

          {session.studentName ? (
            <div className="mt-8 rounded-[1.6rem] border border-white/70 bg-white/78 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">当前账号</div>
              <div className="mt-3 text-sm text-slate-500">{session.className}</div>
              <div className="mt-1 text-2xl font-semibold text-secondary">{session.studentName}</div>
            </div>
          ) : null}

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active ? "bg-secondary text-white" : "text-slate-700 hover:bg-white/80"
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="https://wordflow.newsunenglish.com/"
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl bg-white/76 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              智能词汇学习
            </a>
            <Link to="/t/login" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white/80">
              教师端
            </Link>
          </nav>

          {articleMeta ? (
            <div className="mt-8 rounded-[1.8rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(247,245,239,0.92))] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">当前文章</div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{articleMeta.unitLabel}</div>
              <div className="mt-2 font-display text-2xl leading-tight text-secondary">{articleMeta.title}</div>
              <div className="mt-2 inline-flex rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">{articleMeta.stageLabel}</div>
              <div className="mt-4">
                <ArticleSubnav article={articleMeta} orientation="vertical" showHeader={false} />
              </div>
            </div>
          ) : null}

          <div className="mt-auto space-y-3">
            <button
              type="button"
              className="w-full rounded-full border border-slate-200 bg-white/78 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
              onClick={() => setMode((current) => (current === "classroom" ? "normal" : "classroom"))}
              aria-pressed={mode === "classroom"}
            >
              {mode === "classroom" ? "切换到标准模式" : "切换到课堂大屏"}
            </button>
          </div>
        </aside>
      ) : null}

      <div className="min-w-0">
      {showTopBar && (
        <header className="sticky top-0 z-20 border-b border-white/60 bg-[#f6f2e9]/92 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
            <button className="text-left" onClick={() => nav(session.studentName ? "/dashboard" : "/login")} type="button">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Interactive Reader</div>
              <div className="font-display text-2xl text-secondary">互动阅读</div>
            </button>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {session.studentName ? (
                <div className="hidden rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-600 sm:block">
                  {session.className} · {session.studentName}
                </div>
              ) : null}
              <Link to="/dashboard" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/80">
                学习大厅
              </Link>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                onClick={() => setMode((current) => (current === "classroom" ? "normal" : "classroom"))}
                aria-pressed={mode === "classroom"}
              >
                {mode === "classroom" ? "标准" : "大屏"}
              </button>
            </div>
          </div>
        </header>
      )}

      {showTopBar && articleMeta ? (
        <div className="lg:hidden">
          <ArticleSubnav article={articleMeta} />
        </div>
      ) : null}

      <main className={isRead ? "px-0 py-0 lg:px-8 lg:py-8" : "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8"}>{<Outlet />}</main>
      </div>
    </div>
  );
}
