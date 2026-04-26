"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MiniKit } from "@worldcoin/minikit-js";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import "@worldcoin/mini-apps-ui-kit-react/styles.css";
import { getNonce, postWalletAuth, postDevLogin } from "@/lib/api";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isWorldApp = MiniKit.isInstalled();

  /**
   * MiniKit walletAuth SIWE 인증 플로우 (Mini App 전용).
   *
   * 1. 백엔드에서 일회용 nonce 발급
   * 2. MiniKit.walletAuth()로 World App에 서명 요청 → 유저가 승인
   * 3. 서명 결과를 백엔드로 전송 → SIWE 검증 → JWT 쿠키 발급
   *
   * 네이티브 앱에서는 이 플로우 대신 IDKit을 사용해야 한다.
   * @see https://docs.world.org/mini-apps/commands/wallet-auth
   */
  async function handleWalletAuth() {
    setStatus("loading");
    setErrorMsg("");

    try {
      // 1. 백엔드에서 일회용 nonce 발급
      const { nonce } = await getNonce();

      // 2. World App에 SIWE 서명 요청 (유저가 승인하면 서명 데이터 반환)
      const result = await MiniKit.walletAuth({ nonce });

      // 3. 서명 결과를 백엔드로 전송하여 검증 + JWT 발급
      await postWalletAuth(
        {
          message: result.data.message,
          signature: result.data.signature,
          address: result.data.address,
        },
        nonce,
      );

      router.push("/");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "인증에 실패했습니다",
      );
    }
  }

  /** 개발 환경 전용 로그인. World App 밖에서 테스트할 때 사용. */
  async function handleDevLogin() {
    setStatus("loading");
    setErrorMsg("");

    try {
      await postDevLogin();
      router.push("/");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Dev 로그인에 실패했습니다",
      );
    }
  }

  /**
   * 환경에 따라 적절한 로그인 방식을 선택한다.
   * - World App 내부 → walletAuth (SIWE)
   * - 개발 모드 → dev-login (검증 우회)
   * - 그 외 → 에러 (World App에서만 접근 가능)
   */
  function handleLogin() {
    if (isWorldApp) {
      handleWalletAuth();
    } else if (IS_DEV) {
      handleDevLogin();
    } else {
      setStatus("error");
      setErrorMsg("World App에서 열어주세요");
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Quiza</h1>
        <p className="text-sm text-gray-500">
          {isWorldApp ? "World App으로 로그인" : IS_DEV ? "개발 모드" : "World App에서 열어주세요"}
        </p>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      {status === "loading" ? (
        <p className="text-sm text-gray-500">인증 중...</p>
      ) : (
        <Button
          onClick={handleLogin}
          fullWidth
          variant="primary"
          size="lg"
        >
          {isWorldApp
            ? "Sign in with World ID"
            : IS_DEV
              ? "Dev Login"
              : "World App에서 열어주세요"}
        </Button>
      )}

      {!isWorldApp && IS_DEV && (
        <p className="text-xs text-gray-400">
          World App 밖에서 실행 중 — Dev Login 사용
        </p>
      )}
    </div>
  );
}
