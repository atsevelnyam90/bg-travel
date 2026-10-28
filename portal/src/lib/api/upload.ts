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
  signal?: AbortSignal,
): Promise<string> {
  const presign = await api.post<files.PresignUploadResponse>(
    "/files/presign",
    {
      contentType: file.type,
      contentLength: file.size,
      scope,
    },
    { signal },
  );

  const response = await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
    // Presigned URL нь өөрөө зөвшөөрөлтэй — cookie явуулбал S3 гарын үсгийг
    // няцаана.
    credentials: "omit",
    signal,
  });

  if (!response.ok) {
    throw new ApiError(response.status, { message: "Файл байршуулж чадсангүй" });
  }

  return presign.publicUrl;
}

export async function uploadFiles(
  filesToUpload: File[],
  scope: files.PresignUploadInput["scope"],
  signal?: AbortSignal,
  concurrency = 3,
): Promise<string[]> {
  const results = new Array<string>(filesToUpload.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < filesToUpload.length) {
      const index = nextIndex;
      nextIndex += 1;
      const file = filesToUpload[index];
      if (!file) continue;
      results[index] = await uploadFile(file, scope, signal);
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), filesToUpload.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export function isUploadAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
