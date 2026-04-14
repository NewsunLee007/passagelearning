import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedFlags, setSubmittedFlags] = useState<Record<string, boolean>>({});
  const [showSummary, setShowSummary] = useState(false);

  const q = questions[idx];
  const selected = q ? answers[q.id] || null : null;
  const checked = q ? !!submittedFlags[q.id] : false;

  const correct = checked && selected === q?.answer;

  const evidenceText = useMemo(() => {
    if (!q?.evidenceSentenceIds?.length || !data) return null;
    const map = new Map(data.sentences.map((s) => [s.id, s.text]));
    return q.evidenceSentenceIds.map((id) => map.get(id)).filter(Boolean).join(" ");
  }, [q, data]);

  async function onCheck() {
    if (!q || !selected) return;
    setSubmittedFlags((prev) => ({ ...prev, [q.id]: true }));
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
    
    // Check if all questions are submitted
    if (Object.keys(submittedFlags).length + 1 >= questions.length) {
      setTimeout(() => setShowSummary(true), 1500); // show summary after a short delay
    }
  }

  function next() {
    setIdx((i) => Math.min(i + 1, questions.length - 1));
  }

  function prev() {
    setIdx((i) => Math.max(i - 1, 0));
  }

  function handleSelect(opt: string) {
    if (!checked && q) {
      setAnswers((prev) => ({ ...prev, [q.id]: opt }));
    }
  }

  function resetPractice() {
    setAnswers({});
    setSubmittedFlags({});
    setShowSummary(false);
    setIdx(0);
  }

  if (loading) return <div className="text-sm text-slate-600">正在加载…</div>;
  if (error || !data) return <div className="text-sm text-red-600">加载失败：{error ?? "unknown"}</div>;

  if (!questions.length) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-white/82 p-6 text-sm text-slate-500">
        此文章暂未配置阅读理解题。
      </div>
    );
  }

  if (showSummary) {
    let score = 0;
    for (const quest of questions) {
      if (answers[quest.id] === quest.answer) {
        score++;
      }
    }
    const percent = Math.round((score / questions.length) * 100);
    
    return (
      <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="bg-gradient-to-br from-primary to-emerald-600 p-10 text-center text-white">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="font-display text-4xl mb-2">练习完成！</h2>
            <p className="text-lg opacity-90">你已经完成了所有的阅读理解题目</p>
          </div>
          
          <div className="p-8 sm:p-12 text-center space-y-8">
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-sm font-semibold uppercase tracking-widest text-slate-400">答对题目</div>
                <div className="mt-2 text-4xl font-black text-secondary">{score} <span className="text-2xl text-slate-400">/ {questions.length}</span></div>
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-widest text-slate-400">正确率</div>
                <div className="mt-2 text-4xl font-black text-secondary">{percent}%</div>
              </div>
            </div>
            
            <div className="text-lg text-slate-600 font-medium">
              {percent === 100 ? "太棒了！完全正确，你的阅读理解能力非常出色！" : 
               percent >= 80 ? "很不错！大部分题目都答对了，继续保持！" :
               percent >= 60 ? "做得好！但还有提升空间，可以再回顾一下原文。" : 
               "再接再厉！多读几遍原文，仔细体会句子之间的逻辑关系。"}
            </div>
            
            <div className="pt-4 flex justify-center gap-4">
              <button onClick={() => setShowSummary(false)} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                查看答题解析
              </button>
              <button onClick={resetPractice} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary/90">
                重新挑战
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[1.8rem] border border-white/70 bg-white/88 p-5 shadow-[0_16px_56px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">篇章理解</div>
            <h1 className="mt-2 font-display text-3xl text-secondary">回到文本核对理解</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">这里保留单页答题，不再设置额外返回操作。做完之后继续用上方菜单切换即可。</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
            {idx + 1}/{questions.length}
          </span>
        </div>
      </section>

      <div className="rounded-[1.6rem] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
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
                onClick={() => handleSelect(opt)}
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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className={checked ? (correct ? "text-base font-bold text-emerald-600" : "text-base font-bold text-red-600") : ""}>
            {checked ? (correct ? "正确！" : `回答错误。正确答案：${q.answer}`) : ""}
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={prev} 
              disabled={idx === 0} 
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              上一题
            </button>
            {!checked ? (
              <button
                type="button"
                disabled={!selected}
                onClick={onCheck}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none"
              >
                提交
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                disabled={idx >= questions.length - 1}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                下一题
              </button>
            )}
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
