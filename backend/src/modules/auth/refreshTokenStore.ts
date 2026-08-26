import { prisma } from "@/lib/prisma";
import type { RefreshTokenStore } from "./tokenService";

// tokenService-ийн port-ын Prisma хэрэгжүүлэлт.
export const refreshTokenStore: RefreshTokenStore = {
  create: ({ tokenHash, userId, sessionKey, expiresAt }) =>
    prisma.refreshToken.create({
      data: { tokenHash, userId, sessionKey, expiresAt },
      select: { id: true, userId: true, sessionKey: true, expiresAt: true, revokedAt: true },
    }),

  findByHash: (tokenHash) =>
    prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, sessionKey: true, expiresAt: true, revokedAt: true },
    }),

  revoke: async (id, replacedBy) => {
    await prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedBy },
    });
  },

  revokeSession: async (sessionKey) => {
    await prisma.refreshToken.updateMany({
      where: { sessionKey, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
