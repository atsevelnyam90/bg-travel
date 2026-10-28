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

  it("debounces column filters and returns to the first page", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDataTableState({ filterDelayMs: 350 }));

    act(() => result.current.setPage(4));
    act(() => result.current.setFilter("name", "gobi"));
    expect(result.current.page).toBe(1);
    expect(result.current.filters.name).toBe("gobi");
    expect(result.current.query.name).toBeUndefined();

    act(() => vi.advanceTimersByTime(350));
    expect(result.current.query.name).toBe("gobi");

    act(() => result.current.setFilter("name", ""));
    expect(result.current.filters.name).toBeUndefined();
    act(() => vi.advanceTimersByTime(350));
    expect(result.current.query.name).toBeUndefined();
  });
});
