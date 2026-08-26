import type { NextFunction, Request, RequestHandler, Response } from "express";

// winu-backend-д controller ~400 файл бүрт try/catch → 400 давтагдсан байсан.
// Энд нэг удаа: async алдааг барьж errorHandler руу дамжуулна.
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
