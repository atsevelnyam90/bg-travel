import { travels as travelsContract } from "@winu/contracts";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import { requirePermission } from "@/middlewares/requirePermission";
import { auditFromRequest, changedFields } from "@/modules/audit/writeAudit";
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
    await auditFromRequest(req)({
      action: "create",
      resource: "travel",
      resourceId: travel.id,
      meta: { name: travel.name, slug: travel.slug },
    });
    res.status(201).json(travel);
  }),
);

travelsRouter.patch(
  "/:id",
  requirePermission("org:manage"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const input = travelsContract.updateAdminTravelSchema.parse(req.body);
    const { travel, before } = await updateAdminTravel(id, input);
    await auditFromRequest(req)({
      action: "update",
      resource: "travel",
      resourceId: id,
      meta: {
        changes: changedFields(
          { ...before, departures: undefined, sections: undefined, details: undefined },
          { ...travel, departures: undefined, sections: undefined, details: undefined },
        ),
        childCounts: {
          departures: travel.departures.length,
          sections: travel.sections.length,
          details: travel.details.length,
        },
      },
    });
    res.json(travel);
  }),
);

travelsRouter.delete(
  "/:id",
  requirePermission("org:manage"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await deleteAdminTravel(id);
    await auditFromRequest(req)({ action: "delete", resource: "travel", resourceId: id });
    res.status(204).end();
  }),
);
