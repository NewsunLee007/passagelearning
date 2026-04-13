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
      <section className="overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(47,110,99,0.14),rgba(217,130,76,0.16),rgba(59,130,246,0.12))] shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{[className, studentName].filter(Boolean).join(" · ")}</span>
            </div>
            <h1 className="font-display text-4xl leading-[1.02] text-secondary sm:text-5xl">欢迎来到互动阅读主页</h1>
            <p className="max-w-2xl text-base leading-8 text-slate-700">
              选一篇语篇进入沉浸式阅读：点词查义、点句解析、真人朗读、收藏与读后练习，一站完成课堂互动。
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full bg-white/72 px-4 py-2 text-sm font-semibold text-primary">点词</div>
              <div className="rounded-full bg-white/72 px-4 py-2 text-sm font-semibold text-primary">点句</div>
              <div className="rounded-full bg-white/72 px-4 py-2 text-sm font-semibold text-primary">朗读</div>
              <div className="rounded-full bg-white/72 px-4 py-2 text-sm font-semibold text-primary">练习</div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <img
              alt="课堂互动阅读插画"
              className="h-full w-full object-cover"
              src="https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Realistic%20photo%20of%20a%20bright%20modern%20middle%20school%20classroom%2C%20students%20reading%20English%20textbooks%20and%20tablets%2C%20teal%20and%20warm%20orange%20accents%2C%20soft%20sunlight%2C%20shallow%20depth%20of%20field%2C%20high%20quality%2C%20no%20text%2C%20no%20logo&image_size=landscape_16_9"
            />
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
