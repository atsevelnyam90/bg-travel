import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

// winu-гийн tokenAuthService-ээс авсан зарчим (тэнд зөв хийгдсэн байсан):
//   - refresh token-ыг ЗӨВХӨН SHA-256 hash-аар хадгална. Түүхий токен DB-д
//     байхгүй тул DB алдагдсан ч дахин ашиглах боломжгүй.
//   - rotation: ашигласан токен хүчингүй болж, шинэ хос гарна.
//
// Ялгаа: DB хандалтыг port-оор тусгаарласан тул логикийг DB-гүйгээр тестлэнэ.

export type AccessTokenPayload = {
  sub: string;
  sessionKey: string;
  type: "access";
};

export type StoredRefreshToken = {
  id: string;
  userId: string;
  sessionKey: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

/** DB давхарга — тестэд хуурамч хэрэгжүүлэлт өгнө. */
export type RefreshTokenStore = {
  create(input: {
    tokenHash: string;
    userId: string;
    sessionKey: string;
    expiresAt: Date;
  }): Promise<StoredRefreshToken>;
  findByHash(tokenHash: string): Promise<StoredRefreshToken | null>;
  revoke(id: string, replacedBy: string | null): Promise<void>;
  revokeSession(sessionKey: string): Promise<void>;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export function issueAccessToken(input: { userId: string; sessionKey: string }): string {
  const payload: AccessTokenPayload = {
    sub: input.userId,
    sessionKey: input.sessionKey,
    type: "access",
  };
  return jwt.sign(payload, env.SESSION_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL_SECONDS });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.SESSION_SECRET);
    if (typeof decoded === "string") return null;
    if (decoded.type !== "access") return null;
    return decoded as AccessTokenPayload;
  } catch {
    // Хугацаа дууссан / гарын үсэг буруу — аль нь болохыг клиентэд хэлэхгүй.
    return null;
  }
}

export async function issueTokenPair(
  store: RefreshTokenStore,
  input: { userId: string; sessionKey: string },
): Promise<TokenPair> {
  const refreshToken = randomBytes(48).toString("base64url");

  await store.create({
    tokenHash: hashToken(refreshToken),
    userId: input.userId,
    sessionKey: input.sessionKey,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000),
  });

  return {
    accessToken: issueAccessToken(input),
    refreshToken,
    tokenType: "Bearer",
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
  };
}

export class RefreshTokenError extends Error {
  constructor(
    message: string,
    readonly reason: "NOT_FOUND" | "REVOKED" | "EXPIRED",
  ) {
    super(message);
    this.name = "RefreshTokenError";
  }
}

/**
 * Токен сольж, шинэ хос гаргана.
 *
 * Аль хэдийн хүчингүй болсон токен ирвэл (дахин ашиглах оролдлого) тухайн
 * session-ы БҮХ токеныг хүчингүй болгоно — токен хулгайлагдсан байж болзошгүй.
 */
export async function rotateRefreshToken(
  store: RefreshTokenStore,
  refreshToken: string,
): Promise<TokenPair> {
  const existing = await store.findByHash(hashToken(refreshToken));

  if (!existing) throw new RefreshTokenError("Токен олдсонгүй", "NOT_FOUND");

  if (existing.revokedAt) {
    await store.revokeSession(existing.sessionKey);
    throw new RefreshTokenError("Токен хүчингүй болсон", "REVOKED");
  }

  if (existing.expiresAt.getTime() <= Date.now()) {
    throw new RefreshTokenError("Токены хугацаа дууссан", "EXPIRED");
  }

  const pair = await issueTokenPair(store, {
    userId: existing.userId,
    sessionKey: existing.sessionKey,
  });

  await store.revoke(existing.id, hashToken(pair.refreshToken));

  return pair;
}
