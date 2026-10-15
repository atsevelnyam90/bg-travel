import { z } from "zod";

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
