import { organization as orgContract } from "@winu/contracts";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth, requirePermission } from "@/middlewares/requirePermission";
import {
  buildProductPaymentQr,
  getOrganization,
  listBanks,
  updateOrganization,
} from "./organizationService";

export const organizationRouter: Router = Router();

const idParamSchema = z.object({ id: z.uuid("id буруу байна") });

organizationRouter.get(
  "/",
  requirePermission("org:read"),
  asyncHandler(async (_req, res) => {
    res.json(await getOrganization());
  }),
);

organizationRouter.patch(
  "/",
  requirePermission("org:manage"),
  asyncHandler(async (req, res) => {
    const input = orgContract.updateOrganizationSchema.parse(req.body);
    res.json(await updateOrganization(input));
  }),
);

// Статик жагсаалт — нэвтэрсэн хэн ч авч болно (эрх шаардахгүй).
organizationRouter.get(
  "/banks",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json(listBanks());
  }),
);

organizationRouter.post(
  "/payment-qr/:id",
  requirePermission("product:read"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    res.json(await buildProductPaymentQr(id));
  }),
);
