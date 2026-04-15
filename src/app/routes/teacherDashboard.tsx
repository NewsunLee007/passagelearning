import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isTeacherAuthed, logoutTeacher } from "../../features/auth/teacherSession";
import { apiGet } from "../../lib/api";

type ClassRow = { id: string; name: string };
type AttemptRow = { task_key: string; score: number };

export function TeacherDashboardRoute() {
  const authed = isTeacherAuthed();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    apiGet<ClassRow[]>("/api/teacher/classes", true)
      .then((rows) => {
        if (cancelled) return;
        setErr(null);
        setClasses(rows);
        if (!classId && rows[0]?.id) setClassId(rows[0].id);
      })
      .catch((error) => {
        if (!cancelled) setErr(error instanceof Error ? error.message : "加载班级失败。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authed, classId]);

  useEffect(() => {
    if (!authed || !classId) return;

    let cancelled = false;

    apiGet<{ studentsCount: number; attempts: AttemptRow[] }>(`/api/teacher/classes?classId=${encodeURIComponent(classId)}`, true)
      .then((payload) => {
        if (cancelled) return;
        setErr(null);
        setStudentsCount(payload.studentsCount);
        setAttempts(payload.attempts);
      })
      .catch((error) => {
        if (!cancelled) setErr(error instanceof Error ? error.message : "加载统计失败。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authed, classId]);

  const stats = useMemo(() => {
    const byPrefix = (prefix: string) => attempts.filter((attempt) => attempt.task_key.startsWith(prefix));
    const rate = (rows: AttemptRow[]) => {
      if (!rows.length) return null;
      const sum = rows.reduce((total, item) => total + Number(item.score || 0), 0);
      return Math.round((sum / rows.length) * 100);
    };

    return {
      totalAttempts: attempts.length,
      vocabRate: rate(byPrefix("vocab:")),
      sentenceRate: rate(byPrefix("sentence:")),
      pronunciationRate: rate(byPrefix("pronunciation:")),
      readingRate: rate([...byPrefix("reading:"), ...byPrefix("reading-drawer:")])
    };
  }, [attempts]);

  if (!authed) return <Navigate to="/t/login" replace />;

  return (
    <div className="space-y-6 pb-10 animate-fade-in max-w-5xl mx-auto pt-6 px-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-secondary transition">
            ← 返回主页
          </Link>
          <div className="h-4 w-px bg-slate-300"></div>
          <div className="text-sm font-bold text-secondary">教师端统计</div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/t/manage" className="rounded-full border border-primary/20 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/15 transition">
            班级/学生管理
          </Link>
          <Link to="/t/articles" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition">
            进入文章管理
          </Link>
          <button
            type="button"
            onClick={() => {
              logoutTeacher();
              window.location.href = "/";
            }}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            退出
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-6">
          <div className="text-base font-bold text-secondary">选择班级</div>
          <select
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10 transition"
            value={classId}
            onChange={(event) => {
              setLoading(true);
              setErr(null);
              setClassId(event.target.value);
            }}
          >
            {classes.map((classRow) => (
              <option key={classRow.id} value={classRow.id}>
                {classRow.name.includes(":") ? `${classRow.name.split(":")[1]} (${classRow.name.split(":")[0]})` : classRow.name}
              </option>
            ))}
          </select>
          {loading && <div className="text-sm font-medium text-slate-500 animate-pulse">正在同步数据…</div>}
        </div>

        {err && <div className="mt-6 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Stat label="学生数" value={studentsCount == null ? "—" : String(studentsCount)} />
          <Stat label="最近 500 次提交" value={String(stats.totalAttempts)} />
          <Stat label="跟读平均分" value={stats.pronunciationRate == null ? "—" : `${stats.pronunciationRate}分`} />
          <Stat label="词汇正确率" value={stats.vocabRate == null ? "—" : `${stats.vocabRate}%`} />
          <Stat label="拆句正确率" value={stats.sentenceRate == null ? "—" : `${stats.sentenceRate}%`} />
          <Stat label="阅读正确率" value={stats.readingRate == null ? "—" : `${stats.readingRate}%`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm ${className}`}>
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-black text-secondary">{value}</div>
    </div>
  );
}
