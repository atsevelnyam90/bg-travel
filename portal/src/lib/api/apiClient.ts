import { env } from "@/lib/env";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./authTokens";

// winu-portal-д fetchWrapper + service бүрийн дотоод apiFetch + 407 нүцгэн fetch
// зэрэгцэн оршиж, алдааны формат газар болгонд өөр байсан. Энд ГАНЦ гарц.

export type ApiErrorShape = {
  message: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, body: ApiErrorShape) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Асуулгын мөр — undefined утгууд автоматаар хасагдана. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** true бол 401 дээр токен сэргээхийг оролдохгүй (давталтаас сэргийлнэ). */
  skipAuthRefresh?: boolean;
};

type UploadOptions = {
  contentType?: string;
  /** true бол 401 дээр токен сэргээхийг оролдохгүй. */
  skipAuthRefresh?: boolean;
};

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = /^https?:\/\//i.test(path) ? path : `${env.NEXT_PUBLIC_API_BASE_URL}${path}`;
  if (!query) return base;

  const url = new URL(base);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseError(response: Response): Promise<ApiErrorShape> {
  try {
    const body = (await response.json()) as Partial<ApiErrorShape> & { error?: string };
    return {
      message: body.message ?? body.error ?? `HTTP ${response.status}`,
      code: body.code,
      details: body.details,
    };
  } catch {
    return { message: `HTTP ${response.status} ${response.statusText}` };
  }
}

// Зэрэг явж буй олон хүсэлт 401 авбал нэг л удаа сэргээнэ (single-flight).
let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    await clearTokens();
    return false;
  }

  await setTokens((await response.json()) as { accessToken: string; refreshToken: string });
  return true;
}

function ensureRefresh(): Promise<boolean> {
  refreshInFlight ??= refreshTokens().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const { body, query, headers, skipAuthRefresh: _skip, ...rest } = options;
  const accessToken = getAccessToken();

  return fetch(buildUrl(path, query), {
    ...rest,
    // Web нь cookie session ашиглана.
    credentials: rest.credentials ?? "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      // Mobile — токен байгаа үед л нэмнэ.
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

async function sendUpload(path: string, body: Blob, options: UploadOptions): Promise<Response> {
  const accessToken = getAccessToken();
  return fetch(buildUrl(path), {
    method: "POST",
    credentials: "include",
    headers: {
      ...(options.contentType ? { "Content-Type": options.contentType } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
  });
}

/**
 * Амжилтгүй үед ЗААВАЛ шидэнэ — { success, data, error } биш.
 * Ингэснээр TanStack Query алдааг өөрөө барьж, дуудагч тал бүрт
 * гараар шалгах шаардлагагүй болно.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options);

  // 401 → нэг удаа токен сэргээгээд дахин оролдоно.
  if (response.status === 401 && !options.skipAuthRefresh && (await ensureRefresh())) {
    response = await send(path, { ...options, skipAuthRefresh: true });
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function apiUpload<T>(
  path: string,
  body: Blob,
  options: UploadOptions = {},
): Promise<T> {
  let response = await sendUpload(path, body, options);

  if (response.status === 401 && !options.skipAuthRefresh && (await ensureRefresh())) {
    response = await sendUpload(path, body, { ...options, skipAuthRefresh: true });
  }

  if (!response.ok) throw new ApiError(response.status, await parseError(response));
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  upload: <T>(path: string, body: Blob, options?: UploadOptions) =>
    apiUpload<T>(path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
