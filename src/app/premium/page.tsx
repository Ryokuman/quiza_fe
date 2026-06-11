"use client";

import { useEffect, useState, useCallback } from "react";
import { Crown, CheckCircle, History } from "lucide-react";
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
import {
  getMe,
  getPremiumStatus,
  getPaymentHistory,
} from "@/lib/api";
import type { IPremiumStatus } from "@/api/structures/IPremiumStatus";
import type { IPaymentItem } from "@/api/structures/IPaymentItem";

export default function PremiumPage() {
  const [status, setStatus] = useState<IPremiumStatus | null>(null);
  const [history, setHistory] = useState<IPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      await getMe();
      const [premiumData, historyData] = await Promise.all([
        getPremiumStatus(),
        getPaymentHistory(),
      ]);
      setStatus(premiumData);
      setHistory(historyData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorMessage onRetry={loadData} />;

  return (
    <div className="flex min-h-[100dvh] flex-col pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center px-4">
          <h1 className="text-lg font-bold">프리미엄</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 pt-4">
        {status?.isPremium ? (
          /* Premium active */
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="size-5 text-yellow-600" />
                프리미엄 활성
              </CardTitle>
              <CardDescription>모든 프리미엄 기능을 이용 중입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  무제한 퀴즈 세션
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  AI 맞춤 학습 조언
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  상세 분석 리포트
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  서술형 문제 AI 채점
                </li>
              </ul>
            </CardContent>
          </Card>
        ) : (
          /* Not premium - pricing card */
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
              <Crown className="mx-auto size-12 text-primary" />
              <h2 className="mt-3 text-xl font-bold">Quiza 프리미엄</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                더 효과적인 학습을 위해
              </p>
            </div>
            <CardContent className="space-y-4 pt-4">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-primary" />
                  무제한 퀴즈 세션
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-primary" />
                  AI 맞춤 학습 조언
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-primary" />
                  상세 분석 리포트
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-primary" />
                  서술형 문제 AI 채점
                </li>
              </ul>

              <div className="rounded-xl bg-secondary p-4 text-center">
                <p className="text-base font-semibold">결제 준비 중</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  App Store와 웹 결제 정책을 정리한 뒤 구독을 다시 엽니다.
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled
              >
                <Crown className="size-4" />
                구독 준비 중
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment history */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="size-4" />
                결제 내역
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.product_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.amount}</p>
                    <span
                      className={`text-xs ${
                        item.status === "confirmed"
                          ? "text-green-600"
                          : item.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {item.status === "confirmed"
                        ? "완료"
                        : item.status === "pending"
                        ? "대기"
                        : "실패"}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
