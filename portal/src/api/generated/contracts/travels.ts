// ⚠️ АВТОМАТААР ҮҮССЭН ФАЙЛ — ГАРААР БҮҮ ЗАС.
// Эх сурвалж: backend/packages/contracts/src
// Дахин үүсгэх: pnpm gen:contracts
import { z } from "zod";

export const publicTravelSlotSchema = z.object({
  publicId: z.uuid(),
  departureDate: z.iso.date(),
  returnDate: z.iso.date(),
  transportType: z.enum(["GROUND", "DIRECT_FLIGHT"]),
  unitPriceMinor: z.number().int().min(0),
  capacity: z.number().int().positive(),
});
export type PublicTravelSlot = z.infer<typeof publicTravelSlotSchema>;

export const publicTravelSchema = z.object({
  publicId: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  slots: z.array(publicTravelSlotSchema),
});
export type PublicTravel = z.infer<typeof publicTravelSchema>;

export const listPublicTravelsResponseSchema = z.array(publicTravelSchema);
export type ListPublicTravelsResponse = z.infer<typeof listPublicTravelsResponseSchema>;
