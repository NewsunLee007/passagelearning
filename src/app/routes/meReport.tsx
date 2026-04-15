import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getSession } from "../../features/auth/session";
import { TEXTBOOK_ARTICLES } from "../../features/content/catalog";
import { loadAllAttempts, type Attempt } from "../../features/storage/attempts";
import { loadAllQuotes, type Quote } from "../../features/storage/quotes";

export function MeReportRoute() {
  const session = getSession();
  const articlesMap = useMemo(() => {
    const map = new Map<string, string>();
    TEXTBOOK_ARTICLES.forEach((article) => map.set(article.id, article.title));
    return map;
  }, []);
  const attempts = useMemo<Attempt[]>(() => loadAllAttempts(session.userId), [session.userId]);
  const quotes = useMemo<Quote[]>(() => loadAllQuotes(session.userId), [session.userId]);

  const byType = (prefix: string) => attempts.filter((a) => a.taskKey.startsWith(prefix));
  const rate = (arr: typeof attempts) => {
    if (!arr.length) return null;
    const sum = arr.reduce((s, a) => s + (Number(a.score) || 0), 0);
    return Math.round((sum / arr.length) * 100);
  };

  const vocab = byType("vocab:");
  const sentence = byType("sentence:");
  const pronunciation = byType("pronunciation:");
  const reading = byType("reading:");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-sm underline">
          ← 回学习大厅
        </Link>
        <div className="text-sm text-slate-600">我的学习报告 (全记录)</div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold">总体学习概览</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="总提交次数" value={String(attempts.length)} />
          <Stat label="总收藏句子数" value={String(quotes.length)} />
          <Stat label="跟读平均分" value={rate(pronunciation) == null ? "—" : `${rate(pronunciation)}分`} />
          <Stat label="词汇总体正确率" value={rate(vocab) == null ? "—" : `${rate(vocab)}%`} />
          <Stat label="拆句总体正确率" value={rate(sentence) == null ? "—" : `${rate(sentence)}%`} />
          <Stat label="阅读总体正确率" value={rate(reading) == null ? "—" : `${rate(reading)}%`} />
          <Stat label="当前身份" value={[session.className, session.studentName].filter(Boolean).join(" · ") || "—"} />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          说明：本报告已聚合您在所有文章中的学习数据。此数据基于浏览器本地记录。
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold">最近 15 次提交记录</div>
        {attempts.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-2 pr-3">时间</th>
                  <th className="py-2 pr-3">所属文章</th>
                  <th className="py-2 pr-3">任务题号</th>
                  <th className="py-2 pr-3">得分</th>
                </tr>
              </thead>
              <tbody>
                {attempts
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 15)
                  .map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="py-2 pr-3 text-slate-600">{new Date(a.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-3 text-slate-700">{articlesMap.get(a.articleId) || a.articleId}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{a.taskKey}</td>
                      <td className="py-2 pr-3">
                        {a.taskKey.startsWith("pronunciation:") ? (
                          <span className={a.score >= 0.8 ? "text-emerald-600" : a.score >= 0.6 ? "text-amber-600" : "text-rose-600"}>
                            {Math.round(Number(a.score) * 100)} 分
                          </span>
                        ) : (
                          <span className={a.score === 1 ? "text-emerald-600" : "text-red-600"}>
                            {a.score}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">还没有提交记录。先去文章里做几道题再回来看看。</p>
        )}
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
