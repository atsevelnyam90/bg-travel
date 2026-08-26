import {
  type BuilderAuditFromRequest,
  createBuilderRouter as createBuilderPackageRouter,
} from "@winu/builder-backend/router";
import type { BuilderRuntimeAdapters } from "@winu/builder-backend/runtime";
import type { Permission } from "@winu/contracts";
import type { RequestHandler, Router } from "express";
import { requireAuth, requirePermission } from "@/middlewares/requirePermission";
import { auditFromRequest } from "@/modules/audit/writeAudit";
import * as builderService from "./builderService";
import { requireBuilderSchemaVersion } from "./migrations/builderSchemaVersionMiddleware";
import { builderErrors } from "./shared/builderErrors";

export type BuilderRouterDependencies = {
  requireAuth: RequestHandler;
  requirePermission: (permission: Permission) => RequestHandler;
  auditFromRequest: BuilderAuditFromRequest;
  schemaGuard?: RequestHandler;
  runtimeAdapters?: BuilderRuntimeAdapters;
};

export function createBuilderRouter(deps: BuilderRouterDependencies): Router {
  return createBuilderPackageRouter({
    requireAuth: deps.requireAuth,
    adminGuard: deps.requirePermission("org:manage"),
    schemaGuard: deps.schemaGuard,
    auditFromRequest: deps.auditFromRequest,
    getPermissions: (req) => req.auth?.permissions ?? [],
    errors: builderErrors,
    adminUseCases: builderService,
    runtimeUseCases: builderService,
    runtimeAdapters: deps.runtimeAdapters,
  });
}

export const builderRouter = createBuilderRouter({
  requireAuth,
  requirePermission,
  auditFromRequest,
  schemaGuard: requireBuilderSchemaVersion,
});
