import { beforeEach, describe, expect, it } from "vitest";
import {
  hashToken,
  issueTokenPair,
  RefreshTokenError,
  type RefreshTokenStore,
  rotateRefreshToken,
  type StoredRefreshToken,
  verifyAccessToken,
} from "./tokenService";

// DB-гүй, санах ойн хуурамч store — логикийг тусад нь шалгана.
function createFakeStore() {
  const rows = new Map<
    string,
    StoredRefreshToken & { tokenHash: string; replacedBy: string | null }
  >();
  let nextId = 1;

  const store: RefreshTokenStore = {
    async create({ tokenHash, userId, sessionKey, expiresAt }) {
      const row = {
        id: String(nextId++),
        tokenHash,
        userId,
        sessionKey,
        expiresAt,
        revokedAt: null,
        replacedBy: null,
      };
      rows.set(tokenHash, row);
      return row;
    },
    async findByHash(tokenHash) {
      return rows.get(tokenHash) ?? null;
    },
    async revoke(id, replacedBy) {
      for (const row of rows.values()) {
        if (row.id === id) {
          row.revokedAt = new Date();
          row.replacedBy = replacedBy;
        }
      }
    },
    async revokeSession(sessionKey) {
      for (const row of rows.values()) {
        if (row.sessionKey === sessionKey) row.revokedAt = new Date();
      }
    },
  };

  return { store, rows };
}

describe("tokenService", () => {
  let fake: ReturnType<typeof createFakeStore>;

  beforeEach(() => {
    fake = createFakeStore();
  });

  it("access token-ыг гаргаад буцааж уншина", async () => {
    const pair = await issueTokenPair(fake.store, { userId: "u1", sessionKey: "s1" });
    const payload = verifyAccessToken(pair.accessToken);

    expect(payload?.sub).toBe("u1");
    expect(payload?.sessionKey).toBe("s1");
    expect(pair.tokenType).toBe("Bearer");
  });

  it("түүхий refresh token-ыг ХАДГАЛАХГҮЙ, зөвхөн hash-ыг", async () => {
    const pair = await issueTokenPair(fake.store, { userId: "u1", sessionKey: "s1" });

    expect(fake.rows.has(pair.refreshToken)).toBe(false);
    expect(fake.rows.has(hashToken(pair.refreshToken))).toBe(true);
  });

  it("гэмтсэн access token-д null буцаана", () => {
    expect(verifyAccessToken("хог.токен.утга")).toBeNull();
  });

  it("rotate хийхэд шинэ хос гарч, хуучин нь хүчингүй болно", async () => {
    const first = await issueTokenPair(fake.store, { userId: "u1", sessionKey: "s1" });
    const second = await rotateRefreshToken(fake.store, first.refreshToken);

    expect(second.refreshToken).not.toBe(first.refreshToken);
    expect(fake.rows.get(hashToken(first.refreshToken))?.revokedAt).not.toBeNull();
    expect(fake.rows.get(hashToken(second.refreshToken))?.revokedAt).toBeNull();
  });

  it("хуучин токеныг дахин ашиглах оролдлого session-ыг бүхэлд нь унтраана", async () => {
    const first = await issueTokenPair(fake.store, { userId: "u1", sessionKey: "s1" });
    const second = await rotateRefreshToken(fake.store, first.refreshToken);

    // Хулгайлагдсан хуучин токеноор дахин оролдох
    await expect(rotateRefreshToken(fake.store, first.refreshToken)).rejects.toThrow(
      RefreshTokenError,
    );

    // Session-ы бүх токен хүчингүй болсон байх ёстой — хулгайч ч, эзэн ч орж чадахгүй
    expect(fake.rows.get(hashToken(second.refreshToken))?.revokedAt).not.toBeNull();
  });

  it("байхгүй токенд NOT_FOUND", async () => {
    await expect(rotateRefreshToken(fake.store, "байхгүй")).rejects.toMatchObject({
      reason: "NOT_FOUND",
    });
  });

  it("хугацаа дууссан токенд EXPIRED", async () => {
    const pair = await issueTokenPair(fake.store, { userId: "u1", sessionKey: "s1" });
    const row = fake.rows.get(hashToken(pair.refreshToken));
    if (row) row.expiresAt = new Date(Date.now() - 1000);

    await expect(rotateRefreshToken(fake.store, pair.refreshToken)).rejects.toMatchObject({
      reason: "EXPIRED",
    });
  });
});
