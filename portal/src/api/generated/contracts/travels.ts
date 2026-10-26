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
  remainingSeats: z.number().int().min(0),
});
export type PublicTravelSlot = z.infer<typeof publicTravelSlotSchema>;

export const publicTravelDetailSchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string(),
  content: z.string().nullable(),
  images: z.array(z.string()),
});
export type PublicTravelDetail = z.infer<typeof publicTravelDetailSchema>;

export const publicTravelItinerarySectionSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  mapImage: z.string().nullable(),
  images: z.array(z.string()),
  details: z.array(publicTravelDetailSchema),
});
export type PublicTravelItinerarySection = z.infer<typeof publicTravelItinerarySectionSchema>;

export const publicTravelSchema = z.object({
  publicId: z.uuid(),
  slug: z.string().min(1),
  name: z.string(),
  destinationLabel: z.string().nullable(),
  tagline: z.string().nullable(),
  description: z.string().nullable(),
  category: z.enum(["DOMESTIC", "INTERNATIONAL", "WEDDING"]),
  coverImage: z.string().nullable(),
  durationDays: z.number().int().positive(),
  details: z.array(publicTravelDetailSchema),
  itinerarySections: z.array(publicTravelItinerarySectionSchema),
  slots: z.array(publicTravelSlotSchema),
});
export type PublicTravel = z.infer<typeof publicTravelSchema>;

export const listPublicTravelsResponseSchema = z.array(publicTravelSchema);
export type ListPublicTravelsResponse = z.infer<typeof listPublicTravelsResponseSchema>;

export const getPublicTravelResponseSchema = publicTravelSchema;
export type GetPublicTravelResponse = z.infer<typeof getPublicTravelResponseSchema>;
