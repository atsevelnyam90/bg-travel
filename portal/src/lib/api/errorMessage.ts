import { ApiError } from "./apiClient";

type ValidationIssue = {
  path?: unknown;
  message?: unknown;
};

function isValidationIssue(value: unknown): value is ValidationIssue {
  return typeof value === "object" && value !== null && "message" in value;
}

function formatPath(path: unknown) {
  if (!Array.isArray(path) || path.length === 0) return "";
  return path
    .filter((part) => typeof part === "string" || typeof part === "number")
    .map(String)
    .join(".");
}

function formatValidationDetails(details: unknown) {
  if (!Array.isArray(details)) return null;

  const messages = details
    .filter(isValidationIssue)
    .map((issue) => {
      if (typeof issue.message !== "string" || issue.message.length === 0) return null;
      const path = formatPath(issue.path);
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages.join("\n") : null;
}

export function apiErrorMessage(error: unknown, fallback = "Алдаа гарлаа") {
  if (error instanceof ApiError) {
    const details = formatValidationDetails(error.details);
    if (details) return `${error.message}\n${details}`;

    if (error.code === "DATABASE_UNAVAILABLE") {
      return `${fallback}. ${error.message}`;
    }
    if (error.status >= 500 || error.code === "INTERNAL_ERROR") {
      const requestId = error.requestId ? ` Лавлах код: ${error.requestId}` : "";
      return `${fallback}. Сервер түр ажиллахгүй байна. Түр хүлээгээд дахин оролдоно уу.${requestId}`;
    }
    if (error.status === 401 && error.message === "Нэвтрээгүй байна") {
      return "Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.";
    }
    if (error.status === 403 && error.message === "Хандах эрхгүй") {
      return `${fallback}. Энэ үйлдлийг хийх эрх танд байхгүй байна.`;
    }
    if (error.status === 404 && error.message === "Олдсонгүй") {
      return `${fallback}. Мэдээлэл устсан эсвэл өөрчлөгдсөн байж магадгүй.`;
    }
    return error.message;
  }

  if (
    error instanceof TypeError ||
    (error instanceof Error && error.message === "Failed to fetch")
  ) {
    return `${fallback}. Сервертэй холбогдож чадсангүй. Холболтоо шалгаад дахин оролдоно уу.`;
  }
  if (error instanceof Error && error.message.trim()) return `${fallback}: ${error.message}`;
  return fallback;
}
