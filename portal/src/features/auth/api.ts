import type { auth } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const login = (input: auth.LoginInput) => api.post<auth.TokenPair>("/auth/login", input);

export const logout = () => api.post<void>("/auth/logout");

const SESSION_REQUEST_TIMEOUT_MS = 5_000;

export async function fetchMe(): Promise<auth.Me> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SESSION_REQUEST_TIMEOUT_MS);

  try {
    return await api.get<auth.Me>("/auth/me", {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
