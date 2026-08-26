import { Router } from "express";
import { auditRouter } from "@/modules/audit/audit.routes";
import { authRouter } from "@/modules/auth/auth.routes";
import { builderRouter } from "@/modules/builder";
import { filesRouter } from "@/modules/files/files.routes";
import { organizationRouter } from "@/modules/organization/organization.routes";
import { productsRouter } from "@/modules/products/products.routes";
import { usersRouter } from "@/modules/users/users.routes";
import { healthRouter } from "./health.routes";
import { publicRouter } from "./public.routes";

export const routes: Router = Router();

routes.use("/health", healthRouter);

// Нэвтрэлтгүй. Дотоод route-уудаас ТУСАД нь бүлэглэсэн нь санамсаргүйгээр
// хамгаалалтгүй endpoint нэмэхээс сэргийлнэ (public.routes.ts-ийн тайлбарыг үз).
routes.use("/public", publicRouter);

routes.use("/auth", authRouter);
routes.use("/users", usersRouter);
routes.use("/products", productsRouter);
routes.use("/builder", builderRouter);
routes.use("/org", organizationRouter);
routes.use("/audit", auditRouter);
routes.use("/files", filesRouter);
