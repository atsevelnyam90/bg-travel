import { travels as travelsContract } from "@winu/contracts";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import { requirePermission } from "@/middlewares/requirePermission";
import {
  createAdminTravel,
  deleteAdminTravel,
  getAdminTravel,
  listAdminTravels,
  updateAdminTravel,
} from "./adminTravelService";

export const travelsRouter: Router = Router();
const idParamSchema = z.object({ id: z.uuid() });

travelsRouter.get(
  "/",
  requirePermission("org:manage"),
  asyncHandler(async (req, res) => {
    res.json(await listAdminTravels(travelsContract.listAdminTravelsQuerySchema.parse(req.query)));
  }),
);

travelsRouter.get(
  "/:id",
  requirePermission("org:manage"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    res.json(await getAdminTravel(id));
  }),
);

travelsRouter.post(
  "/",
  requirePermission("org:manage"),
  asyncHandler(async (req, res) => {
    const input = travelsContract.createAdminTravelSchema.parse(req.body);
    const travel = await createAdminTravel(input);
    res.status(201).json(travel);
  }),
);

travelsRouter.patch(
  "/:id",
  requirePermission("org:manage"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const input = travelsContract.updateAdminTravelSchema.parse(req.body);
    res.json(await updateAdminTravel(id, input));
  }),
);

travelsRouter.delete(
  "/:id",
  requirePermission("org:manage"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await deleteAdminTravel(id);
    res.status(204).end();
  }),
);
