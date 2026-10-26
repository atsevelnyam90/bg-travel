import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { auth } from "@/api/generated/contracts";

const { fetchMeMock, loginMock, setTokensMock } = vi.hoisted(() => ({
  fetchMeMock: vi.fn(),
  loginMock: vi.fn(),
  setTokensMock: vi.fn(),
}));

vi.mock("../api", () => ({ fetchMe: fetchMeMock, login: loginMock }));
vi.mock("@/lib/api/authTokens", () => ({ setTokens: setTokensMock }));
vi.mock("@/lib/api/apiClient", () => ({
  ApiError: class ApiError extends Error {
    readonly status = 500;
  },
}));

import { useLogin } from "./useLogin";
import { sessionKeys } from "./useSession";

const tokens: auth.TokenPair = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  tokenType: "Bearer",
  expiresIn: 900,
};

const session: auth.Me = {
  user: {
    id: "11111111-1111-4111-8111-111111111111",
    email: "owner@example.mn",
    name: "Owner",
  },
  organization: null,
  role: null,
  permissions: [],
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useLogin", () => {
  beforeEach(() => {
    fetchMeMock.mockReset();
    loginMock.mockReset();
    setTokensMock.mockReset();
  });

  it("admin navigation-аас өмнө stale null session cache-ийг шинэчилнэ", async () => {
    loginMock.mockResolvedValue(tokens);
    setTokensMock.mockResolvedValue(undefined);
    fetchMeMock.mockResolvedValue(session);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(sessionKeys.me, null);
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ email: "owner@example.mn", password: "password" });
    });

    expect(setTokensMock).toHaveBeenCalledWith(tokens);
    expect(fetchMeMock).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(sessionKeys.me)).toEqual(session);
  });
});
