import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArticleSubnav } from "../components/ArticleSubnav";
import { getSession } from "../../features/auth/session";
import { getTextbookArticle, getTextbookBookByArticle } from "../../features/content/catalog";

type ScreenMode = "normal" | "classroom";

function getInitialMode(): ScreenMode {
  const saved = window.localStorage.getItem("screenMode");
  return saved === "classroom" ? "classroom" : "normal";
}

export function AppLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<ScreenMode>(() => getInitialMode());
  const [sidebarScrolling, setSidebarScrolling] = useState(false);
  const session = getSession();
  const scrollResetRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.dataset.screen = mode;
    window.localStorage.setItem("screenMode", mode);
  }, [mode]);

  useEffect(() => {
    return () => {
      if (scrollResetRef.current) {
        window.clearTimeout(scrollResetRef.current);
      }
    };
  }, []);

  const articleMeta = useMemo(() => {
    const match = location.pathname.match(/^\/a\/([^/]+)/);
    return getTextbookArticle(match?.[1]);
  }, [location.pathname]);
  const currentBook = useMemo(() => getTextbookBookByArticle(articleMeta?.id), [articleMeta]);

  const showTopBar = useMemo(() => !location.pathname.startsWith("/t/"), [location.pathname]);
  const isRead = location.pathname.includes("/read");
  const isArticleRoute = location.pathname.startsWith("/a/");

  function switchAccount() {
    window.localStorage.removeItem("className");
    window.localStorage.removeItem("studentName");
    window.localStorage.removeItem("classId");
    window.localStorage.removeItem("userId");
    nav("/login");
  }

  function handleSidebarScroll() {
    setSidebarScrolling(true);
    if (scrollResetRef.current) {
      window.clearTimeout(scrollResetRef.current);
    }
    scrollResetRef.current = window.setTimeout(() => setSidebarScrolling(false), 720);
  }

  return (
    <div className={["min-h-dvh", showTopBar && isArticleRoute && currentBook ? "lg:grid lg:grid-cols-[228px_minmax(0,1fr)]" : ""].join(" ")}>
      {showTopBar && isArticleRoute && currentBook ? (
        <aside
          className={[
            "ir-scroll-shell hidden border-r border-white/60 bg-[rgba(244,247,247,0.84)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:px-4 lg:py-5",
            sidebarScrolling ? "is-scrolling" : ""
          ].join(" ")}
          onScroll={handleSidebarScroll}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Current Book</div>
          <div className="mt-2 font-display text-2xl text-secondary">{currentBook.label}</div>

          <div className="mt-6 space-y-4">
            {currentBook.units.map((unit) => (
              <section key={`${currentBook.id}-${unit.unitNumber}`} className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Unit {unit.unitNumber}
                </div>
                <div className="text-sm font-medium text-secondary">{unit.theme}</div>
                <div className="space-y-1">
                  {unit.articles.map((article) => {
                    const active = article.id === articleMeta?.id;
                    return (
                      <Link
                        key={article.id}
                        to={`/a/${article.id}`}
                        className={[
                          "block rounded-2xl px-3 py-2.5 text-sm transition",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-slate-700 hover:bg-white/80"
                        ].join(" ")}
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{article.stageLabel}</div>
                        <div className="mt-1 leading-6">{article.title}</div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="min-w-0 animate-fade-in">
      {showTopBar && (
        <header className="sticky top-0 z-40 border-b border-white/60 bg-[rgba(244,247,247,0.92)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <button className="flex items-center gap-3 text-left leading-tight" onClick={() => nav(session.studentName ? "/dashboard" : "/login")} type="button">
              <img src="https://p.ipic.vip/lmzked.jpg" alt="互动阅读 Logo" className="h-9 w-9 rounded-xl object-cover shadow-sm" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">初中英语</div>
                <div className="font-display text-xl text-secondary">互动阅读</div>
              </div>
            </button>

            <div className="ml-auto flex max-w-[70vw] items-center justify-end gap-2 overflow-x-auto">
              <Link
                to={session.studentName ? "/dashboard" : "/login"}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                返回主页
              </Link>
              <a
                href="https://wordflow.newsunenglish.com/"
                target="_blank"
                rel="noreferrer"
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-semibold text-primary transition hover:border-slate-300 hover:bg-white"
              >
                词汇学习
              </a>
              <Link
                to="/t/login"
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                教师端口
              </Link>
              <button
                type="button"
                className={[
                  "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition",
                  mode === "classroom"
                    ? "border-primary/10 bg-primary/10 text-primary shadow-[0_12px_28px_rgba(47,110,99,0.12)]"
                    : "border-slate-200 bg-white/86 text-slate-700 hover:border-slate-300 hover:bg-white"
                ].join(" ")}
                onClick={() => setMode((current) => (current === "classroom" ? "normal" : "classroom"))}
                aria-pressed={mode === "classroom"}
              >
                大屏展示
              </button>
              {session.studentName ? (
                <div className="whitespace-nowrap rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-700">
                  {[session.className, session.studentName].filter(Boolean).join(" · ")}
                </div>
              ) : null}
              {session.studentName ? (
                <Link
                  to="/me/report"
                  className={[
                    "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition",
                    location.pathname.startsWith("/me/report")
                      ? "border-primary/10 bg-primary text-white shadow-[0_12px_28px_rgba(47,110,99,0.22)]"
                      : "border-slate-200 bg-white/86 text-slate-700 hover:border-slate-300 hover:bg-white"
                  ].join(" ")}
                >
                  学习报告
                </Link>
              ) : null}
              {session.studentName ? (
                <button
                  type="button"
                  onClick={switchAccount}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  退出
                </button>
              ) : null}
            </div>
          </div>
        </header>
      )}

      {showTopBar && articleMeta ? (
        <div>
          <ArticleSubnav article={articleMeta} showHeader={false} />
        </div>
      ) : null}

      <main
        className={
          isRead
            ? "px-0 py-0 lg:px-8 lg:py-8"
            : isArticleRoute
              ? "px-4 py-5 sm:px-6 lg:px-8 lg:py-6"
              : "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
        }
      >
        {<Outlet />}
      </main>
      {showTopBar ? (
        <footer className="border-t border-white/70 bg-white/55 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-secondary">初中英语互动阅读</span>
              <span className="text-slate-400">·</span>
              <span>© {new Date().getFullYear()} Newsun English</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-500">
              <a className="hover:text-secondary" href="https://wordflow.newsunenglish.com/" target="_blank" rel="noreferrer">
                词汇学习
              </a>
              <a className="hover:text-secondary" href="https://github.com/NewsunLee007/passagelearning" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>
        </footer>
      ) : null}
      </div>
    </div>
  );
}
