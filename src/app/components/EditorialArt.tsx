export function LibraryIllustration() {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#f7f1e5_0%,#f3efe9_38%,#edf4ee_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(194,101,52,0.18),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(22,101,52,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.4),transparent_60%)]" />
      <div className="absolute -left-6 bottom-0 h-40 w-40 rounded-full bg-white/55 blur-3xl" />
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="absolute left-10 top-12 flex items-end gap-4">
        <div className="h-28 w-12 rounded-[1.2rem] bg-[#1f7a4c]" />
        <div className="h-40 w-14 rounded-[1.2rem] bg-[#d16d38]" />
        <div className="h-24 w-11 rounded-[1.2rem] bg-[#243042]" />
        <div className="h-34 w-12 rounded-[1.2rem] bg-[#efe2c4]" />
        <div className="h-20 w-10 rounded-[1.2rem] bg-[#8e9b8c]" />
      </div>

      <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between gap-6">
        <div className="max-w-[220px]">
          <div className="font-display text-4xl leading-none text-secondary">六册</div>
          <div className="mt-3 h-[2px] w-20 rounded-full bg-primary/25" />
        </div>

        <div className="grid w-[42%] gap-3">
          <div className="rounded-[1.5rem] border border-white/80 bg-white/70 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]" />
          <div className="rounded-[1.5rem] border border-white/70 bg-white/62 px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]" />
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

      <div className="absolute bottom-6 left-8 right-8 h-10 rounded-full bg-white/45" />
    </div>
  );
}
