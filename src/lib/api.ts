const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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

/* ---------- helpers ---------- */

export async function postVerify(proof: unknown) {
  const res = await apiFetch("/auth/verify", {
    method: "POST",
    body: JSON.stringify(proof),
  });
  if (!res.ok) throw new Error("Verification failed");
  return res.json() as Promise<{ success: boolean }>;
}

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
