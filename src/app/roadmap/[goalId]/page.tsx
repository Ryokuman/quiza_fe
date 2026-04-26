"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  PlayCircle,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import { ErrorMessage } from "@/components/error-message";
import { getMe, getRoadmap, createSession } from "@/lib/api";
import type { IDomainRoadmap } from "@/api/structures/IDomainRoadmap";
import type { ICheckpointItem } from "@/api/structures/ICheckpointItem";

function getStatusIcon(status: string) {
  switch (status) {
    case "passed":
      return <CheckCircle2 className="size-6 text-green-600" />;
    case "in_progress":
      return <PlayCircle className="size-6 text-primary" />;
    case "locked":
      return <Lock className="size-6 text-muted-foreground/50" />;
    default:
      return <Circle className="size-6 text-muted-foreground" />;
  }
}

export default function RoadmapPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.goalId as string;

  const [roadmap, setRoadmap] = useState<IDomainRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [startingCheckpoint, setStartingCheckpoint] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      await getMe();
      const data = await getRoadmap(goalId);
      setRoadmap(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartSession = useCallback(
    async (checkpoint: ICheckpointItem) => {
      setStartingCheckpoint(checkpoint.id);
      try {
        const session = await createSession(checkpoint.id);
        sessionStorage.setItem(
          `session_${session.session_id}`,
          JSON.stringify(session)
        );
        router.push(`/session/${session.session_id}`);
      } catch {
        alert("세션 생성에 실패했습니다. 다시 시도해주세요.");
        setStartingCheckpoint(null);
      }
    },
    [router]
  );

  if (loading) return <LoadingScreen message="로드맵 불러오는 중..." />;
  if (error) return <ErrorMessage onRetry={loadData} />;
  if (!roadmap) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">로드맵이 아직 생성되지 않았습니다.</p>
        <p className="text-sm text-muted-foreground">잠시 후 다시 확인해주세요.</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  const sortedCheckpoints = [...roadmap.checkpoints].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
        <button onClick={() => router.push("/")} className="text-muted-foreground">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="truncate text-base font-semibold">{roadmap.title}</h1>
      </header>

      {/* Checkpoint list */}
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-1">
            {sortedCheckpoints.map((cp, i) => {
              const isLocked = cp.status === "locked";
              const isPassed = cp.status === "passed";
              const isInProgress = cp.status === "in_progress";
              const canStart = isInProgress || isPassed;

              return (
                <div key={cp.id} className="relative flex gap-4 pb-6">
                  {/* Status icon */}
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
                    {getStatusIcon(cp.status)}
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 rounded-xl border p-3 ${
                      isLocked
                        ? "border-border/50 bg-muted/30 opacity-60"
                        : isInProgress
                        ? "border-primary/30 bg-primary/5"
                        : isPassed
                        ? "border-green-200 bg-green-50"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isLocked ? "text-muted-foreground" : ""
                          }`}
                        >
                          {i + 1}. {cp.title}
                        </p>
                        {cp.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {cp.description}
                          </p>
                        )}
                        {cp.tag_name && (
                          <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                            {cp.tag_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score & attempts */}
                    {(cp.best_score !== null || cp.attempts > 0) && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        {cp.best_score !== null && (
                          <span>최고: {Math.round(cp.best_score * 100)}%</span>
                        )}
                        {cp.attempts > 0 && <span>시도: {cp.attempts}회</span>}
                      </div>
                    )}

                    {/* Start button */}
                    {canStart && (
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => handleStartSession(cp)}
                        disabled={startingCheckpoint === cp.id}
                      >
                        {startingCheckpoint === cp.id ? (
                          <>
                            <Loader2 className="mr-1 size-3 animate-spin" />
                            준비 중...
                          </>
                        ) : isPassed ? (
                          "다시 도전"
                        ) : (
                          "세션 시작"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
