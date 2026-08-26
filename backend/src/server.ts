import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { env } from "@/lib/env";
import { errorHandler } from "@/lib/errors";
import { httpLogger } from "@/lib/logger";
import { currentUser } from "@/middlewares/currentUser";
import { routes } from "@/routes";

export const PREFIX_ROUTE = "/api/v1";

export function createServer(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Аюулгүй байдлын үндсэн header-үүд (CSP, HSTS, noSniff г.м).
  // API нь HTML буцаадаггүй тул CSP-г унтраасан — portal өөрөө тавина.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

  // Хүсэлт бүрд requestId + бүтэцтэй лог. Route-уудаас ӨМНӨ.
  app.use(httpLogger);

  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));

  // ⚠️ ДАРААЛАЛ ЧУХАЛ.
  // HMAC checksum шалгадаг webhook (Bonum г.м) нь ЯГ ИРСЭН raw body-г шаарддаг.
  // Ийм route-ыг express.json()-ООС ӨМНӨ, express.raw()-тэй бүртгэнэ:
  //
  //   app.post(`${PREFIX_ROUTE}/webhooks/bonum`, express.raw({ type: "*/*" }), handler);
  //
  // Доош зөөвөл checksum шалгалт бүхэлдээ эвдэрнэ.

  // 5mb — bulk import (100+ мөр) default 100kb-д багтахгүй.
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));
  app.use(cookieParser());

  // Auth-ыг route-уудаас ӨМНӨ уншина. Нэвтрээгүй бол алдаа шидэхгүй —
  // шаардлагыг requireAuth / requirePermission тавина.
  app.use(currentUser);

  app.use(PREFIX_ROUTE, routes);

  // Хамгийн сүүлд.
  app.use(errorHandler);

  return app;
}
