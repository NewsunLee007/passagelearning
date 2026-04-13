import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TEXTBOOK_BOOKS } from "../../features/content/catalog";
import { TextbookDirectory } from "../components/TextbookDirectory";

export function DashboardRoute() {
  const nav = useNavigate();

  const className = window.localStorage.getItem("className") ?? "";
  const studentName = window.localStorage.getItem("studentName") ?? "";

  useEffect(() => {
    if (!className.trim() || !studentName.trim()) {
      nav("/login", { replace: true });
    }
  }, [nav, className, studentName]);

  return (
    <div className="space-y-10 pb-10">
      <section className="space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Directory</div>
          <h2 className="mt-1 font-display text-3xl text-secondary">教材目录</h2>
        </div>

        <TextbookDirectory books={TEXTBOOK_BOOKS} />
      </section>
    </div>
  );
}
