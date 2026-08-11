import { clearToken, getToken } from "@/lib/token-store";

export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
}

export function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Network error — server unreachable, please retry.", 0);
  }

  let payload: { success?: boolean; message?: string; data?: unknown } | null = null;
  try {
    payload = (await response.json()) as { success?: boolean; message?: string; data?: unknown };
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(payload?.message ?? `Request failed with status ${response.status}`, response.status, payload);
  }

  return payload.data as T;
}

async function send<T>(method: NonNullable<RequestOptions["method"]>, path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, { ...options, method });
}

export const api = {
  get: <T>(path: string, params?: Record<string, unknown>, signal?: AbortSignal) =>
    send<T>("GET", path, { params, signal }),
  post: <T>(path: string, body?: unknown) => send<T>("POST", path, { body }),
  patch: <T>(path: string, body: unknown) => send<T>("PATCH", path, { body }),
  delete: <T>(path: string, params?: Record<string, unknown>) =>
    send<T>("DELETE", path, { params }),
};