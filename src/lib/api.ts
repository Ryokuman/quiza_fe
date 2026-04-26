// API calls go through Next.js rewrite proxy (/api/* → backend)
// This keeps cookies same-origin, avoiding 3rd party cookie issues in webviews.
const BASE_URL = "/api";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}

/* ────────── MiniKit walletAuth 플로우 ────────── */

/**
 * SIWE 인증용 일회성 nonce를 서버에서 발급받는다.
 * MiniKit.walletAuth() 호출 전에 반드시 먼저 호출해야 한다.
 */
export async function getNonce() {
  const res = await apiFetch("/auth/nonce");
  if (!res.ok) throw new Error("Failed to get nonce");
  return res.json() as Promise<{ nonce: string }>;
}

/**
 * MiniKit.walletAuth() 결과를 서버로 전송하여 JWT를 발급받는다.
 * 성공 시 서버가 httpOnly 쿠키에 access_token을 세팅한다.
 *
 * @param payload - MiniKit.walletAuth()가 반환한 { message, signature, address }
 * @param nonce - getNonce()로 받은 일회용 nonce
 */
export async function postWalletAuth(
  payload: { message: string; signature: string; address: string },
  nonce: string,
) {
  const res = await apiFetch("/auth/wallet", {
    method: "POST",
    body: JSON.stringify({ ...payload, nonce }),
  });
  if (!res.ok) throw new Error("Wallet auth failed");
  return res.json() as Promise<{ success: boolean }>;
}

/* ────────── 기타 인증 ────────── */

export async function postDevLogin(worldId?: string) {
  const res = await apiFetch("/auth/dev-login", {
    method: "POST",
    body: JSON.stringify({ world_id: worldId }),
  });
  if (!res.ok) throw new Error("Dev login failed");
  return res.json() as Promise<{ success: boolean }>;
}

export async function getMe() {
  const res = await apiFetch("/auth/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json() as Promise<{ id: string; nickname: string; world_id: string }>;
}

export async function postLogout() {
  const res = await apiFetch("/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
}

/* ────────── 도메인 ────────── */

import type { IDomainProgress } from "@/api/structures/IDomainProgress";

export async function getUserDomains() {
  const res = await apiFetch("/domains/me");
  if (!res.ok) throw new Error("Failed to fetch user domains");
  return res.json() as Promise<IDomainProgress[]>;
}

/* ────────── 목표 (Goals) ────────── */

import type { IGoalItem } from "@/api/structures/IGoalItem";
import type { ICreateGoalBody } from "@/api/structures/ICreateGoalBody";
import type { ICreateGoalResult } from "@/api/structures/ICreateGoalResult";

export async function getUserGoals() {
  const res = await apiFetch("/goals");
  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json() as Promise<IGoalItem[]>;
}

export async function deactivateGoal(goalId: string) {
  const res = await apiFetch(`/goals/${encodeURIComponent(goalId)}/deactivate`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to deactivate goal");
  return res.json() as Promise<{ success: boolean }>;
}

export async function createGoal(body: ICreateGoalBody) {
  const res = await apiFetch("/goals", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json() as Promise<ICreateGoalResult>;
}

/* ────────── 온보딩 ────────── */

import type { IOnboardingChatResult } from "@/api/structures/IOnboardingChatResult";

export async function postOnboardingChat(body: {
  message: string;
  turn: number;
  context?: {
    suggestedDomains?: { id: string; name: string; similarity: number }[];
    selectedDomainId?: string;
    selectedDomainName?: string;
    suggestedTags?: { id: string; name: string }[];
    selectedTagIds?: string[];
  };
}) {
  const res = await apiFetch("/onboarding/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to send onboarding chat");
  return res.json() as Promise<IOnboardingChatResult>;
}

/* ────────── 로드맵 ────────── */

import type { IDomainRoadmap } from "@/api/structures/IDomainRoadmap";

export async function getRoadmap(goalId: string) {
  const res = await apiFetch(`/roadmaps/${encodeURIComponent(goalId)}`);
  if (!res.ok) throw new Error("Failed to fetch roadmap");
  return res.json() as Promise<IDomainRoadmap | null>;
}

/* ────────── 세션 ────────── */

import type { ISession } from "@/api/structures/ISession";
import type { ISessionCompleteResult } from "@/api/structures/ISessionCompleteResult";

export async function createSession(checkpointId: string) {
  const res = await apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify({ checkpoint_id: checkpointId }),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json() as Promise<ISession>;
}

export async function completeSession(sessionId: string) {
  const res = await apiFetch(`/sessions/${encodeURIComponent(sessionId)}/complete`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to complete session");
  return res.json() as Promise<ISessionCompleteResult>;
}

/* ────────── 답안 ────────── */

import type { IAnswerResult } from "@/api/structures/IAnswerResult";

export async function submitAnswer(body: {
  question_id: string;
  user_answer: string;
  session_id?: string;
}) {
  const res = await apiFetch("/answers", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json() as Promise<IAnswerResult>;
}

/* ────────── 통계 ────────── */

import type { IStats } from "@/api/structures/IStats";

export async function getStats() {
  const res = await apiFetch("/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json() as Promise<IStats>;
}

/* ────────── 조언 ────────── */

import type { IAdviceResult } from "@/api/structures/IAdviceResult";

export async function getAdvice() {
  const res = await apiFetch("/advice");
  if (!res.ok) throw new Error("Failed to fetch advice");
  return res.json() as Promise<IAdviceResult>;
}

/* ────────── 결제 ────────── */

import type { IPremiumStatus } from "@/api/structures/IPremiumStatus";
import type { IGenerateNonceResult } from "@/api/structures/IGenerateNonceResult";
import type { IPaymentItem } from "@/api/structures/IPaymentItem";

export async function getPremiumStatus() {
  const res = await apiFetch("/payments/premium-status");
  if (!res.ok) throw new Error("Failed to fetch premium status");
  return res.json() as Promise<IPremiumStatus>;
}

export async function postPaymentNonce(body: {
  amountWld: number;
  productType: string;
}) {
  const res = await apiFetch("/payments/nonce", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to generate payment nonce");
  return res.json() as Promise<IGenerateNonceResult>;
}

export async function postPaymentConfirm(body: {
  transactionId: string;
  reference: string;
}) {
  const res = await apiFetch("/payments/confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to confirm payment");
  return res.json() as Promise<IPaymentItem>;
}

export async function getPaymentHistory() {
  const res = await apiFetch("/payments/history");
  if (!res.ok) throw new Error("Failed to fetch payment history");
  return res.json() as Promise<IPaymentItem[]>;
}
