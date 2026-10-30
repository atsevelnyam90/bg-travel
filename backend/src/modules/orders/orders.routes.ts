import { orders as ordersContract } from "@winu/contracts";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import { requirePermission } from "@/middlewares/requirePermission";
import {
  confirmAdminOrder,
  createAdminOrder,
  deleteAdminOrder,
  getOrderDashboard,
  getOrderDashboardDetails,
  listAdminOrderDepartureOptions,
  listAdminOrders,
  updateAdminOrder,
} from "./adminOrderService";

export const ordersRouter: Router = Router();
const idParamSchema = z.object({ id: z.uuid() });

ordersRouter.get(
  "/",
  requirePermission("order:read"),
  asyncHandler(async (req, res) => {
    res.json(await listAdminOrders(ordersContract.listAdminOrdersQuerySchema.parse(req.query)));
  }),
);

ordersRouter.get(
  "/departure-options",
  requirePermission("order:write"),
  asyncHandler(async (_req, res) => {
    res.json(await listAdminOrderDepartureOptions());
  }),
);

ordersRouter.get(
  "/dashboard",
  requirePermission("order:read"),
  asyncHandler(async (req, res) => {
    const { days } = ordersContract.orderDashboardQuerySchema.parse(req.query);
    res.json(await getOrderDashboard(days));
  }),
);

ordersRouter.get(
  "/dashboard/details",
  requirePermission("order:read"),
  asyncHandler(async (req, res) => {
    const query = ordersContract.orderDashboardDetailsQuerySchema.parse(req.query);
    res.json(await getOrderDashboardDetails(query));
  }),
);

ordersRouter.post(
  "/",
  requirePermission("order:write"),
  asyncHandler(async (req, res) => {
    const input = ordersContract.createAdminOrderSchema.parse(req.body);
    const order = await createAdminOrder(input, req.auth?.userId ?? "");
    res.status(201).json(order);
  }),
);

ordersRouter.patch(
  "/:id",
  requirePermission("order:write"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const input = ordersContract.updateAdminOrderSchema.parse(req.body);
    res.json(await updateAdminOrder(id, input, req.auth?.userId ?? ""));
  }),
);

ordersRouter.post(
  "/:id/confirm",
  requirePermission("order:write"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const input = ordersContract.confirmAdminOrderSchema.parse(req.body);
    res.json(await confirmAdminOrder(id, input.version, req.auth?.userId ?? ""));
  }),
);

ordersRouter.delete(
  "/:id",
  requirePermission("order:delete"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await deleteAdminOrder(id);
    res.status(204).end();
  }),
);
