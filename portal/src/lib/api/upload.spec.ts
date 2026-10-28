import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./apiClient";
import { uploadFiles } from "./upload";

vi.mock("./apiClient", () => ({
  ApiError: class extends Error {},
  api: { post: vi.fn() },
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("uploadFiles", () => {
  it("uploads at most three files concurrently and preserves their order", async () => {
    vi.mocked(api.post).mockImplementation(async (_path, body) => {
      const input = body as { contentLength: number };
      return {
        uploadUrl: `https://upload.test/${input.contentLength}`,
        publicUrl: `https://cdn.test/${input.contentLength}`,
      };
    });

    const resolvers: Array<() => void> = [];
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolvers.push(() => resolve(new Response(null, { status: 200 })));
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const files = [1, 2, 3, 4].map(
      (size) => new File([new Uint8Array(size)], `${size}.jpg`, { type: "image/jpeg" }),
    );
    const resultPromise = uploadFiles(files, "travel", undefined, 3);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    resolvers.splice(0, 3).forEach((resolve) => {
      resolve();
    });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    resolvers.splice(0).forEach((resolve) => {
      resolve();
    });

    await expect(resultPromise).resolves.toEqual([
      "https://cdn.test/1",
      "https://cdn.test/2",
      "https://cdn.test/3",
      "https://cdn.test/4",
    ]);
  });
});
