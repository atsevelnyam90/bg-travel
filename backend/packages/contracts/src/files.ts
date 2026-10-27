import { z } from "zod";

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const presignUploadSchema = z.object({
  contentType: z.enum(ALLOWED_UPLOAD_TYPES, {
    message: "Зөвхөн зураг (jpg, png, webp, gif) эсвэл PDF",
  }),
  contentLength: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, "Файл 10MB-аас том байж болохгүй"),
  /** Логик folder: сервер өөрөө түлхүүр үүсгэнэ. */
  scope: z.enum(["product", "avatar", "contract", "travel"]),
});
export type PresignUploadInput = z.infer<typeof presignUploadSchema>;

export const presignUploadResponseSchema = z.object({
  /** Клиент ЭНЭ хаяг руу шууд PUT хийнэ — backend-ээр дамжуулахгүй. */
  uploadUrl: z.string(),
  key: z.string(),
  publicUrl: z.string(),
  expiresInSeconds: z.number().int(),
});
export type PresignUploadResponse = z.infer<typeof presignUploadResponseSchema>;
