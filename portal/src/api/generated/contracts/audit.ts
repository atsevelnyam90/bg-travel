// ⚠️ АВТОМАТААР ҮҮССЭН ФАЙЛ — ГАРААР БҮҮ ЗАС.
// Эх сурвалж: backend/packages/contracts/src
// Дахин үүсгэх: pnpm gen:contracts
import { z } from "zod";
import { paginatedSchema, paginationQuerySchema } from "./shared";

export const auditEntrySchema = z.object({
  id: z.uuid(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().nullable(),
  /** Өөрчлөгдсөн талбарууд. Бүтэн объект БИШ — нууц утга орохоос сэргийлнэ. */
  meta: z.unknown().nullable(),
  ip: z.string().nullable(),
  createdAt: z.iso.datetime(),
  actor: z.object({ id: z.uuid(), name: z.string(), email: z.email() }).nullable(),
});
export type AuditEntry = z.infer<typeof auditEntrySchema>;

export const listAuditQuerySchema = paginationQuerySchema.extend({
  resource: z.string().optional(),
});
export type ListAuditQuery = z.infer<typeof listAuditQuerySchema>;

export const listAuditResponseSchema = paginatedSchema(auditEntrySchema);
export type ListAuditResponse = z.infer<typeof listAuditResponseSchema>;
