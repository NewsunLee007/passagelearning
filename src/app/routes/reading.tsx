import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";
import { getSession } from "../../features/auth/session";
import { saveAttempt } from "../../features/storage/attempts";

type ReadingQuestion = {
  id: string;
  type: "single_choice";
  stem: string;
  options: string[];
  answer: string;
  rationaleZh?: string;
  evidenceSentenceIds?: string[];
};

export function ReadingRoute() {
  const { articleId } = useParams();
  const { data, loading, error } = useArticleDemo(articleId);
  const questions = (data?.readingQuestions ?? []) as ReadingQuestion[];
  const [idx, setIdx] = useState(0);
  const q = questions[idx];

  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const correct = checked && selected === q?.answer;

  const evidenceText = useMemo(() => {
    if (!q?.evidenceSentenceIds?.length || !data) return null;
    const map = new Map(data.sentences.map((s) => [s.id, s.text]));
    return q.evidenceSentenceIds.map((id) => map.get(id)).filter(Boolean).join(" ");
  }, [q, data]);

  async function onCheck() {
    if (!q || !selected) return;
    setChecked(true);
    const { userId, classId } = getSession();
    await saveAttempt({
      id: crypto.randomUUID(),
      userId,
      classId,
      articleId: data!.article.id,
      taskKey: `reading:${q.id}`,
      answer: { selected },
      score: selected === q.answer ? 1 : 0,
      durationMs: 0,
      createdAt: new Date().toISOString()
    });
  }

  function next() {
    setSelected(null);
    setChecked(false);
    setIdx((i) => Math.min(i + 1, questions.length - 1));
  }

  function prev() {
    setSelected(null);
    setChecked(false);
    setIdx((i) => Math.max(i - 1, 0));
  }

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  if (!questions.length) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold">篇章理解</div>
        <p className="mt-2 text-sm text-slate-600">此文章暂未配置阅读理解题。</p>
        <Link to={`/a/${data.article.id}`} className="mt-4 inline-block text-sm underline">
          返回文章
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to={`/a/${data.article.id}`} className="text-sm underline">
          ← 返回
        </Link>
        <div className="text-sm text-slate-600">
          篇章理解 · {idx + 1}/{questions.length}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="text-xs font-medium text-slate-500">问题</div>
        <div className="mt-2 text-lg font-semibold leading-7">{q.stem}</div>

        <div className="mt-4 grid gap-2">
          {q.options.map((opt) => {
            const active = selected === opt;
            const isCorrect = checked && opt === q.answer;
            const isWrong = checked && active && opt !== q.answer;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => !checked && setSelected(opt)}
                className={[
                  "rounded-lg border px-3 py-2 text-left text-sm",
                  active ? "border-slate-900" : "hover:bg-slate-50",
                  isCorrect ? "bg-emerald-50 border-emerald-200" : "",
                  isWrong ? "bg-red-50 border-red-200" : ""
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!checked ? (
            <button
              type="button"
              disabled={!selected}
              onClick={onCheck}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              提交
            </button>
          ) : (
            <div className={correct ? "text-sm font-semibold text-emerald-700" : "text-sm font-semibold text-red-700"}>
              {correct ? "正确！" : `正确答案：${q.answer}`}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={prev} disabled={idx === 0} className="rounded-md border px-3 py-2 text-sm disabled:opacity-40">
              上一题
            </button>
            <button
              type="button"
              onClick={next}
              disabled={idx >= questions.length - 1}
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-40"
            >
              下一题
            </button>
          </div>
        </div>

        {checked && (
          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
            {q.rationaleZh && (
              <div className="text-sm">
                <div className="font-semibold">解析</div>
                <div className="mt-1 text-slate-700">{q.rationaleZh}</div>
              </div>
            )}
            {evidenceText && (
              <div className="text-sm">
                <div className="font-semibold">原文依据</div>
                <div className="mt-1 text-slate-700">{evidenceText}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

