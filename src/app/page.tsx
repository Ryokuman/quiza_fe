"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { LoadingScreen } from "@/components/loading-screen";
import { ErrorMessage } from "@/components/error-message";
import { getMe, getUserDomains, getAdvice, deactivateGoal } from "@/lib/api";
import type { IDomainProgress } from "@/api/structures/IDomainProgress";
import type { IAdviceResult } from "@/api/structures/IAdviceResult";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [domains, setDomains] = useState<IDomainProgress[] | null>(null);
  const [advice, setAdvice] = useState<IAdviceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const user = await getMe();
      setNickname(user.nickname);

      const userDomains = await getUserDomains();
      setDomains(userDomains);

      if (userDomains.length === 0) {
        router.replace("/onboarding");
        return;
      }

      // Load advice in background (non-blocking)
      getAdvice()
        .then(setAdvice)
        .catch(() => {});
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorMessage onRetry={loadData} />;

  return (
    <div className="flex min-h-[100dvh] flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <h1 className="text-lg font-bold">Quiza</h1>
          <span className="text-sm text-muted-foreground">
            {nickname}님
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 pt-4">
        {/* Stats Summary */}
        {domains && domains.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card size="sm">
              <CardContent className="pt-3">
                <p className="text-2xl font-bold">{domains.length}</p>
                <p className="text-xs text-muted-foreground">학습 도메인</p>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="pt-3">
                <p className="text-2xl font-bold">
                  {domains.reduce((sum, d) => sum + d.checkpoints.passed, 0)}
                </p>
                <p className="text-xs text-muted-foreground">통과 체크포인트</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Domain Cards */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">내 학습 목표</h2>
          {domains?.map((domain) => {
            const progress =
              domain.checkpoints.total > 0
                ? Math.round(
                    (domain.checkpoints.passed / domain.checkpoints.total) * 100
                  )
                : 0;
            return (
              <Card key={domain.goalId} className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{domain.name}</CardTitle>
                      <CardDescription>
                        {domain.target} / {domain.level}
                      </CardDescription>
                    </div>
                    {deletingGoalId === domain.goalId ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={async () => {
                            try {
                              await deactivateGoal(domain.goalId);
                              setDeletingGoalId(null);
                              await loadData();
                            } catch {
                              setDeletingGoalId(null);
                            }
                          }}
                          className="rounded-lg bg-destructive px-2 py-1 text-xs text-destructive-foreground"
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => setDeletingGoalId(null)}
                          className="rounded-lg border px-2 py-1 text-xs"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingGoalId(domain.goalId);
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {domain.checkpoints.passed}/{domain.checkpoints.total}{" "}
                        체크포인트
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/roadmap/${domain.goalId}`)}
                  >
                    계속하기
                    <ChevronRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Advice Card */}
        {advice && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI 학습 조언
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{advice.advice}</p>
              {advice.weak_tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {advice.weak_tags.map((wt) => (
                    <span
                      key={wt.tag}
                      className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
                    >
                      {wt.tag} ({wt.accuracy}%)
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* FAB - Add Domain */}
      <button
        onClick={() => router.push("/onboarding")}
        className="fixed bottom-20 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="size-6" />
      </button>

      <BottomNav />
    </div>
  );
}
