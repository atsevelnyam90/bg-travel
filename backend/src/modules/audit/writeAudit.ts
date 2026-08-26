import type { Request } from "express";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * Аудитын бичилт.
 *
 * ERP клиент эхний долоо хоногт л "хэн өөрчилсөн бэ" гэж асуудаг.
 * Загвар нь байсан ч бичдэг код байгаагүй — энэ түүнийг нөхнө.
 *
 * ⚠️ Аудит бичих нь үндсэн үйлдлийг УНАГААХГҮЙ. Лог үлдээгээгүй нь муу,
 * гэхдээ хэрэглэгчийн хадгалсан өгөгдөл алдагдах нь дор.
 */
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "invite"
  | "login"
  | "logout"
  | "accept-invite";

export type AuditInput = {
  action: AuditAction;
  /** Домэйн нэр: "product", "user", "organization", "role" */
  resource: string;
  resourceId?: string | null;
  /** Нэмэлт контекст. Нууц утга БҮҮ хий. */
  meta?: Record<string, unknown>;
};

/** Express хүсэлтээс actor болон IP-г авна. */
export function auditFromRequest(req: Request) {
  return (input: AuditInput) =>
    writeAudit({ ...input, actorId: req.auth?.userId ?? null, ip: req.ip ?? null });
}

export async function writeAudit(
  input: AuditInput & { actorId?: string | null; ip?: string | null },
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        meta: input.meta ? (input.meta as object) : undefined,
        ip: input.ip ?? null,
      },
    });
  } catch (error) {
    logger.error({ err: error, audit: input }, "Аудит бичихэд алдаа");
  }
}

/**
 * Өөрчлөгдсөн талбаруудыг л тэмдэглэнэ — бүтэн объект хадгалвал хүснэгт
 * хурдан хавдаж, нууц утга санамсаргүй орох эрсдэлтэй.
 */
export function changedFields<T extends Record<string, unknown>>(
  before: T,
  after: T,
  ignore: string[] = ["updatedAt", "version"],
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    if (ignore.includes(key)) continue;
    if (before[key] !== after[key]) diff[key] = { from: before[key], to: after[key] };
  }
  return diff;
}
