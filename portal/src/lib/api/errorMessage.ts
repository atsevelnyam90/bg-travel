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
    return details ? `${error.message}\n${details}` : error.message;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
