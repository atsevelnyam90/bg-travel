import { audit as auditContract } from "@winu/contracts";
import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requirePermission } from "@/middlewares/requirePermission";
import { listAudit } from "./listAudit";

export const auditRouter: Router = Router();

auditRouter.get(
  "/",
  requirePermission("audit:read"),
  asyncHandler(async (req, res) => {
    const query = auditContract.listAuditQuerySchema.parse(req.query);
    res.json(await listAudit(query));
  }),
);
