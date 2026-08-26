import type { files } from "@/api/generated/contracts";
import { ApiError, api } from "./apiClient";

/**
 * Файлыг S3 руу ШУУД тавина — backend-ээр дамжуулахгүй.
 *
 *   1. Backend-ээс түр зөвшөөрөл (presigned URL) авна
 *   2. Клиент тэр хаяг руу PUT хийнэ
 *   3. Нийтийн хаягийг буцаана
 *
 * Backend файлыг хүлээж авдаггүй тул том файл серверийн санах ой, хугацааг
 * идэхгүй. Төрөл, хэмжээ хоёр presign-ийн гарын үсэгт орсон тул клиент
 * өөрчилвөл S3 өөрөө татгалзана.
 */
export async function uploadFile(
  file: File,
  scope: files.PresignUploadInput["scope"],
): Promise<string> {
  const presign = await api.post<files.PresignUploadResponse>("/files/presign", {
    contentType: file.type,
    contentLength: file.size,
    scope,
  });

  const response = await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
    // Presigned URL нь өөрөө зөвшөөрөлтэй — cookie явуулбал S3 гарын үсгийг
    // няцаана.
    credentials: "omit",
  });

  if (!response.ok) {
    throw new ApiError(response.status, { message: "Файл байршуулж чадсангүй" });
  }

  return presign.publicUrl;
}
