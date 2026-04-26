"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { LoadingScreen } from "@/components/loading-screen";
import { ErrorMessage } from "@/components/error-message";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getMe, getStats } from "@/lib/api";
import type { IStats } from "@/api/structures/IStats";

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<IStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      await getMe();
      const data = await getStats();
      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingScreen message="통계 불러오는 중..." />;
  if (error) return <ErrorMessage onRetry={loadData} />;
  if (!stats) return <ErrorMessage message="통계 데이터가 없습니다." />;

  const overallAccuracy =
    stats.tag_stats.length > 0
      ? Math.round(
          stats.tag_stats.reduce((sum, t) => sum + t.accuracy, 0) /
            stats.tag_stats.length
        )
      : 0;

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center px-4">
          <h1 className="text-lg font-bold">학습 통계</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 pt-4">
        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card size="sm">
            <CardContent className="flex flex-col items-center pt-3">
              <p className="text-2xl font-bold">{stats.total_answered}</p>
              <p className="text-xs text-muted-foreground">총 답변</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex flex-col items-center pt-3">
              <p className="text-2xl font-bold">{overallAccuracy}%</p>
              <p className="text-xs text-muted-foreground">정답률</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex flex-col items-center pt-3">
              <p className="text-2xl font-bold">
                {stats.roadmap_progress.percentage}%
              </p>
              <p className="text-xs text-muted-foreground">진행률</p>
            </CardContent>
          </Card>
        </div>

        {/* Accuracy circle */}
        <Card>
          <CardHeader>
            <CardTitle>종합 정답률</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-6">
            <div className="relative flex size-36 items-center justify-center">
              <svg className="size-36 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="8"
                  className="stroke-secondary"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-primary transition-all duration-1000"
                  strokeDasharray={`${overallAccuracy * 2.64} ${264}`}
                />
              </svg>
              <span className="absolute text-3xl font-bold">
                {overallAccuracy}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap progress */}
        <Card>
          <CardHeader>
            <CardTitle>로드맵 진행률</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {stats.roadmap_progress.passed}/{stats.roadmap_progress.total}{" "}
                체크포인트
              </span>
              <span className="font-medium">
                {stats.roadmap_progress.percentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${stats.roadmap_progress.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tag stats */}
        {stats.tag_stats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>태그별 정답률</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.tag_stats
                .sort((a, b) => a.accuracy - b.accuracy)
                .map((ts) => (
                  <div key={ts.tag} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{ts.tag}</span>
                      <span className="text-muted-foreground">
                        {ts.correct}/{ts.total} ({ts.accuracy}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ts.accuracy >= 70
                            ? "bg-green-500"
                            : ts.accuracy >= 40
                            ? "bg-yellow-500"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${ts.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {stats.tag_stats.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-muted-foreground">아직 학습 기록이 없습니다.</p>
            <p className="text-sm text-muted-foreground">
              퀴즈를 풀면 통계가 여기에 표시됩니다.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
