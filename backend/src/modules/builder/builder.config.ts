import { createBuilderBackendIntegration } from "@duke333/builder-backend/integration";
import { createBuilderPrismaRepositories } from "@duke333/builder-backend/prisma";
import {
  type BuilderTriggerHandler,
  createBuilderTriggerRunner,
} from "@duke333/builder-backend/triggers";
import type { Permission } from "@winu/contracts";
import { Router } from "express";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma, prismaUnfiltered } from "@/lib/prisma";
import { runWithRequestContext } from "@/lib/requestContext";
import { requireAuth, requirePermission } from "@/middlewares/requirePermission";
import { runAppFieldTrigger } from "@/modules/appTriggers/fieldRegistry";
import { getAppTriggerRoute, runAppTrigger } from "@/modules/appTriggers/registry";
import { auditFromRequest } from "@/modules/audit/writeAudit";
import { productBuilderRuntimeAdapter } from "@/modules/products/productBuilderRuntime";
import { userBuilderRuntimeAdapter } from "@/modules/users/userBuilderRuntime";

export const BUILDER_ADMIN_PERMISSION = "org:manage" satisfies Permission;
export const BUILDER_DEFAULT_VIEW_PERMISSION = BUILDER_ADMIN_PERMISSION;

const errors = { badRequest, unauthorized, forbidden, notFound, conflict };
const repositories = createBuilderPrismaRepositories({ prisma, prismaUnfiltered });

const callAppTriggerHandler: BuilderTriggerHandler = async (trigger, context) => {
  return runAppTrigger(getAppTriggerRoute(trigger.config), context);
};

const triggerRunner = createBuilderTriggerRunner(
  {
    logger,
    errors: { badRequest },
  },
  {
    handlers: { callApi: callAppTriggerHandler },
  },
);

export const builder = createBuilderBackendIntegration({
  requireAuth,
  requirePermission: (permission) => requirePermission(permission as Permission),
  auditFromRequest,
  getPermissions: (req) => req.auth?.permissions ?? [],
  errors,
  repositories,
  runtimeTables: {
    products: productBuilderRuntimeAdapter,
    users: userBuilderRuntimeAdapter,
  },
  triggerRunner,
  fieldTriggerRunner: async (context) => runAppFieldTrigger(context),
  adminPermission: BUILDER_ADMIN_PERMISSION,
  defaultViewPermission: BUILDER_DEFAULT_VIEW_PERMISSION,
  missingRuntimePermission: "deny",
});

const packageBuilderRouter = builder.builderRouter;

export const builderRouter = Router();
builderRouter.use(runWithRequestContext);
builderRouter.use(packageBuilderRouter);

export const {
  assertBuilderSchemaVersion,
  getBuilderSchemaVersion,
  requireBuilderSchemaVersion,
  runBuilderMigrations,
} = builder;
