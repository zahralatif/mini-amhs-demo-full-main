const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export async function postJSON<TIn, TOut>(path: string, body: TIn, token?: string): Promise<TOut> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<TOut>;
}

// Auth
export function login(username: string, password: string) {
  // IMPORTANT: backend route has no /auth prefix (aliases exist but we standardize here)
  return postJSON<{username:string;password:string},{token:string}>("/api/login", { username, password });
}
export function register(username: string, password: string) {
  return postJSON<{username:string;password:string}, any>("/api/register", { username, password });
}

// Messages
export function createMessage(token: string, inBody: { receiver: string; subject: string; body: string }) {
  return postJSON<typeof inBody, any>("/api/messages", inBody, token);
}
export async function getMessages(token: string, page = 1, pageSize = 25) {
  const res = await fetch(`${BASE}/api/messages?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
