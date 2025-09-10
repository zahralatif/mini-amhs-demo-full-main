const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

// Generic API functions
export async function getJSON<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function postJSON<TIn, TOut>(path: string, body: TIn, token?: string): Promise<TOut> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<TOut>;
}

import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  CreateMessageRequest, 
  CreateMessageResponse,
  Message,
  PaginatedResponse 
} from './types';

// Auth API
export function login(username: string, password: string) {
  return postJSON<LoginRequest, LoginResponse>("/api/login", { username, password });
}

export function register(username: string, password: string) {
  return postJSON<RegisterRequest, { message: string }>("/api/register", { username, password });
}

// Messages API
export function createMessage(token: string, messageData: CreateMessageRequest) {
  return postJSON<CreateMessageRequest, CreateMessageResponse>("/api/messages", messageData, token);
}

export function getMessages(token: string, page = 1, pageSize = 25, archived = false) {
  return getJSON<PaginatedResponse<Message>>(`/api/messages?page=${page}&pageSize=${pageSize}&archived=${archived}`, token);
}

export async function deleteMessages(token: string, ids: number[]) {
  const res = await fetch(`${BASE}/api/messages`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<{ deleted: number }>; 
}

export async function updateMessages(
  token: string,
  payload: { ids: number[]; is_read?: boolean; is_archived?: boolean }
) {
  const res = await fetch(`${BASE}/api/messages`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<{ updated: number }>; 
}
