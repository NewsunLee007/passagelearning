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
    <div className="space-y-10 pb-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(47,110,99,0.14),rgba(217,130,76,0.16),rgba(59,130,246,0.12))] shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
        {/* 背景图片渐变融合 */}
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
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{[className, studentName].filter(Boolean).join(" · ")}</span>
            </div>
            <h1 
              className="text-4xl sm:text-[2.8rem] leading-[1.2] drop-shadow-md font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-primary"
              style={{ fontFamily: '"YouYuan", "STXingkai", "FZShuTi", "KaiTi", cursive' }}
            >
              欢迎来到互动阅读
            </h1>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Textbook Directory</div>
          <h2 className="mt-2 font-display text-3xl text-secondary sm:text-4xl">教材目录</h2>
        </div>

        <TextbookDirectory books={TEXTBOOK_BOOKS} />
      </section>
    </div>
  );
}
