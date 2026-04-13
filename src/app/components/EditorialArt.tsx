export function LibraryIllustration() {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#f7f1e5_0%,#f3efe9_38%,#edf4ee_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(194,101,52,0.18),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(22,101,52,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.4),transparent_60%)]" />
      <div className="absolute -left-6 bottom-0 h-40 w-40 rounded-full bg-white/55 blur-3xl" />
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="absolute left-8 top-10 flex items-end gap-3">
        <div className="h-28 w-10 rounded-[1rem] bg-[#1f7a4c]" />
        <div className="h-36 w-12 rounded-[1rem] bg-[#d16d38]" />
        <div className="h-24 w-10 rounded-[1rem] bg-[#243042]" />
        <div className="h-32 w-12 rounded-[1rem] bg-[#efe2c4]" />
      </div>

      <div className="absolute left-7 top-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Reading Shelf</div>
      <div className="absolute bottom-7 left-8 max-w-[220px]">
        <div className="font-display text-3xl leading-none text-secondary">六册联动</div>
        <div className="mt-3 text-sm leading-6 text-slate-600">课文、词句、音频按同一教材骨架组织，不再零散堆叠。</div>
      </div>

      <div className="absolute right-7 top-7 w-[44%] rounded-[1.6rem] border border-white/80 bg-white/82 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Current</div>
            <div className="mt-1 font-display text-2xl text-secondary">七下 · 八下</div>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">已导入</div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">22 篇真人课文音频</div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">词句解析统一进入同一学习路径</div>
        </div>
      </div>
    </div>
  );
}

export function ReadingIllustration() {
  return (
    <div className="relative h-[190px] overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#f4efe6_0%,#f8f6f1_44%,#eef5ee_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(194,101,52,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(22,101,52,0.14),transparent_30%)]" />
      <div className="absolute left-8 top-7 h-24 w-32 rounded-[1.6rem] border border-white/80 bg-white/72 shadow-[0_18px_40px_rgba(15,23,42,0.05)]" />
      <div className="absolute left-12 top-11 h-2 w-16 rounded-full bg-slate-300/70" />
      <div className="absolute left-12 top-18 h-2 w-20 rounded-full bg-slate-200/90" />
      <div className="absolute left-12 top-25 h-2 w-14 rounded-full bg-slate-200/90" />

      <div className="absolute right-8 top-9 w-28 rounded-[1.4rem] border border-white/80 bg-white/80 px-4 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <div className="h-2 w-10 rounded-full bg-primary/25" />
        <div className="mt-3 h-2 w-16 rounded-full bg-slate-200/90" />
        <div className="mt-2 h-2 w-12 rounded-full bg-slate-200/90" />
      </div>

      <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Reading Workspace</div>
          <div className="mt-2 font-display text-2xl text-secondary">紧凑阅读区</div>
          <div className="mt-2 text-sm text-slate-600">保留原文、朗读和词句入口，去掉无效大块留白。</div>
        </div>
        <div className="hidden rounded-full bg-white/75 px-4 py-2 text-xs font-semibold text-slate-600 sm:block">移动端优先</div>
      </div>
    </div>
  );
}
