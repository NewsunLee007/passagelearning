import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getSession } from "../../features/auth/session";
import { apiGet } from "../../lib/api";

type LeaderboardRow = {
  rank: number;
  userId: string;
  studentName: string;
  points: number;
};

type Scope = "class" | "school";
type Period = "month" | "all";

export function LeaderboardRoute() {
  const session = getSession();
  const [scope, setScope] = useState<Scope>("class");
  const [period, setPeriod] = useState<Period>("month");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const authed = useMemo(() => session.className.trim() && session.studentName.trim(), [session.className, session.studentName]);
  const canSchool = Boolean(session.schoolCode.trim());

  useEffect(() => {
    if (!authed) return;
    if (scope === "school" && !canSchool) return;

    const query = new URLSearchParams();
    query.set("scope", scope);
    query.set("period", period);
    if (scope === "class") query.set("classId", session.classId);
    if (scope === "school") query.set("schoolCode", session.schoolCode);

    let cancelled = false;
    setLoading(true);
    setErr(null);
    apiGet<LeaderboardRow[]>(`/api/leaderboard?${query.toString()}`)
      .then((payload) => {
        if (cancelled) return;
        setRows(Array.isArray(payload) ? payload : []);
      })
      .catch((error) => {
        if (!cancelled) setErr(error instanceof Error ? error.message : "加载积分榜失败。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authed, canSchool, period, scope, session.classId, session.schoolCode]);

  if (!authed) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Leaderboard</div>
          <h1 className="font-display text-3xl text-secondary sm:text-4xl">积分榜</h1>
        </div>
        <Link to="/dashboard" className="rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white">
          ← 返回主页
        </Link>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_54px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScope("class")}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                scope === "class" ? "bg-primary text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              班内榜
            </button>
            <button
              type="button"
              onClick={() => canSchool && setScope("school")}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                scope === "school" ? "bg-primary text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                !canSchool ? "opacity-50 cursor-not-allowed" : ""
              ].join(" ")}
              disabled={!canSchool}
            >
              校内榜
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                period === "month" ? "bg-accent text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              本月榜
            </button>
            <button
              type="button"
              onClick={() => setPeriod("all")}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                period === "all" ? "bg-accent text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              历史总榜
            </button>
          </div>
        </div>

        {!canSchool ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            校内榜需要在登录时填写学校/机构代码。
          </div>
        ) : null}

        {err ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <div className="grid grid-cols-[64px_1fr_90px] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div>排名</div>
            <div>姓名</div>
            <div className="text-right">积分</div>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <div className="px-4 py-6 text-sm font-medium text-slate-500">正在加载…</div>
            ) : rows.length ? (
              rows.map((row) => {
                const mine = row.userId === session.userId;
                return (
                  <div
                    key={row.userId}
                    className={[
                      "grid grid-cols-[64px_1fr_90px] items-center px-4 py-3 text-sm",
                      mine ? "bg-primary/6" : ""
                    ].join(" ")}
                  >
                    <div className={["font-semibold", row.rank <= 3 ? "text-accent" : "text-slate-700"].join(" ")}>{row.rank}</div>
                    <div className={["min-w-0 truncate", mine ? "font-bold text-primary" : "text-slate-800"].join(" ")}>
                      {row.studentName}
                    </div>
                    <div className="text-right font-semibold text-slate-700">{row.points}</div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-sm text-slate-500">暂无积分数据。</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

