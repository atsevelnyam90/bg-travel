import { beforeEach, describe, expect, it, vi } from "vitest";

const platformMock = vi.hoisted(() => ({
  name: "web" as "web" | "native",
  storage: {
    get: vi.fn<(key: string) => Promise<string | null>>(),
    set: vi.fn<(key: string, value: string) => Promise<void>>(),
    remove: vi.fn<(key: string) => Promise<void>>(),
  },
}));

vi.mock("@/platform", () => ({ platform: platformMock }));

import { getAccessToken, getRefreshToken, loadTokens, setTokens } from "./authTokens";

describe("web auth token boundary", () => {
  beforeEach(() => {
    platformMock.name = "web";
    platformMock.storage.get.mockReset();
    platformMock.storage.set.mockReset();
    platformMock.storage.remove.mockReset();
    platformMock.storage.remove.mockResolvedValue(undefined);
  });

  it("ignores and removes bearer tokens because web auth uses the session cookie", async () => {
    platformMock.storage.get.mockResolvedValue("stale-token");

    await loadTokens();
    await setTokens({ accessToken: "access", refreshToken: "refresh" });

    expect(getAccessToken()).toBeNull();
    await expect(getRefreshToken()).resolves.toBeNull();
    expect(platformMock.storage.get).not.toHaveBeenCalled();
    expect(platformMock.storage.set).not.toHaveBeenCalled();
    expect(platformMock.storage.remove).toHaveBeenCalledTimes(2);
  });
});
