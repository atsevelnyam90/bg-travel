import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { auth } from "@/api/generated/contracts";

const fetchMeMock = vi.hoisted(() => vi.fn());

vi.mock("../api", () => ({ fetchMe: fetchMeMock }));
vi.mock("@/lib/api/apiClient", () => ({
  ApiError: class ApiError extends Error {
    readonly status = 500;
  },
}));

import { sessionKeys, useSession } from "./useSession";

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

describe("useSession", () => {
  beforeEach(() => {
    fetchMeMock.mockReset();
  });

  it("олон observer нэг session request болон шинэчлэгдсэн state-ийг хуваалцана", async () => {
    let resolveSession: (value: auth.Me) => void = () => undefined;
    const pendingSession = new Promise<auth.Me>((resolve) => {
      resolveSession = resolve;
    });
    fetchMeMock.mockReturnValue(pendingSession);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(sessionKeys.me, null);

    const { result } = renderHook(() => ({ bootstrap: useSession(), guard: useSession() }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(fetchMeMock).toHaveBeenCalledOnce());
    expect(result.current.bootstrap.isLoading).toBe(true);
    expect(result.current.guard.isLoading).toBe(true);

    await act(async () => resolveSession(session));

    await waitFor(() => expect(result.current.guard.isAuthenticated).toBe(true));
    expect(result.current.bootstrap.session).toEqual(session);
    expect(result.current.guard.session).toEqual(session);
  });

  it("route observer unmount болсон ч эхэлсэн session check-ийг дуусгаж cache-д хадгална", async () => {
    let resolveSession: (value: auth.Me) => void = () => undefined;
    const pendingSession = new Promise<auth.Me>((resolve) => {
      resolveSession = resolve;
    });
    fetchMeMock.mockReturnValue(pendingSession);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = createWrapper(queryClient);
    const firstObserver = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(fetchMeMock).toHaveBeenCalledOnce());
    firstObserver.unmount();
    await act(async () => resolveSession(session));
    await waitFor(() => expect(queryClient.getQueryData(sessionKeys.me)).toEqual(session));

    const secondObserver = renderHook(() => useSession(), { wrapper });

    expect(secondObserver.result.current.isAuthenticated).toBe(true);
    expect(fetchMeMock).toHaveBeenCalledOnce();
  });
});
