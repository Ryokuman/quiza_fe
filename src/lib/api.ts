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
