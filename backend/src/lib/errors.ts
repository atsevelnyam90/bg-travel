import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "./logger";

// Алдааны ГАНЦ формат: { message, code?, details? }
// Frontend-ийн ApiError яг үүнийг хүлээж авна.
export class HttpError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, message: string, options?: { code?: string; details?: unknown }) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, { code: "BAD_REQUEST", details });
export const unauthorized = (message = "Нэвтрээгүй байна") =>
  new HttpError(401, message, { code: "UNAUTHORIZED" });
export const forbidden = (message = "Хандах эрхгүй") =>
  new HttpError(403, message, { code: "FORBIDDEN" });
export const notFound = (message = "Олдсонгүй") =>
  new HttpError(404, message, { code: "NOT_FOUND" });
/** Optimistic locking зөрчил — өөр хэрэглэгч зэрэг өөрчилсөн. */
export const conflict = (message: string) => new HttpError(409, message, { code: "CONFLICT" });

/** Хамгийн сүүлд бүртгэгдэх middleware. */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Өгөгдөл буруу байна",
      code: "VALIDATION_ERROR",
      details: error.issues,
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  // Танихгүй алдааны дэлгэрэнгүйг клиент рүү БҮҮ буцаа — лог руу л бич.
  // requestId-г хариунд өгснөөр хэрэглэгчийн хэлсэн кодоор логийг олно.
  const requestId = res.getHeader("x-request-id");
  logger.error({ err: error, requestId }, "Unhandled error");

  res.status(500).json({
    message: "Дотоод алдаа гарлаа",
    code: "INTERNAL_ERROR",
    ...(requestId ? { requestId } : {}),
  });
}
