import { randomBytes } from "node:crypto";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

// ⚠️ winu-д session нь process санах ой дахь Map байсан бөгөөд express-session-д
// store тохируулаагүй байв (server.ts:145). Deploy бүрт бүх хэрэглэгч гарч,
// олон instance дээр огт ажиллахгүй, санах ой хавддаг байсан.
// Энд DB-д хадгална — restart болон horizontal scale аль алинд ажиллана.

export type SessionContext = {
  key: string;
  userId: string;
};

export async function createSession(input: {
  userId: string;
  userAgent?: string;
  ip?: string;
}): Promise<SessionContext> {
  const key = randomBytes(32).toString("base64url");

  await prisma.session.create({
    data: {
      key,
      userId: input.userId,
      expiresAt: new Date(Date.now() + env.SESSION_TTL_SECONDS * 1000),
      userAgent: input.userAgent,
      ip: input.ip,
    },
  });

  return { key, userId: input.userId };
}

export async function getSession(key: string): Promise<SessionContext | null> {
  const session = await prisma.session.findUnique({
    where: { key },
    select: { key: true, userId: true, expiresAt: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await destroySession(key);
    return null;
  }

  // lastSeenAt-ыг хойш нь шинэчилнэ — хариу буцаахыг хүлээлгэхгүй.
  void prisma.session
    .update({ where: { key }, data: { lastSeenAt: new Date() } })
    .catch(() => undefined);

  return { key: session.key, userId: session.userId };
}

export async function destroySession(key: string): Promise<void> {
  await prisma.session.deleteMany({ where: { key } });
  await prisma.refreshToken.updateMany({
    where: { sessionKey: key, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Хугацаа нь дууссан session-ыг цэвэрлэнэ (cron-оос дуудна). */
export async function cleanupExpiredSessions(): Promise<number> {
  const { count } = await prisma.session.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  return count;
}
