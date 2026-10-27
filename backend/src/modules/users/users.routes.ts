import { users as usersContract } from "@winu/contracts";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/middlewares/requirePermission";
import { auditFromRequest, changedFields } from "@/modules/audit/writeAudit";
import { inviteUser } from "./usecases/inviteUser";
import { listRoles } from "./usecases/listRoles";
import { listUsers } from "./usecases/listUsers";
import { disableUser, updateUser } from "./usecases/updateUser";

// Route нь ЗӨВХӨН: зам + middleware + validation. Бизнес логик модульд.
export const usersRouter: Router = Router();
const idParamSchema = z.object({ id: z.uuid() });

usersRouter.get(
  "/",
  requirePermission("user:read"),
  asyncHandler(async (req, res) => {
    const query = usersContract.listUsersQuerySchema.parse(req.query);
    res.json(await listUsers(query));
  }),
);

usersRouter.get(
  "/roles",
  requirePermission("role:read"),
  asyncHandler(async (_req, res) => {
    res.json(await listRoles());
  }),
);

usersRouter.post(
  "/invite",
  requirePermission("user:invite"),
  asyncHandler(async (req, res) => {
    const input = usersContract.inviteUserSchema.parse(req.body);
    const inviter = await prisma.user.findUnique({
      where: { id: req.auth?.userId },
      select: { name: true },
    });

    const { user, mailFailed } = await inviteUser(input, inviter?.name ?? "Админ");

    await auditFromRequest(req)({
      action: "invite",
      resource: "user",
      resourceId: user.id,
      meta: { email: user.email, roleId: input.roleId, mailFailed },
    });

    const body: usersContract.InviteUserResponse = { user, mailFailed };
    res.status(201).json(body);
  }),
);

usersRouter.patch(
  "/:id",
  requirePermission("user:update"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const input = usersContract.updateUserSchema.parse(req.body);
    const { user, before } = await updateUser(id, input);
    await auditFromRequest(req)({
      action: "update",
      resource: "user",
      resourceId: id,
      meta: { changes: changedFields({ ...before }, { ...user }) },
    });
    res.json(user);
  }),
);

usersRouter.delete(
  "/:id",
  requirePermission("user:disable"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await disableUser(id);
    await auditFromRequest(req)({ action: "delete", resource: "user", resourceId: id });
    res.status(204).end();
  }),
);
