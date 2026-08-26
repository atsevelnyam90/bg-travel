import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "./env";

/**
 * Бүтэцтэй логгинг.
 *
 * `console.log` биш байх шалтгаан: клиент "алдаа гарлаа" гэж мэдэгдэхэд
 * тухайн хүсэлтийг олох ёстой. Хүсэлт бүрд `requestId` өгч, түүнийг
 * алдааны хариунд ч буцаана — хэрэглэгчийн хэлсэн кодоор лог хайна.
 */
export const logger = pino({
  // Тестийн гаралтыг бөглөрүүлэхгүй — алдаа гарвал тестийн мессеж нь хангалттай.
  level: env.NODE_ENV === "test" ? "silent" : env.NODE_ENV === "production" ? "info" : "debug",
  // Хөгжүүлэлтэд уншихад ээлтэй, production-д JSON (лог цуглуулагчид).
  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        },
      }
    : {}),
  redact: {
    // Нууц утга лог руу ХЭЗЭЭ Ч орж болохгүй.
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.passwordHash",
      "*.refreshToken",
      "*.accessToken",
      "*.tokenHash",
    ],
    censor: "[REDACTED]",
  },
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage, res: ServerResponse) => {
    // Урд талын proxy/LB өгсөн id байвал түүнийг хадгална — систем хооронд мөрдөх.
    const existing = req.headers["x-request-id"];
    const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  // Эрүүл мэндийн шалгалт секунд тутам ирдэг — логийг бөглөрүүлэхгүй.
  autoLogging: {
    ignore: (req) => env.NODE_ENV === "test" || (req.url?.startsWith("/api/v1/health") ?? false),
  },
});
