import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDataTableState } from "./useDataTable";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useDataTableState", () => {
  it("updates the input immediately and debounces the server query", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDataTableState({ searchDelayMs: 350 }));

    act(() => result.current.setSearch("paris"));
    expect(result.current.search).toBe("paris");
    expect(result.current.query.search).toBe("");

    act(() => vi.advanceTimersByTime(349));
    expect(result.current.query.search).toBe("");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.query.search).toBe("paris");
  });
});
