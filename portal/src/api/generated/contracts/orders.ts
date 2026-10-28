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

export const adminOrderDepartureOptionSchema = z.object({
  id: z.uuid(),
  travelId: z.uuid(),
  travelName: z.string(),
  departureDate: z.iso.date(),
  returnDate: z.iso.date(),
  transportType: orderTransportTypeSchema,
  unitPriceMinor: z.number().int().min(0),
  capacity: z.number().int().positive(),
  remainingSeats: z.number().int().min(0),
  isBookingOpen: z.boolean(),
});
export type AdminOrderDepartureOption = z.infer<typeof adminOrderDepartureOptionSchema>;
export const listAdminOrderDepartureOptionsResponseSchema = z.array(
  adminOrderDepartureOptionSchema,
);
export type ListAdminOrderDepartureOptionsResponse = z.infer<
  typeof listAdminOrderDepartureOptionsResponseSchema
>;

export const listAdminOrdersQuerySchema = paginationQuerySchema.extend({
  status: orderStatusSchema.optional(),
});
export type ListAdminOrdersQuery = z.infer<typeof listAdminOrdersQuerySchema>;
export const listAdminOrdersResponseSchema = paginatedSchema(adminOrderSchema);
export type ListAdminOrdersResponse = z.infer<typeof listAdminOrdersResponseSchema>;

export const orderDashboardDaysSchema = z.union([z.literal(7), z.literal(14), z.literal(30)]);
export const orderDashboardQuerySchema = z.object({
  days: z.coerce.number().pipe(orderDashboardDaysSchema).default(7),
});
export type OrderDashboardQuery = z.infer<typeof orderDashboardQuerySchema>;
export const orderDashboardSchema = z.object({
  days: orderDashboardDaysSchema,
  totalOrders: z.number().int().min(0),
  paidRevenueMinor: z.number().int().min(0),
  daily: z.array(
    z.object({
      date: z.iso.date(),
      orders: z.number().int().min(0),
      paidRevenueMinor: z.number().int().min(0),
    }),
  ),
  topTrips: z.array(
    z.object({
      travelId: z.uuid(),
      name: z.string(),
      travelerCount: z.number().int().min(0),
    }),
  ),
});
export type OrderDashboard = z.infer<typeof orderDashboardSchema>;

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

export const createAdminOrderSchema = adminOrderInputBaseSchema.omit({
  publicOrderId: true,
  idempotencyKey: true,
});
export type CreateAdminOrderInput = z.infer<typeof createAdminOrderSchema>;
export const updateAdminOrderSchema = adminOrderInputBaseSchema.extend({
  version: z.number().int().min(0),
});
export type UpdateAdminOrderInput = z.infer<typeof updateAdminOrderSchema>;
export const confirmAdminOrderSchema = z.object({ version: z.number().int().min(0) });
export type ConfirmAdminOrderInput = z.infer<typeof confirmAdminOrderSchema>;
