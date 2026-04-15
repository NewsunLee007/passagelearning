import { useEffect } from "react";
import { usePronunciation, type PronunciationResult } from "../../features/audio/usePronunciation";

export type PronunciationScoreSavedPayload = {
  score: number;
  result: PronunciationResult;
};

export function PronunciationScorer({
  referenceText,
  onClose,
  onScoreSaved
}: {
  referenceText: string;
  onClose?: () => void;
  onScoreSaved?: (payload: PronunciationScoreSavedPayload) => void;
}) {
  const { state, result, errorMsg, startRecording, stopRecording, cancelRecording } = usePronunciation();

  useEffect(() => {
    if (state === "done" && result && onScoreSaved) {
      onScoreSaved({ score: result.accuracyScore / 100, result });
    }
  }, [state, result, onScoreSaved]);

  const handleStart = () => {
    startRecording(referenceText);
  };

  const handleCancel = () => {
    cancelRecording();
    if (onClose) onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50 underline decoration-rose-300 decoration-wavy";
  };

  return (
    <div className="mt-4 rounded-[1.2rem] border border-primary/20 bg-primary/5 p-4 shadow-inner animate-fade-in relative">
      {onClose && (
        <button
          onClick={handleCancel}
          className="absolute right-3 top-3 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          title="关闭评测"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="mb-3 text-sm font-bold text-slate-700">跟读挑战评测</div>
      
      {state === "idle" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-slate-500 text-center">点击下方按钮开始录音，读完后系统将自动进行发音打分。</p>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(47,110,99,0.25)] transition hover:bg-primary/90 hover:scale-105"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            开始录音
          </button>
        </div>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <div className="absolute h-full w-full animate-ping rounded-full bg-rose-200 opacity-75"></div>
            <svg className="relative h-8 w-8 text-rose-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.39-.9.89 0 2.76-2.24 5-5.01 5s-5-.24-5.01-5c0-.5-.41-.89-.9-.89s-.9.39-.9.89c0 3.16 2.39 5.76 5.41 6.22V20h-3c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1h-3v-1.78c3.02-.46 5.41-3.06 5.41-6.22 0-.5-.41-.89-.9-.89z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-rose-600">正在聆听中... 读完后请点击下方按钮</p>
          </div>
          <button
            onClick={() => stopRecording()}
            className="mt-2 rounded-full border-2 border-rose-200 bg-white px-6 py-2.5 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-50"
          >
            停止录音并评测
          </button>
        </div>
      )}

      {state === "analyzing" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          <p className="text-sm font-semibold text-slate-600">Azure 正在分析发音数据...</p>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="rounded-xl bg-red-50 p-4 text-center">
            <svg className="mx-auto mb-2 h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-red-700">{errorMsg}</p>
          </div>
          <button
            onClick={handleStart}
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            重新尝试
          </button>
        </div>
      )}

      {state === "done" && result && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col items-center justify-center gap-4 rounded-[1.5rem] bg-white p-5 shadow-sm sm:flex-row sm:gap-6">
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">综合得分</div>
              <div className={`mt-1 font-display text-5xl ${getScoreColor(result.accuracyScore).split(" ")[0]}`}>
                {Math.round(result.accuracyScore)}
              </div>
            </div>
            <div className="hidden h-12 w-px bg-slate-100 sm:block"></div>
            <div className="grid w-full grid-cols-3 gap-3 text-center sm:w-auto sm:gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">准确度</div>
                <div className="mt-1 text-lg font-bold text-slate-700">{Math.round(result.pronScore)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">流畅度</div>
                <div className="mt-1 text-lg font-bold text-slate-700">{Math.round(result.fluencyScore)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">完整度</div>
                <div className="mt-1 text-lg font-bold text-slate-700">{Math.round(result.completenessScore)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.2rem] bg-white p-4 leading-8 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-2">发音详情（标红单词请注意练习）：</div>
            <div className="flex flex-wrap gap-1 text-lg">
              {result.words.map((w, i) => (
                <span
                  key={i}
                  className={`rounded px-1.5 py-0.5 font-medium transition-colors ${getScoreColor(w.accuracyScore)}`}
                  title={`准确度得分: ${Math.round(w.accuracyScore)}`}
                >
                  {w.word}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleStart}
              className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
            >
              再读一次
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
