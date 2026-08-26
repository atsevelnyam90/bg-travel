import { z } from "zod";

// Серверийн орчны хувьсагч. Алдаа BOOT үед гарна — runtime-д "undefined"
// болж тарахгүй. Нууц утгууд ЗӨВХӨН энд, frontend руу хэзээ ч гарахгүй.
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL шаардлагатай"),

  /// Session cookie болон access token гарын үсэг зурахад. 32+ тэмдэгт.
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET дор хаяж 32 тэмдэгт байна"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().default(900),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .default(60 * 60 * 24 * 30),
  SESSION_TTL_SECONDS: z.coerce
    .number()
    .int()
    .default(60 * 60 * 24 * 7),

  // ─── И-мэйл ───
  // Хөгжүүлэлтэд Mailpit (docker compose): localhost:1025, UI :8025
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.stringbool().default(false),
  MAIL_FROM: z.string().default("Starter <no-reply@example.mn>"),
  /// Урилгын холбоос энэ хаяг дээр тогтоно.
  APP_URL: z.url().default("http://localhost:3000"),

  // ─── Файл хадгалалт (S3-тэй нийцтэй) ───
  // Хөгжүүлэлтэд MinIO (docker compose): http://localhost:9000
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("starter"),
  S3_ACCESS_KEY_ID: z.string().default("minioadmin"),
  S3_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
  /// MinIO болон зарим провайдер path-style шаарддаг (bucket нь замд, домэйнд биш).
  S3_FORCE_PATH_STYLE: z.stringbool().default(true),
  /// Файлын нийтэд харагдах суурь хаяг (CDN эсвэл bucket).
  S3_PUBLIC_URL: z.string().default("http://localhost:9000/starter"),

  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Орчны хувьсагч буруу байна:\n${z.prettifyError(parsed.error)}\n.env.example-ийг үз.`,
  );
}

export const env = parsed.data;
