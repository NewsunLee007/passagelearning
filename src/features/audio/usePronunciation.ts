import { useState, useRef, useCallback } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export type WordAssessment = {
  word: string;
  accuracyScore: number;
  errorType: string;
};

export type PronunciationResult = {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronScore: number;
  words: WordAssessment[];
};

type AssessmentState = "idle" | "recording" | "analyzing" | "done" | "error";

export function usePronunciation() {
  const [state, setState] = useState<AssessmentState>("idle");
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);

  const startRecording = useCallback(async (referenceText: string) => {
    setState("idle");
    setResult(null);
    setErrorMsg(null);
    
    try {
      // 1. Fetch Token
      const res = await fetch("/api/speech/token", { method: "POST" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "获取语音评测授权失败。请检查后端是否配置 AZURE_SPEECH_KEY");
      }
      const { token, region } = await res.json();

      // 2. Init SDK
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "en-US";
      
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      
      const pronConfig = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        true
      );
      
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronConfig.applyTo(recognizer);
      
      recognizerRef.current = recognizer;
      setState("recording");

      recognizer.recognizeOnceAsync(
        (speechResult) => {
          if (speechResult.reason === sdk.ResultReason.RecognizedSpeech) {
            setState("analyzing");
            try {
              const pronResult = sdk.PronunciationAssessmentResult.fromResult(speechResult);
              
              const words: WordAssessment[] = pronResult.detailResult.Words.map((w: any) => ({
                word: w.Word,
                accuracyScore: w.PronunciationAssessment.AccuracyScore,
                errorType: w.PronunciationAssessment.ErrorType
              }));

              setResult({
                accuracyScore: pronResult.accuracyScore,
                fluencyScore: pronResult.fluencyScore,
                completenessScore: pronResult.completenessScore,
                pronScore: pronResult.pronunciationScore,
                words
              });
              setState("done");
            } catch (err) {
              console.error("Pronunciation parsing error:", err);
              setErrorMsg("解析发音数据失败。");
              setState("error");
            }
          } else if (speechResult.reason === sdk.ResultReason.NoMatch) {
            setErrorMsg("未能识别到清晰的语音，请靠近麦克风重试。");
            setState("error");
          } else if (speechResult.reason === sdk.ResultReason.Canceled) {
            const cancellation = sdk.CancellationDetails.fromResult(speechResult);
            setErrorMsg(`请求被取消: ${cancellation.errorDetails}`);
            setState("error");
          }
          
          recognizer.close();
          recognizerRef.current = null;
        },
        (err) => {
          console.error("Recognizer error:", err);
          setErrorMsg("录音引擎发生错误，请检查麦克风权限。");
          setState("error");
          recognizer.close();
          recognizerRef.current = null;
        }
      );
    } catch (err) {
      console.error("Pronunciation Assessment Setup Error:", err);
      setErrorMsg(err instanceof Error ? err.message : "无法初始化录音");
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognizerRef.current && state === "recording") {
      setState("analyzing");
      // stopContinuousRecognitionAsync is for continuous.
      // For recognizeOnceAsync, it stops automatically after a pause. 
      // But we can force stop the audio stream if needed.
      // Since recognizeOnceAsync stops on silence, we usually just wait for it.
      // Alternatively, we can stop the microphone but the SDK handles recognizeOnceAsync gracefully.
      // Let's just let it auto-stop for simplicity, or we can instruct users to stop speaking.
    }
  }, [state]);

  const cancelRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.close();
      recognizerRef.current = null;
    }
    setState("idle");
    setResult(null);
    setErrorMsg(null);
  }, []);

  return {
    state,
    result,
    errorMsg,
    startRecording,
    stopRecording,
    cancelRecording
  };
}
