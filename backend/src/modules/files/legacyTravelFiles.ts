import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { z } from "zod";
import { env } from "@/lib/env";
import { notFound } from "@/lib/errors";

export const legacyTravelFileKeySchema = z
  .string()
  .regex(/^[0-9a-f-]{36}\.(?:gif|jpe?g|png|webp)$/i);

export const legacyTravelFileContentTypes: Record<string, string> = {
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function readLegacyTravelFile(rawKey: string) {
  const key = basename(legacyTravelFileKeySchema.parse(rawKey));
  const directories = ["legacy-travel-files", "builder-files"];
  for (const directory of directories) {
    try {
      return { key, file: await readFile(join(process.cwd(), "storage", directory, key)) };
    } catch (error) {
      if (!(typeof error === "object" && error && "code" in error && error.code === "ENOENT")) {
        throw error;
      }
    }
  }
  throw notFound("Зураг олдсонгүй");
}

/** Хуучин relative/local URL-ыг шинэ тогтвортой public endpoint рүү хөрвүүлнэ. */
export function normalizeLegacyTravelFileUrl(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/(?:^|\/)files\/server\/([^/?#]+)(?:[?#].*)?$/i);
  const parsed = legacyTravelFileKeySchema.safeParse(match?.[1]);
  if (!parsed.success) return value;
  const origin =
    env.NODE_ENV === "development"
      ? `http://localhost:${env.PORT}`
      : env.APP_URL.replace(/\/$/, "");
  return `${origin}/api/v1/legacy-travel-files/${encodeURIComponent(parsed.data)}`;
}
