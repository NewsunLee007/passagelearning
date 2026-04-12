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
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;
    setLoading(true);
    setErr(null);

    apiGet<ClassRow[]>("/api/teacher/classes", true)
      .then((rows) => {
        if (cancelled) return;
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
    setLoading(true);
    setErr(null);

    apiGet<{ studentsCount: number; attempts: AttemptRow[] }>(`/api/teacher/classes?classId=${encodeURIComponent(classId)}`, true)
      .then((payload) => {
        if (cancelled) return;
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
      readingRate: rate([...byPrefix("reading:"), ...byPrefix("reading-drawer:")])
    };
  }, [attempts]);

  if (!authed) return <Navigate to="/t/login" replace />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm underline">
            返回学生端
          </Link>
          <div className="text-sm text-slate-600">教师端统计</div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/t/articles" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            进入文章管理
          </Link>
          <button
            type="button"
            onClick={logoutTeacher}
            className="rounded-full border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            退出
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold">选择班级</div>
          <select className="rounded-md border px-3 py-2 text-sm" value={classId} onChange={(event) => setClassId(event.target.value)}>
            {classes.map((classRow) => (
              <option key={classRow.id} value={classRow.id}>
                {classRow.name}
              </option>
            ))}
          </select>
          {loading && <div className="text-sm text-slate-500">加载中…</div>}
        </div>

        {err && <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Stat label="学生数" value={studentsCount == null ? "—" : String(studentsCount)} />
          <Stat label="最近 500 次提交" value={String(stats.totalAttempts)} />
          <Stat label="词汇正确率" value={stats.vocabRate == null ? "—" : `${stats.vocabRate}%`} />
          <Stat label="拆句正确率" value={stats.sentenceRate == null ? "—" : `${stats.sentenceRate}%`} />
          <Stat label="阅读正确率" value={stats.readingRate == null ? "—" : `${stats.readingRate}%`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
