import { auth as authContract } from "@winu/contracts";
import { type CookieOptions, Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { env } from "@/lib/env";
import { unauthorized } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/middlewares/currentUser";
import { loginRateLimit, refreshRateLimit } from "@/middlewares/rateLimit";
import { requireAuth } from "@/middlewares/requirePermission";
import { writeAudit } from "@/modules/audit/writeAudit";
import { acceptInvite } from "./acceptInvite";
import { verifyPassword } from "./passwordService";
import { refreshTokenStore } from "./refreshTokenStore";
import { createSession, destroySession } from "./sessionService";
import { issueTokenPair, RefreshTokenError, rotateRefreshToken } from "./tokenService";

export const authRouter: Router = Router();

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  // Portal өөр домэйн дээр байвал production-д "none" шаардлагатай.
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: env.SESSION_TTL_SECONDS * 1000,
  path: "/",
});

authRouter.post(
  "/login",
  loginRateLimit,
  asyncHandler(async (req, res) => {
    const { email, password } = authContract.loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, passwordHash: true, status: true, deletedAt: true },
    });

    // И-мэйл байхгүй ба нууц үг буруу хоёрыг ЯЛГААГҮЙ хариулна —
    // эс тэгвэл ямар и-мэйл бүртгэлтэйг тандаж болно.
    if (!user?.passwordHash || user.deletedAt || user.status === "DISABLED") {
      throw unauthorized("И-мэйл эсвэл нууц үг буруу байна");
    }

    if (!(await verifyPassword(password, user.passwordHash))) {
      throw unauthorized("И-мэйл эсвэл нууц үг буруу байна");
    }

    const session = await createSession({
      userId: user.id,
      userAgent: req.header("user-agent") ?? undefined,
      ip: req.ip,
    });

    const pair = await issueTokenPair(refreshTokenStore, {
      userId: user.id,
      sessionKey: session.key,
    });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    await writeAudit({
      action: "login",
      resource: "user",
      resourceId: user.id,
      actorId: user.id,
      ip: req.ip ?? null,
    });

    // Web нь cookie ашиглана, mobile нь хариунаас токеныг авна.
    res.cookie(SESSION_COOKIE, session.key, cookieOptions());
    res.json(pair);
  }),
);

authRouter.post(
  "/refresh",
  refreshRateLimit,
  asyncHandler(async (req, res) => {
    const { refreshToken } = authContract.refreshSchema.parse(req.body);

    try {
      res.json(await rotateRefreshToken(refreshTokenStore, refreshToken));
    } catch (error) {
      if (error instanceof RefreshTokenError) {
        // Аль шалтгаанаар бүтэлгүйтснийг клиентэд задлахгүй.
        throw unauthorized("Дахин нэвтэрнэ үү");
      }
      throw error;
    }
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const key = req.auth?.sessionKey ?? req.cookies?.[SESSION_COOKIE];
    if (typeof key === "string" && key) await destroySession(key);

    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.status(204).end();
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const auth = req.auth;
    if (!auth) throw unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) throw unauthorized();

    // Байгууллага бол ганц мөр — хэрэглэгчээс хамаарахгүй.
    const [organization, withRole] = await Promise.all([
      prisma.organization.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.user.findUnique({
        where: { id: auth.userId },
        select: { role: { select: { id: true, name: true } } },
      }),
    ]);

    const body: authContract.Me = {
      user,
      organization,
      role: withRole?.role ?? null,
      permissions: [...auth.permissions],
    };

    res.json(body);
  }),
);

authRouter.post(
  "/accept-invite",
  // Токен таах оролдлогоос сэргийлнэ.
  loginRateLimit,
  asyncHandler(async (req, res) => {
    const input = authContract.acceptInviteSchema.parse(req.body);
    await acceptInvite(input);
    res.status(204).end();
  }),
);
