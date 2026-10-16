import type { auth } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const login = (input: auth.LoginInput) => api.post<auth.TokenPair>("/auth/login", input);

export const logout = () => api.post<void>("/auth/logout");

const SESSION_REQUEST_TIMEOUT_MS = 5_000;

export async function fetchMe(parentSignal?: AbortSignal): Promise<auth.Me> {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();
  const timeoutId = setTimeout(() => controller.abort(), SESSION_REQUEST_TIMEOUT_MS);

  if (parentSignal?.aborted) {
    controller.abort();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  }

  try {
    return await api.get<auth.Me>("/auth/me", {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
    parentSignal?.removeEventListener("abort", abortFromParent);
  }
}
