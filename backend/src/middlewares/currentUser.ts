import type { NextFunction, Request, Response } from "express";
import { logger } from "@/lib/logger";
import { resolveAuthContext } from "@/modules/auth/authContext";
import { getSession } from "@/modules/auth/sessionService";
import { verifyAccessToken } from "@/modules/auth/tokenService";

export const SESSION_COOKIE = "sid";

// winu-гийн currentUser.ts нь олон session удирдлагатай (req.session.sessions{},
// currentSessionKey, ?key= query, lastAccessed-аар эрэмбэлэх fallback) байсан.
// Тэр нь "нэг хүн олон бизнес хооронд шилжих" хэрэгцээнээс үүссэн. Starter нь
// нэг deployment = нэг байгууллага загвартай тул огт хэрэггүй.
//
// Хоёр зам:
//   Bearer JWT   — mobile (Capacitor)
//   Session cookie — web portal
//
// Нэвтрээгүй бол ЭНД алдаа шидэхгүй — req.auth-ыг хоосон орхино.
// Шаардлагыг requirePermission / requireAuth тавина.

function getBearerToken(req: Request): string | null {
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

export async function currentUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const bearer = getBearerToken(req);
    if (bearer) {
      const payload = verifyAccessToken(bearer);
      if (payload) {
        const session = await getSession(payload.sessionKey);
        if (session) {
          req.auth =
            (await resolveAuthContext({
              userId: payload.sub,
              sessionKey: payload.sessionKey,
            })) ?? undefined;
        }
      }
      return next();
    }

    const cookieKey = req.cookies?.[SESSION_COOKIE];
    if (typeof cookieKey === "string" && cookieKey) {
      const session = await getSession(cookieKey);
      if (session) {
        req.auth =
          (await resolveAuthContext({
            userId: session.userId,
            sessionKey: session.key,
          })) ?? undefined;
      }
    }

    next();
  } catch (error) {
    // Auth уншихад алдаа гарвал хүсэлтийг унагахгүй — нэвтрээгүй гэж үзнэ.
    logger.error({ err: error }, "currentUser middleware error");
    next();
  }
}
