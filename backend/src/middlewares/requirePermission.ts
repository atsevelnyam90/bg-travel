import type { Permission } from "@winu/contracts";
import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "@/lib/errors";
import type { AuthContext } from "@/modules/auth/authContext";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/** Нэвтэрсэн эсэхийг л шаардана (эрх шалгахгүй). */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) {
    next(unauthorized());
    return;
  }
  next();
}

/**
 * Backend талын эрхийн шалгалт — ҮРГЭЛЖ ЗААВАЛ.
 * Portal дээрх <Can> нь зөвхөн харагдац, хамгаалалт БИШ (05-permissions.md §3).
 */
export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(unauthorized());
      return;
    }
    if (!req.auth.permissions.includes(permission)) {
      next(forbidden());
      return;
    }
    next();
  };
}
