import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";
import { getSession } from "../../features/auth/session";
import { saveAttempt } from "../../features/storage/attempts";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function VocabRoute() {
  const { articleId } = useParams();
  const { data, loading, error } = useArticleDemo(articleId);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const items = data?.vocabItems ?? [];
  const item = items[idx];

  const options = useMemo(() => {
    if (!item) return [];
    const opts = [item.meaningZh, ...(item.distractorsZh ?? [])].filter(Boolean);
    return shuffle(Array.from(new Set(opts)));
  }, [item]);

  const correct = checked && selected === item?.meaningZh;

  async function onCheck() {
    if (!item || !selected) return;
    setChecked(true);
    const { userId, classId } = getSession();
    await saveAttempt({
      id: crypto.randomUUID(),
      userId,
      classId,
      articleId: data!.article.id,
      taskKey: `vocab:${item.id}`,
      answer: { selected },
      score: selected === item.meaningZh ? 1 : 0,
      durationMs: 0,
      createdAt: new Date().toISOString()
    });
  }

  function next() {
    setSelected(null);
    setChecked(false);
    setIdx((i) => Math.min(i + 1, items.length - 1));
  }

  function prev() {
    setSelected(null);
    setChecked(false);
    setIdx((i) => Math.max(i - 1, 0));
  }

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  if (!items.length) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold">词汇与短语</div>
        <p className="mt-2 text-sm text-slate-600">此文章暂未配置词汇任务。</p>
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
          词汇与短语 · {idx + 1}/{items.length}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="text-xs font-medium text-slate-500">请选择词义</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{item.term}</div>

        <div className="mt-4 grid gap-2">
          {options.map((opt) => {
            const active = selected === opt;
            const isCorrect = checked && opt === item.meaningZh;
            const isWrong = checked && active && opt !== item.meaningZh;
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
              {correct ? "正确！" : `再看一眼：正确答案是「${item.meaningZh}」`}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={idx === 0}
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-40"
            >
              上一题
            </button>
            <button
              type="button"
              onClick={next}
              disabled={idx >= items.length - 1}
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-40"
            >
              下一题
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          小提示：提交后回到原文，看看这个词出现在什么句子里，会更牢固。
        </p>
      </div>
    </div>
  );
}

