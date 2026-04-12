import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";
import { getSession } from "../../features/auth/session";
import { saveAttempt } from "../../features/storage/attempts";

type SentenceTask = {
  id: string;
  sentenceId: string;
  type: "chunk_reorder";
  promptZh?: string;
  chunks: { id: string; text: string; tag?: string }[];
  correctOrder: string[];
  focusPointsZh?: string[];
};

export function SentenceRoute() {
  const { articleId } = useParams();
  const { data, loading, error } = useArticleDemo(articleId);
  const tasks = (data?.sentenceTasks ?? []) as SentenceTask[];
  const [idx, setIdx] = useState(0);
  const task = tasks[idx];

  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const chunksById = useMemo(() => {
    const m = new Map<string, SentenceTask["chunks"][number]>();
    for (const c of task?.chunks ?? []) m.set(c.id, c);
    return m;
  }, [task]);

  const built = order.map((id) => chunksById.get(id)?.text ?? "").join(" ");
  const isComplete = task ? order.length === task.correctOrder.length : false;
  const isCorrect = checked && task ? order.join(",") === task.correctOrder.join(",") : false;

  function reset() {
    setOrder([]);
    setChecked(false);
  }

  function undo() {
    setOrder((o) => o.slice(0, -1));
    setChecked(false);
  }

  function addChunk(id: string) {
    if (checked) return;
    setOrder((o) => (o.includes(id) ? o : [...o, id]));
  }

  async function onCheck() {
    if (!task || !isComplete) return;
    setChecked(true);
    const { userId, classId } = getSession();
    await saveAttempt({
      id: crypto.randomUUID(),
      userId,
      classId,
      articleId: data!.article.id,
      taskKey: `sentence:${task.id}`,
      answer: { order },
      score: order.join(",") === task.correctOrder.join(",") ? 1 : 0,
      durationMs: 0,
      createdAt: new Date().toISOString()
    });
  }

  function next() {
    setIdx((i) => Math.min(i + 1, tasks.length - 1));
    reset();
  }

  function prev() {
    setIdx((i) => Math.max(i - 1, 0));
    reset();
  }

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  if (!tasks.length) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold">句子拆解</div>
        <p className="mt-2 text-sm text-slate-600">此文章暂未配置拆句任务。</p>
        <Link to={`/a/${data.article.id}`} className="mt-4 inline-block text-sm underline">
          返回文章
        </Link>
      </div>
    );
  }

  const sentence = data.sentences.find((s) => s.id === task.sentenceId)?.text ?? "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to={`/a/${data.article.id}`} className="text-sm underline">
          ← 返回
        </Link>
        <div className="text-sm text-slate-600">
          句子拆解 · {idx + 1}/{tasks.length}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="text-xs font-medium text-slate-500">目标句</div>
        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-900">{sentence}</div>

        <div className="mt-4 text-sm font-semibold">按顺序点击语块组成句子</div>
        {task.promptZh && <div className="mt-1 text-sm text-slate-600">{task.promptZh}</div>}

        <div className="mt-3 flex flex-wrap gap-2">
          {task.chunks.map((c) => {
            const used = order.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => addChunk(c.id)}
                disabled={used}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm",
                  used ? "opacity-40" : "hover:bg-slate-50"
                ].join(" ")}
                title={c.tag ?? ""}
              >
                {c.text}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border p-3">
          <div className="text-xs font-medium text-slate-500">你拼出的句子</div>
          <div className="mt-2 text-sm leading-6 text-slate-900">{built || "（请点击上方语块）"}</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={reset} className="rounded-md border px-3 py-2 text-sm">
            重置
          </button>
          <button type="button" onClick={undo} disabled={!order.length} className="rounded-md border px-3 py-2 text-sm disabled:opacity-40">
            撤销一步
          </button>

          {!checked ? (
            <button
              type="button"
              onClick={onCheck}
              disabled={!isComplete}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              提交
            </button>
          ) : (
            <div className={isCorrect ? "text-sm font-semibold text-emerald-700" : "text-sm font-semibold text-red-700"}>
              {isCorrect ? "正确！" : "还差一点：看提示再来一次。"}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={prev} disabled={idx === 0} className="rounded-md border px-3 py-2 text-sm disabled:opacity-40">
              上一题
            </button>
            <button
              type="button"
              onClick={next}
              disabled={idx >= tasks.length - 1}
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-40"
            >
              下一题
            </button>
          </div>
        </div>

        {!!task.focusPointsZh?.length && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <div className="text-sm font-semibold">本题关注点</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {task.focusPointsZh.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

