"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trophy, RotateCcw, ArrowRight, PartyPopper, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingScreen } from "@/components/loading-screen";
import { getMe, completeSession } from "@/lib/api";
import type { ISessionCompleteResult } from "@/api/structures/ISessionCompleteResult";

export default function SessionResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [result, setResult] = useState<ISessionCompleteResult | null>(null);
  const [loading, setLoading] = useState(true);

  const loadResult = useCallback(async () => {
    try {
      await getMe();
      // Try to get the result by completing again (idempotent)
      const res = await completeSession(sessionId);
      setResult(res);
    } catch {
      // If already completed, we still get the result
      // Try loading from stored data
      const stored = sessionStorage.getItem(`result_${sessionId}`);
      if (stored) {
        setResult(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  useEffect(() => {
    if (result) {
      sessionStorage.setItem(`result_${sessionId}`, JSON.stringify(result));
    }
  }, [result, sessionId]);

  if (loading) return <LoadingScreen message="결과 불러오는 중..." />;

  if (!result) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">결과를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  const scorePercent = Math.round(result.score * 100);
  const passed = result.passed;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        {/* Result icon */}
        <div className="flex flex-col items-center gap-3 text-center">
          {passed ? (
            <div className="flex size-20 items-center justify-center rounded-full bg-green-100">
              <PartyPopper className="size-10 text-green-600" />
            </div>
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-red-100">
              <Frown className="size-10 text-red-500" />
            </div>
          )}

          <h1 className="text-2xl font-bold">
            {passed ? "축하합니다!" : "아쉬워요..."}
          </h1>
          <p className="text-muted-foreground">
            {passed
              ? "체크포인트를 통과했습니다!"
              : "70% 이상이면 통과입니다. 다시 도전해보세요!"}
          </p>
        </div>

        {/* Score card */}
        <Card>
          <CardContent className="grid grid-cols-3 gap-4 pt-4 text-center">
            <div>
              <p className="text-3xl font-bold">{scorePercent}%</p>
              <p className="text-xs text-muted-foreground">점수</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{result.correct}</p>
              <p className="text-xs text-muted-foreground">정답</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{result.total}</p>
              <p className="text-xs text-muted-foreground">전체</p>
            </div>
          </CardContent>
        </Card>

        {/* Score progress bar */}
        <div className="space-y-1">
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                passed ? "bg-green-500" : "bg-red-400"
              }`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">통과: 70%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {passed ? (
            <Button className="w-full" onClick={() => router.back()}>
              로드맵으로 돌아가기
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <>
              <Button className="w-full" onClick={() => router.back()}>
                <RotateCcw className="size-4" />
                다시 도전하기
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/")}
          >
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
