import { randomUUID } from "node:crypto";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * S3-тэй нийцтэй хадгалалт.
 *
 * Файлыг backend-ээр ДАМЖУУЛАХГҮЙ — клиент шууд S3 руу тавина (presigned URL).
 * Ингэснээр том файл backend-ийн санах ой, хугацааг идэхгүй, тэлэлт хялбар.
 *
 * Провайдер солиход зөвхөн env: AWS S3, Cloudflare R2, DigitalOcean Spaces,
 * MinIO — API ижил.
 */
export const s3 = new S3Client({
  region: env.S3_REGION,
  ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT } : {}),
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

/** Хөгжүүлэлтэд bucket байхгүй бол үүсгэнэ. Production-д IaC хийнэ. */
export async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
      logger.info({ bucket: env.S3_BUCKET }, "S3 bucket үүсгэлээ");
    } catch (error) {
      const message =
        env.NODE_ENV === "development"
          ? "S3/MinIO холбогдсонгүй. Файл upload хэрэглэх бол `pnpm infra:up` ажиллуулна."
          : "S3 bucket үүсгэж чадсангүй";
      const log =
        env.NODE_ENV === "development" ? logger.warn.bind(logger) : logger.error.bind(logger);
      log({ err: error, bucket: env.S3_BUCKET }, message);
    }
  }
}

const EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

/** Зөвшөөрөгдсөн төрлүүд — клиентээс ирсэн mime-д БҮҮ итгэ, жагсаалттай тулга. */
export const ALLOWED_CONTENT_TYPES = Object.keys(EXTENSION);
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type PresignInput = {
  contentType: string;
  contentLength: number;
  /** Логик folder: "product", "avatar", "contract" */
  scope: string;
};

export type PresignResult = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresInSeconds: number;
};

export async function presignUpload(input: PresignInput): Promise<PresignResult> {
  // Файлын НЭРИЙГ клиентээс авахгүй — зам таах, дарж бичих, кирилл/зайны
  // асуудлаас сэргийлнэ. Түлхүүрийг бид өөрсдөө үүсгэнэ.
  const extension = EXTENSION[input.contentType] ?? "bin";
  const key = `${input.scope}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;

  const expiresInSeconds = 300;
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: input.contentType,
      // Гарын үсэгт орсон утга — клиент өөр хэмжээ тавьвал S3 татгалзана.
      ContentLength: input.contentLength,
    }),
    { expiresIn: expiresInSeconds },
  );

  return {
    uploadUrl,
    key,
    publicUrl: `${env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`,
    expiresInSeconds,
  };
}
