import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export const healthRouter: Router = Router();

/**
 * Load balancer / orchestrator энэ хаягийг шалгана.
 *
 * DB-г ЗААВАЛ шалгана: зөвхөн `{ ok: true }` буцаадаг health нь DB унасан ч
 * ногоон харагдаж, LB эвдэрсэн instance рүү трафик илгээсээр байдаг.
 */
healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const startedAt = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      logger.error({ err: error }, "Health: DB холбогдохгүй байна");
      res.status(503).json({ ok: false, db: "down" });
      return;
    }

    res.json({ ok: true, db: "up", dbLatencyMs: Date.now() - startedAt });
  }),
);

/** Kubernetes-ийн liveness — процесс амьд эсэхийг л шалгана, хамаарал шалгахгүй. */
healthRouter.get("/live", (_req, res) => {
  res.json({ ok: true });
});
