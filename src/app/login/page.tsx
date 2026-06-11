"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  postDevLogin,
  postSocialLogin,
  type SocialAuthProvider,
} from "@/lib/api";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === "true";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (options: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{ authorization?: { id_token?: string } }>;
      };
    };
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Auth: {
        login: (options: {
          success: (response: { access_token?: string }) => void;
          fail: (error: unknown) => void;
        }) => void;
      };
    };
  }
}

type LoginStatus = "idle" | "loading";

const PROVIDERS: {
  provider: SocialAuthProvider;
  label: string;
  envName: string;
}[] = [
  {
    provider: "google",
    label: "Google로 계속하기",
    envName: "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  },
  {
    provider: "apple",
    label: "Apple로 계속하기",
    envName: "NEXT_PUBLIC_APPLE_CLIENT_ID",
  },
  {
    provider: "kakao",
    label: "Kakao로 계속하기",
    envName: "NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY",
  },
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("로그인 SDK를 불러오지 못했습니다"));
    document.head.appendChild(script);
  });
}

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function completeLogin(provider: SocialAuthProvider, token: string) {
    await postSocialLogin(provider, token);
    router.push("/");
  }

  async function handleGoogleLogin() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("Google 로그인 설정이 필요합니다");

    await loadScript("https://accounts.google.com/gsi/client");
    const google = window.google;
    if (!google) throw new Error("Google 로그인 SDK를 사용할 수 없습니다");

    const credential = await new Promise<string>((resolve, reject) => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) resolve(response.credential);
          else reject(new Error("Google 인증 토큰을 받지 못했습니다"));
        },
      });
      google.accounts.id.prompt();
    });

    await completeLogin("google", credential);
  }

  async function handleAppleLogin() {
    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    const redirectURI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? window.location.origin;
    if (!clientId) throw new Error("Apple 로그인 설정이 필요합니다");

    await loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js");
    const apple = window.AppleID;
    if (!apple) throw new Error("Apple 로그인 SDK를 사용할 수 없습니다");

    apple.auth.init({
      clientId,
      scope: "name email",
      redirectURI,
      usePopup: true,
    });
    const response = await apple.auth.signIn();
    const token = response?.authorization?.id_token;
    if (!token) throw new Error("Apple 인증 토큰을 받지 못했습니다");

    await completeLogin("apple", token);
  }

  async function handleKakaoLogin() {
    const javascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
    if (!javascriptKey) throw new Error("Kakao 로그인 설정이 필요합니다");

    await loadScript("https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js");
    const kakao = window.Kakao;
    if (!kakao) throw new Error("Kakao 로그인 SDK를 사용할 수 없습니다");

    if (!kakao.isInitialized()) {
      kakao.init(javascriptKey);
    }

    const token = await new Promise<string>((resolve, reject) => {
      kakao.Auth.login({
        success: (response) => {
          if (response.access_token) resolve(response.access_token);
          else reject(new Error("Kakao 인증 토큰을 받지 못했습니다"));
        },
        fail: reject,
      });
    });

    await completeLogin("kakao", token);
  }

  async function handleProviderLogin(provider: SocialAuthProvider) {
    setStatus("loading");
    setErrorMsg("");

    try {
      if (provider === "google") await handleGoogleLogin();
      if (provider === "apple") await handleAppleLogin();
      if (provider === "kakao") await handleKakaoLogin();
    } catch (err) {
      setStatus("idle");
      setErrorMsg(err instanceof Error ? err.message : "로그인에 실패했습니다");
    }
  }

  async function handleDevLogin() {
    setStatus("loading");
    setErrorMsg("");

    try {
      await postDevLogin();
      router.push("/");
    } catch (err) {
      setStatus("idle");
      setErrorMsg(err instanceof Error ? err.message : "Dev 로그인에 실패했습니다");
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">Quiza</h1>
        <p className="text-sm text-gray-500">
          학습 기록을 이어가려면 계정으로 로그인하세요
        </p>
      </div>

      {errorMsg && (
        <p className="max-w-sm text-center text-sm text-red-500">{errorMsg}</p>
      )}

      <div className="flex w-full max-w-sm flex-col gap-3">
        {PROVIDERS.map((item) => (
          <button
            key={item.provider}
            type="button"
            onClick={() => handleProviderLogin(item.provider)}
            disabled={status === "loading"}
            className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {item.label}
          </button>
        ))}

        {IS_DEV && (
          <button
            type="button"
            onClick={handleDevLogin}
            disabled={status === "loading"}
            className="h-12 rounded-lg border border-dashed border-gray-300 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            개발 모드 로그인
          </button>
        )}
      </div>

      {status === "loading" && (
        <p className="text-sm text-gray-500">인증 중...</p>
      )}
    </div>
  );
}
