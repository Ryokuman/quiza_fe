"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { postDevLogin, postVerify } from "@/lib/api";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin() {
    setStatus("loading");
    setErrorMsg("");

    try {
      if (IS_DEV) {
        await postDevLogin();
      } else {
        // TODO: integrate World ID widget proof
        await postVerify({});
      }

      router.push("/");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다",
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center">
          <CardTitle className="text-2xl font-bold">Quiza</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {status === "error" && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}

          {status === "loading" ? (
            <p className="text-sm text-muted-foreground">인증 중...</p>
          ) : status === "error" ? (
            <Button onClick={handleLogin} className="w-full">
              다시 시도
            </Button>
          ) : (
            <Button onClick={handleLogin} className="w-full">
              World ID로 로그인
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
