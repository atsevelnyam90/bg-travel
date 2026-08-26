import { users as usersContract } from "@winu/contracts";
import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/middlewares/requirePermission";
import { auditFromRequest } from "@/modules/audit/writeAudit";
import { inviteUser } from "./usecases/inviteUser";
import { listRoles } from "./usecases/listRoles";
import { listUsers } from "./usecases/listUsers";

// Route нь ЗӨВХӨН: зам + middleware + validation. Бизнес логик модульд.
export const usersRouter: Router = Router();

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
