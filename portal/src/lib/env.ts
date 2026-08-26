import { z } from "zod";

// Next нь NEXT_PUBLIC_* хувьсагчийг ЗӨВХӨН статик байдлаар бичигдсэн үед
// client bundle-д оруулдаг. Тиймээс process.env-ийг динамикаар давтаж болохгүй —
// хувьсагч бүрийг доор шууд нэрлэж бичнэ.
const clientSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Starter"),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!parsed.success) {
  // Алдааг boot үед л гаргана — runtime-д "undefined" болж тарахаас сэргийлнэ.
  throw new Error(
    `Орчны хувьсагч буруу байна:\n${z.prettifyError(parsed.error)}\n.env.example-ийг үз.`,
  );
}

export const env = parsed.data;
