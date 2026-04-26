"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { LoadingScreen } from "@/components/loading-screen";
import { getMe, postLogout } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    nickname: string;
    world_id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      await postLogout();
      router.replace("/login");
    } catch {
      alert("로그아웃에 실패했습니다.");
    }
  }, [router]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex min-h-[100dvh] flex-col pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-md items-center px-4">
          <h1 className="text-lg font-bold">프로필</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 pt-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <User className="size-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold">{user?.nickname}</p>
              <p className="text-xs text-muted-foreground">
                {user?.world_id
                  ? `${user.world_id.slice(0, 8)}...${user.world_id.slice(-6)}`
                  : "World ID 미연결"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          로그아웃
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
