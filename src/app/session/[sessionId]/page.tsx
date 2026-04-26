"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingScreen } from "@/components/loading-screen";
import { getMe, submitAnswer, completeSession } from "@/lib/api";
import type { ISessionQuestion } from "@/api/structures/ISessionQuestion";
import type { IAnswerResult } from "@/api/structures/IAnswerResult";

type StoredSession = {
  session_id: string;
  questions: ISessionQuestion[];
};

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<StoredSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IAnswerResult | null>(null);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(() => {
        // Get session data from sessionStorage (set by createSession in roadmap)
        const stored = sessionStorage.getItem(`session_${sessionId}`);
        if (stored) {
          setSession(JSON.parse(stored));
        } else {
          // If no stored session, we need to navigate back
          // The session data was returned from POST /sessions
          // We'll store it when creating sessions
          alert("세션 데이터를 찾을 수 없습니다.");
          router.back();
        }
        setLoading(false);
      })
      .catch(() => router.replace("/login"));
  }, [sessionId, router]);

  const currentQuestion = session?.questions[currentIdx];
  const isLast = session ? currentIdx === session.questions.length - 1 : false;
  const progress = session
    ? Math.round(((currentIdx + 1) / session.questions.length) * 100)
    : 0;

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion) return;
    const answer =
      currentQuestion.type === "multi" ? selectedOption ?? "" : userAnswer.trim();
    if (!answer) return;

    setSubmitting(true);
    try {
      const res = await submitAnswer({
        question_id: currentQuestion.id,
        user_answer: answer,
        session_id: sessionId,
      });
      setResult(res);
    } catch {
      alert("답안 제출에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }, [currentQuestion, selectedOption, userAnswer, sessionId]);

  const handleNext = useCallback(async () => {
    if (isLast) {
      // Complete session
      setCompleting(true);
      try {
        const completeResult = await completeSession(sessionId);
        sessionStorage.setItem(`result_${sessionId}`, JSON.stringify(completeResult));
        router.replace(`/session/${sessionId}/result`);
      } catch {
        alert("세션 완료에 실패했습니다.");
        setCompleting(false);
      }
    } else {
      setCurrentIdx((prev) => prev + 1);
      setResult(null);
      setUserAnswer("");
      setSelectedOption(null);
    }
  }, [isLast, sessionId, router]);

  if (loading) return <LoadingScreen message="세션 준비 중..." />;
  if (!session || !currentQuestion) {
    return <LoadingScreen message="문제 불러오는 중..." />;
  }

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            onClick={() => {
              if (confirm("세션을 종료하시겠습니까? 진행 상황이 저장되지 않습니다.")) {
                router.back();
              }
            }}
            className="text-muted-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {currentIdx + 1} / {session.questions.length}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        {/* Question */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {currentQuestion.tag}
              </span>
              <span className="text-xs text-muted-foreground">
                난이도 {"*".repeat(currentQuestion.difficulty)}
              </span>
            </div>
            <p className="text-base font-medium leading-relaxed">
              {currentQuestion.content}
            </p>
          </div>

          {/* Answer area */}
          {!result ? (
            <div className="space-y-3">
              {currentQuestion.type === "multi" &&
              currentQuestion.options.length > 0 ? (
                /* Multiple choice */
                <div className="space-y-2">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(String(i))}
                      disabled={submitting}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
                        selectedOption === String(i)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary"
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                          selectedOption === String(i)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {optionLabels[i]}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                /* Short answer / Essay */
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={
                    currentQuestion.type === "single"
                      ? "답을 입력하세요..."
                      : "서술형 답안을 작성하세요..."
                  }
                  rows={currentQuestion.type === "single" ? 2 : 5}
                  disabled={submitting}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                />
              )}

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  (currentQuestion.type === "multi"
                    ? !selectedOption
                    : !userAnswer.trim())
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    채점 중...
                  </>
                ) : (
                  "제출"
                )}
              </Button>
            </div>
          ) : (
            /* Result */
            <Card
              className={`${
                result.is_correct
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center gap-2">
                  {result.is_correct ? (
                    <CheckCircle className="size-5 text-green-600" />
                  ) : (
                    <XCircle className="size-5 text-red-600" />
                  )}
                  <span
                    className={`font-semibold ${
                      result.is_correct ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.is_correct ? "정답!" : "오답"}
                  </span>
                  {result.score !== null && (
                    <span className="ml-auto text-sm text-muted-foreground">
                      점수: {result.score}점
                    </span>
                  )}
                </div>

                {!result.is_correct && currentQuestion && (
                  <p className="text-sm">
                    <span className="font-medium">정답: </span>
                    {currentQuestion.type === "multi"
                      ? currentQuestion.options[parseInt(result.correct_answer, 10)] ?? result.correct_answer
                      : result.correct_answer}
                  </p>
                )}

                {result.explanation && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.explanation}
                  </p>
                )}

                {result.grade_reason && (
                  <p className="text-xs text-muted-foreground italic">
                    {result.grade_reason}
                  </p>
                )}

                <Button className="w-full" onClick={handleNext} disabled={completing}>
                  {completing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      결과 확인 중...
                    </>
                  ) : isLast ? (
                    "결과 확인"
                  ) : (
                    <>
                      다음 문제
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
