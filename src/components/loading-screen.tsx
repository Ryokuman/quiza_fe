"use client";

import { Loader2 } from "lucide-react";

export function LoadingScreen({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
