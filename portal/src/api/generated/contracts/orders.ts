// ⚠️ АВТОМАТААР ҮҮССЭН ФАЙЛ — ГАРААР БҮҮ ЗАС.
// Эх сурвалж: backend/packages/contracts/src
// Дахин үүсгэх: pnpm gen:contracts
import { z } from "zod";
import { paginatedSchema, paginationQuerySchema } from "./shared";

export const createPublicOrderSchema = z.object({
  slotPublicId: z.uuid(),
  travelerCount: z.number().int().min(1).max(12),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.email().max(255),
  address: z.string().trim().max(500).optional(),
  idempotencyKey: z.uuid(),
});
export type CreatePublicOrderInput = z.infer<typeof createPublicOrderSchema>;

export const publicPaymentInfoSchema = z.object({
  currency: z.literal("MNT"),
  bankName: z.string(),
  bankAccount: z.string(),
  bankAccountName: z.string(),
});
export type PublicPaymentInfo = z.infer<typeof publicPaymentInfoSchema>;

export const publicOrderPaymentSchema = publicPaymentInfoSchema.extend({
  /** Гараар шилжүүлэх үед ашиглах захиалгын давтагдашгүй утга. */
  reference: z.string(),
  amountMinor: z.number().int().min(0),
});
export type PublicOrderPayment = z.infer<typeof publicOrderPaymentSchema>;

export const publicOrderSchema = z.object({
  publicOrderId: z.string(),
  status: z.literal("AWAITING_PAYMENT"),
  totalPriceMinor: z.number().int().min(0),
  payment: publicOrderPaymentSchema,
});
export type PublicOrder = z.infer<typeof publicOrderSchema>;

export const orderStatusSchema = z.enum(["AWAITING_PAYMENT", "PAID"]);
export const orderTransportTypeSchema = z.enum(["GROUND", "DIRECT_FLIGHT"]);

export const adminOrderSchema = z.object({
  id: z.uuid(),
  publicOrderId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.email(),
  serviceCode: z.string(),
  travelDepartureId: z.uuid().nullable(),
  transportType: orderTransportTypeSchema.nullable(),
  travelDate: z.iso.date(),
  travelerCount: z.number().int().positive(),
  serviceNameSnapshot: z.string(),
  transportNameSnapshot: z.string().nullable(),
  unitPriceMinor: z.number().int().min(0),
  totalPriceMinor: z.number().int().min(0),
  status: orderStatusSchema,
  confirmedByUserId: z.uuid().nullable(),
  confirmedAt: z.iso.datetime().nullable(),
  idempotencyKey: z.string(),
  version: z.number().int().min(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type AdminOrder = z.infer<typeof adminOrderSchema>;

export const listAdminOrdersQuerySchema = paginationQuerySchema.extend({
  status: orderStatusSchema.optional(),
});
export type ListAdminOrdersQuery = z.infer<typeof listAdminOrdersQuerySchema>;
export const listAdminOrdersResponseSchema = paginatedSchema(adminOrderSchema);
export type ListAdminOrdersResponse = z.infer<typeof listAdminOrdersResponseSchema>;

const adminOrderInputBaseSchema = z.object({
  publicOrderId: z.string().trim().min(1).max(20),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  address: z.string().trim().max(500),
  phone: z.string().trim().min(6).max(30),
  email: z.email().max(255),
  serviceCode: z.string().trim().min(1).max(50),
  travelDepartureId: z.uuid().nullable().optional(),
  transportType: orderTransportTypeSchema.nullable(),
  travelDate: z.iso.date(),
  travelerCount: z.number().int().min(1).max(100),
  serviceNameSnapshot: z.string().trim().min(1).max(255),
  transportNameSnapshot: z.string().trim().max(100).nullable(),
  unitPriceMinor: z.number().int().min(0),
  totalPriceMinor: z.number().int().min(0),
  status: orderStatusSchema,
  idempotencyKey: z.string().trim().min(1).max(64),
});

export const createAdminOrderSchema = adminOrderInputBaseSchema;
export type CreateAdminOrderInput = z.infer<typeof createAdminOrderSchema>;
export const updateAdminOrderSchema = adminOrderInputBaseSchema.extend({
  version: z.number().int().min(0),
});
export type UpdateAdminOrderInput = z.infer<typeof updateAdminOrderSchema>;
export const confirmAdminOrderSchema = z.object({ version: z.number().int().min(0) });
export type ConfirmAdminOrderInput = z.infer<typeof confirmAdminOrderSchema>;
