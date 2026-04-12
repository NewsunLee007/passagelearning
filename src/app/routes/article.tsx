import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useArticleDemo } from "../../features/content/useArticleDemo";

export function ArticleHomeRoute() {
  const { articleId } = useParams();
  const { data, error, loading } = useArticleDemo(articleId);

  const studentLabel = useMemo(() => {
    const className = window.localStorage.getItem("className") ?? "";
    const studentName = window.localStorage.getItem("studentName") ?? "";
    return [className.trim(), studentName.trim()].filter(Boolean).join(" · ");
  }, []);

  if (loading) return <div className="text-sm text-slate-600">正在加载文章内容…</div>;
  if (error || !data) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold text-red-600">内容加载失败</div>
        <div className="mt-2 text-sm text-slate-700">错误信息：{error ?? "unknown"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <div className="text-xs font-medium text-slate-500">{data.article.unit}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{data.article.title}</div>
        {studentLabel && <div className="mt-2 text-sm text-slate-600">{studentLabel}</div>}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <TaskCard to="read" title="沉浸式阅读" desc="点词点句、朗读高亮、收藏、读后练习抽屉。" />
          <TaskCard to="vocab" title="词汇与短语" desc="先把关键词搞懂（配对/选择/挖空）。" />
          <TaskCard to="sentence" title="句子拆解" desc="把长句拆成语块，拖拽排序加深印象。" />
          <TaskCard to="reading" title="篇章理解" desc="带着问题回到原文定位信息，读懂段落。" />
          <TaskCard to="quotes" title="优美句子" desc="收藏、笔记、仿写，形成自己的语料库。" />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold">原文</div>
        <div className="mt-3 space-y-3 text-[15px] leading-7">
          {data.article.paragraphs.map((paragraph) => (
            <p key={paragraph.id} className="text-slate-900">
              {paragraph.sentenceIds
                .map((sid) => data.sentences.find((sentence) => sentence.id === sid)?.text ?? "")
                .filter(Boolean)
                .join(" ")}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to} className="group rounded-lg border p-4 hover:bg-slate-50">
      <div className="text-sm font-semibold group-hover:underline">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{desc}</div>
    </Link>
  );
}

