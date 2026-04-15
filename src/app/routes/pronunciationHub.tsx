import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSession } from "../../features/auth/session";
import { TEXTBOOK_BOOKS } from "../../features/content/catalog";
import { TextbookDirectory } from "../components/TextbookDirectory";

export function PronunciationHubRoute() {
  const nav = useNavigate();
  const session = getSession();

  useEffect(() => {
    if (!session.className.trim() || !session.studentName.trim()) {
      nav("/login", { replace: true });
    }
  }, [nav, session.className, session.studentName]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Pronunciation Challenge</div>
          <h1 className="font-display text-3xl text-secondary sm:text-4xl">跟读挑战</h1>
        </div>
        <Link to="/dashboard" className="rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white">
          ← 返回主页
        </Link>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_54px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="text-sm font-semibold text-slate-700">请选择册别 / 单元 / 文章</div>
        <div className="mt-4">
          <TextbookDirectory books={TEXTBOOK_BOOKS} buildArticleLink={(articleId) => `/a/${articleId}/pronunciation`} />
        </div>
      </div>
    </div>
  );
}

