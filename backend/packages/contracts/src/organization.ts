import { z } from "zod";

export const organizationSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.url().nullable(),
  bankCode: z.string().nullable(),
  bankAccount: z.string().nullable(),
  bankAccountName: z.string().nullable(),
});
export type Organization = z.infer<typeof organizationSchema>;

const bankAccountSchema = z
  .string()
  .transform((value) => value.replace(/\s+/g, "").toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^(?:|MN\d{18}|\d{1,30})$/,
        "Монгол IBAN (MN + 18 цифр) эсвэл дансны дугаар оруулна уу",
      ),
  );

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Нэр оруулна уу").max(200),
  logoUrl: z.url("Хаяг буруу").nullable().optional(),
  bankCode: z.string().max(20).nullable().optional(),
  // 2025 оноос ашиглаж буй Монгол IBAN болон хуучин numeric дансыг дэмжинэ.
  bankAccount: bankAccountSchema.nullable().optional(),
  bankAccountName: z.string().max(100).nullable().optional(),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

/** Монголбанкны оролцогч банк — mn-integrations/banks-аас. */
export const bankSchema = z.object({
  code: z.string(),
  bic: z.string(),
  name: z.string(),
  nameEn: z.string(),
});
export type Bank = z.infer<typeof bankSchema>;

export const paymentQrSchema = z.object({
  /** EMVCo стандартын QR payload. Клиент үүнийг зурган QR болгож харуулна. */
  payload: z.string(),
  /**
   * Гүйлгээний утга — ДАВТАГДАШГҮЙ. QR-аар биш, гараар шилжүүлэх хүнд ч
   * хэрэгтэй тул UI дээр ил харуулна.
   *
   * ⚠️ Төлбөр орсныг систем автоматаар мэдэхгүй. Энэ лавлагаа нь дансны
   * хуулгатай тулгах боломжийг л олгож байна.
   */
  reference: z.string(),
  amountMinor: z.number().int(),
  currency: z.string(),
  bankName: z.string(),
});
export type PaymentQr = z.infer<typeof paymentQrSchema>;
