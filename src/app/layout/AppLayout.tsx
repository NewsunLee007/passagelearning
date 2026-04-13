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
  const [navOpen, setNavOpen] = useState(false);
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

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const articleMeta = useMemo(() => {
    const match = location.pathname.match(/^\/a\/([^/]+)/);
    return getTextbookArticle(match?.[1]);
  }, [location.pathname]);
  const currentBook = useMemo(() => getTextbookBookByArticle(articleMeta?.id), [articleMeta]);

  const showTopBar = useMemo(() => !location.pathname.startsWith("/t/"), [location.pathname]);
  const isRead = location.pathname.includes("/read");
  const isArticleRoute = location.pathname.startsWith("/a/");
  const navItems = [
    { to: "/dashboard", label: "学习大厅" },
    { to: "/me/report", label: "我的报告" }
  ];

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

      <div className="min-w-0">
      {showTopBar && (
        <header className="sticky top-0 z-40 border-b border-white/60 bg-[rgba(244,247,247,0.92)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <button className="text-left leading-tight" onClick={() => nav(session.studentName ? "/dashboard" : "/login")} type="button">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">初中英语</div>
              <div className="font-display text-xl text-secondary">互动阅读</div>
            </button>

            <div className="hidden md:flex items-center gap-1 ml-6">
              {navItems.map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      active ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
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
                className="rounded-full px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
              >
                词汇学习
              </a>
              <Link to="/t/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                教师端
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {session.studentName ? (
                <div className="hidden text-sm text-slate-500 md:block">{[session.className, session.studentName].filter(Boolean).join(" · ")}</div>
              ) : null}
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                onClick={() => setMode((current) => (current === "classroom" ? "normal" : "classroom"))}
                aria-pressed={mode === "classroom"}
              >
                {mode === "classroom" ? "标准" : "大屏"}
              </button>
              <button
                type="button"
                className="md:hidden rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                onClick={() => setNavOpen((value) => !value)}
                aria-expanded={navOpen}
              >
                菜单
              </button>
            </div>
          </div>

          {navOpen ? (
            <div className="md:hidden border-t border-white/60 bg-white/88">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
                {navItems.map((item) => {
                  const active = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-medium transition",
                        active ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
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
                  className="rounded-full px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
                >
                  词汇学习
                </a>
                <Link to="/t/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  教师端
                </Link>
              </div>
            </div>
          ) : null}
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
      </div>
    </div>
  );
}
