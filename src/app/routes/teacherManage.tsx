import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isTeacherAuthed } from "../../features/auth/teacherSession";
import { apiGet, apiPost } from "../../lib/api";

type ClassRow = { id: string; name: string };
type StudentRow = { id: string; name: string; created_at: string };

function splitClassLabel(name: string) {
  if (!name.includes(":")) return { schoolCode: "", className: name };
  const [schoolCode, ...rest] = name.split(":");
  return { schoolCode, className: rest.join(":") };
}

export function TeacherManageRoute() {
  const authed = isTeacherAuthed();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [createClassForm, setCreateClassForm] = useState({ schoolCode: "", className: "" });
  const [createStudentForm, setCreateStudentForm] = useState({ studentName: "" });

  const selectedClass = useMemo(() => classes.find((c) => c.id === classId) ?? null, [classes, classId]);
  const selectedMeta = useMemo(() => (selectedClass ? splitClassLabel(selectedClass.name) : { schoolCode: "", className: "" }), [selectedClass]);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setLoading(true);
    apiGet<ClassRow[]>("/api/teacher/classes", true)
      .then((rows) => {
        if (cancelled) return;
        setClasses(rows);
        if (!classId && rows[0]?.id) setClassId(rows[0].id);
        setErr(null);
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
    apiGet<StudentRow[]>(`/api/teacher/students?classId=${encodeURIComponent(classId)}`, true)
      .then((rows) => {
        if (cancelled) return;
        setStudents(rows);
        setErr(null);
      })
      .catch((error) => {
        if (!cancelled) setErr(error instanceof Error ? error.message : "加载学生列表失败。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed, classId]);

  if (!authed) return <Navigate to="/t/login" replace />;

  async function onCreateClass(event: FormEvent) {
    event.preventDefault();
    const schoolCode = createClassForm.schoolCode.trim().toLowerCase();
    const className = createClassForm.className.trim();
    if (!className) return;

    setLoading(true);
    setErr(null);
    try {
      const row = await apiPost<ClassRow>("/api/teacher/classes", { schoolCode, className }, true);
      const next = [row, ...classes.filter((c) => c.id !== row.id)];
      setClasses(next);
      setClassId(row.id);
      setCreateClassForm({ schoolCode: "", className: "" });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "创建班级失败。");
    } finally {
      setLoading(false);
    }
  }

  async function onCreateStudent(event: FormEvent) {
    event.preventDefault();
    if (!classId) return;
    const studentName = createStudentForm.studentName.trim();
    if (!studentName) return;

    setLoading(true);
    setErr(null);
    try {
      await apiPost("/api/teacher/students", { classId, studentName }, true);
      const rows = await apiGet<StudentRow[]>(`/api/teacher/students?classId=${encodeURIComponent(classId)}`, true);
      setStudents(rows);
      setCreateStudentForm({ studentName: "" });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "创建学生失败。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in max-w-5xl mx-auto pt-6 px-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link to="/t/dashboard" className="text-sm font-semibold text-slate-500 hover:text-secondary transition">
            ← 返回统计
          </Link>
          <div className="h-4 w-px bg-slate-300" />
          <div className="text-sm font-bold text-secondary">学校 / 班级 / 学生管理</div>
        </div>
      </div>

      {err && <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="text-base font-bold text-secondary">创建班级</div>
          <form onSubmit={onCreateClass} className="mt-4 space-y-4">
            <label className="block">
              <div className="text-sm font-semibold text-slate-700 mb-2">学校代码（可选）</div>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                value={createClassForm.schoolCode}
                onChange={(event) => setCreateClassForm({ ...createClassForm, schoolCode: event.target.value })}
                placeholder="如：newsun"
              />
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-600">说明：</strong>如果你们学校不同老师创建了同名班级（比如都有“七年级1班”），为了避免数据冲突，建议填入一个本校专用的拼音或英文缩写代码。
                <br />留空则直接创建“七年级1班”。
              </p>
            </label>
            <label className="block">
              <div className="text-sm font-semibold text-slate-700 mb-2">班级名称</div>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
                value={createClassForm.className}
                onChange={(event) => setCreateClassForm({ ...createClassForm, className: event.target.value })}
                placeholder="如：七年级1班"
              />
            </label>
            <button
              type="submit"
              disabled={loading || !createClassForm.className.trim()}
              className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "处理中…" : "创建班级"}
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-base font-bold text-secondary">班级学生</div>
            <select
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
            >
              {classes.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name.includes(":") ? `${row.name.split(":")[1]} (${row.name.split(":")[0]})` : row.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <div className="mt-4 rounded-xl border border-slate-100 bg-amber-50/50 px-4 py-3 text-sm text-slate-700">
              <strong className="text-amber-800">学生登录填写规范：</strong>
              <ul className="mt-1 list-disc pl-5 text-amber-700/80 space-y-1">
                <li>学校代码：<span className="font-mono font-bold text-amber-900">{selectedMeta.schoolCode || "（留空不填）"}</span></li>
                <li>班级：<span className="font-mono font-bold text-amber-900">{selectedMeta.className}</span></li>
              </ul>
            </div>
          )}

          <form onSubmit={onCreateStudent} className="mt-4 flex gap-3">
            <input
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
              value={createStudentForm.studentName}
              onChange={(event) => setCreateStudentForm({ studentName: event.target.value })}
              placeholder="输入学生姓名"
            />
            <button
              type="submit"
              disabled={loading || !classId || !createStudentForm.studentName.trim()}
              className="rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              添加
            </button>
          </form>

          <div className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-xs text-slate-500 shadow-sm">
                <tr>
                  <th className="px-4 py-3">学生</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {students.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.id}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {!students.length && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={3}>
                      暂无学生。可在上方输入姓名添加，或让学生直接在学生端登录时自动加入班级。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
