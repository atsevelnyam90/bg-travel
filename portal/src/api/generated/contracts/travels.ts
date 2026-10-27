// ⚠️ АВТОМАТААР ҮҮССЭН ФАЙЛ — ГАРААР БҮҮ ЗАС.
// Эх сурвалж: backend/packages/contracts/src
// Дахин үүсгэх: pnpm gen:contracts
import { z } from "zod";
import { paginatedSchema, paginationQuerySchema } from "./shared";

export const publicTravelLocaleSchema = z.enum(["mn", "en", "zh", "ko"]);
export type PublicTravelLocale = z.infer<typeof publicTravelLocaleSchema>;

export const publicTravelsQuerySchema = z.object({
  locale: publicTravelLocaleSchema.default("mn"),
});
export type PublicTravelsQuery = z.infer<typeof publicTravelsQuerySchema>;

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

export const travelCategorySchema = z.enum(["DOMESTIC", "INTERNATIONAL", "WEDDING"]);
export const travelStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const travelTransportTypeSchema = z.enum(["GROUND", "DIRECT_FLIGHT"]);

export const adminTravelDepartureSchema = z.object({
  id: z.uuid(),
  departureDate: z.iso.date(),
  returnDate: z.iso.date(),
  transportType: travelTransportTypeSchema,
  unitPriceMinor: z.number().int().min(0),
  capacity: z.number().int().positive(),
  isBookingOpen: z.boolean(),
  version: z.number().int().min(0),
});
export type AdminTravelDeparture = z.infer<typeof adminTravelDepartureSchema>;

export const adminTravelSectionSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  titleEn: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  titleZh: z.string().nullable(),
  descriptionZh: z.string().nullable(),
  titleKo: z.string().nullable(),
  descriptionKo: z.string().nullable(),
  mapImage: z.string().nullable(),
  images: z.array(z.string()),
  sortOrder: z.number().int(),
  version: z.number().int().min(0),
});
export type AdminTravelSection = z.infer<typeof adminTravelSectionSchema>;

export const adminTravelDetailSchema = z.object({
  id: z.uuid(),
  sectionId: z.uuid().nullable(),
  dayNumber: z.number().int().positive(),
  title: z.string(),
  content: z.string().nullable(),
  titleEn: z.string().nullable(),
  contentEn: z.string().nullable(),
  titleZh: z.string().nullable(),
  contentZh: z.string().nullable(),
  titleKo: z.string().nullable(),
  contentKo: z.string().nullable(),
  images: z.array(z.string()),
  version: z.number().int().min(0),
});
export type AdminTravelDetail = z.infer<typeof adminTravelDetailSchema>;

const adminTravelFields = {
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  destinationLabel: z.string().trim().max(200).nullable(),
  tagline: z.string().trim().max(500).nullable(),
  nameEn: z.string().trim().max(200).nullable(),
  destinationLabelEn: z.string().trim().max(200).nullable(),
  taglineEn: z.string().trim().max(500).nullable(),
  descriptionEn: z.string().nullable(),
  nameZh: z.string().trim().max(200).nullable(),
  destinationLabelZh: z.string().trim().max(200).nullable(),
  taglineZh: z.string().trim().max(500).nullable(),
  descriptionZh: z.string().nullable(),
  nameKo: z.string().trim().max(200).nullable(),
  destinationLabelKo: z.string().trim().max(200).nullable(),
  taglineKo: z.string().trim().max(500).nullable(),
  descriptionKo: z.string().nullable(),
  category: travelCategorySchema,
  status: travelStatusSchema,
  coverImage: z.string().nullable(),
  durationDays: z.number().int().positive(),
  description: z.string().nullable(),
};

export const adminTravelListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  category: travelCategorySchema,
  status: travelStatusSchema,
  durationDays: z.number().int().positive(),
  version: z.number().int().min(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type AdminTravelListItem = z.infer<typeof adminTravelListItemSchema>;

export const adminTravelSchema = z.object({
  id: z.uuid(),
  ...adminTravelFields,
  version: z.number().int().min(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  departures: z.array(adminTravelDepartureSchema),
  sections: z.array(adminTravelSectionSchema),
  details: z.array(adminTravelDetailSchema),
});
export type AdminTravel = z.infer<typeof adminTravelSchema>;

export const listAdminTravelsQuerySchema = paginationQuerySchema.extend({
  category: travelCategorySchema.optional(),
  status: travelStatusSchema.optional(),
});
export type ListAdminTravelsQuery = z.infer<typeof listAdminTravelsQuerySchema>;
export const listAdminTravelsResponseSchema = paginatedSchema(adminTravelListItemSchema);
export type ListAdminTravelsResponse = z.infer<typeof listAdminTravelsResponseSchema>;

const nullableText = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value) => value || null);
const departureInputSchema = z
  .object({
    id: z.uuid().optional(),
    version: z.number().int().min(0).optional(),
    _delete: z.boolean().optional(),
    departureDate: z.iso.date(),
    returnDate: z.iso.date(),
    transportType: travelTransportTypeSchema,
    unitPriceMinor: z.number().int().min(0),
    capacity: z.number().int().positive(),
    isBookingOpen: z.boolean(),
  })
  .refine((value) => !value.id || value.version !== undefined, {
    message: "Засах гаралтад version заавал хэрэгтэй",
  });
const sectionInputSchema = z
  .object({
    id: z.uuid().optional(),
    version: z.number().int().min(0).optional(),
    _delete: z.boolean().optional(),
    title: z.string().trim().min(1).max(200),
    description: nullableText,
    titleEn: nullableText,
    descriptionEn: nullableText,
    titleZh: nullableText,
    descriptionZh: nullableText,
    titleKo: nullableText,
    descriptionKo: nullableText,
    mapImage: nullableText,
    images: z.array(z.string()).default([]),
    sortOrder: z.number().int().default(0),
  })
  .refine((value) => !value.id || value.version !== undefined, {
    message: "Засах бүлэгт version заавал хэрэгтэй",
  });
const detailInputSchema = z
  .object({
    id: z.uuid().optional(),
    version: z.number().int().min(0).optional(),
    _delete: z.boolean().optional(),
    sectionId: z.uuid().nullable().optional(),
    dayNumber: z.number().int().positive(),
    title: z.string().trim().min(1).max(200),
    content: nullableText,
    titleEn: nullableText,
    contentEn: nullableText,
    titleZh: nullableText,
    contentZh: nullableText,
    titleKo: nullableText,
    contentKo: nullableText,
    images: z.array(z.string()).default([]),
  })
  .refine((value) => !value.id || value.version !== undefined, {
    message: "Засах хөтөлбөрт version заавал хэрэгтэй",
  });

const adminTravelInputBaseSchema = z.object({
  ...adminTravelFields,
  departures: z.array(departureInputSchema).default([]),
  sections: z.array(sectionInputSchema).default([]),
  details: z.array(detailInputSchema).default([]),
});
export const createAdminTravelSchema = adminTravelInputBaseSchema;
export type CreateAdminTravelInput = z.infer<typeof createAdminTravelSchema>;
export const updateAdminTravelSchema = adminTravelInputBaseSchema.extend({
  version: z.number().int().min(0),
});
export type UpdateAdminTravelInput = z.infer<typeof updateAdminTravelSchema>;
