import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type ScreenMode = "normal" | "classroom";

function getInitialMode(): ScreenMode {
  const saved = window.localStorage.getItem("screenMode");
  return saved === "classroom" ? "classroom" : "normal";
}

export function AppLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<ScreenMode>(() => getInitialMode());

  useEffect(() => {
    document.documentElement.dataset.screen = mode;
    window.localStorage.setItem("screenMode", mode);
  }, [mode]);

  const showTopBar = useMemo(() => {
    if (location.pathname.startsWith("/t/")) return false;
    if (location.pathname.includes("/read")) return false;
    return true;
  }, [location.pathname]);

  const isRead = location.pathname.includes("/read");

  return (
    <div className="min-h-dvh">
      {showTopBar && (
        <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <button
              className="text-left text-base font-black leading-tight text-secondary"
              onClick={() => nav("/login")}
              type="button"
            >
              互动阅读
            </button>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/me/report" className="rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                我的报告
              </Link>
              <Link to="/t/login" className="rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                教师端
              </Link>
              <button
                type="button"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
                onClick={() => setMode((m) => (m === "classroom" ? "normal" : "classroom"))}
                aria-pressed={mode === "classroom"}
                title="课堂大屏：更大字号、更强对比"
              >
                {mode === "classroom" ? "大屏：开" : "大屏：关"}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={isRead ? "px-0 py-0" : "mx-auto max-w-5xl px-4 py-6"}>
        <Outlet />
      </main>
    </div>
  );
}
