import { createBuilderDatasourceUseCases } from "@duke333/builder-backend/datasources";
import { createBuilderMigrationService } from "@duke333/builder-backend/migrations";
import {
  type BuilderAuditFromRequest,
  createBuilderRouter as createBuilderPackageRouter,
} from "@duke333/builder-backend/router";
import type { BuilderRuntimeAdapters } from "@duke333/builder-backend/runtime";
import {
  createBuilderDefinitionUseCases,
  createBuilderRuntimeUseCases,
  createBuilderViewUseCases,
} from "@duke333/builder-backend/usecases";
import type { Permission } from "@winu/contracts";
import {
  Router as createExpressRouter,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
  type Router,
} from "express";
import { runWithRequestContext } from "@/lib/requestContext";
import { requireAuth, requirePermission } from "@/middlewares/requirePermission";
import { auditFromRequest } from "@/modules/audit/writeAudit";
import { starterBuilderRuntimeAdapters } from "./datasources/runtimeEntryDatasources";
import { builderSchemaMigrationRepository } from "./migrations/builderSchemaMigrationRepository";
import { builderDatasourceRepository } from "./repositories/builderDatasourceRepository";
import { builderMetadataRepository } from "./repositories/builderMetadataRepository";
import { builderErrors } from "./shared/builderErrors";
import { runBuilderFieldTrigger } from "./triggers/runBuilderFieldTrigger";
import { runBuilderTriggers } from "./triggers/runBuilderTriggers";

export const BUILDER_ADMIN_PERMISSION = "org:manage" satisfies Permission;
export const BUILDER_DEFAULT_VIEW_PERMISSION = BUILDER_ADMIN_PERMISSION;

export type BuilderRouterDependencies = {
  requireAuth: RequestHandler;
  requirePermission: (permission: Permission) => RequestHandler;
  auditFromRequest: BuilderAuditFromRequest;
  schemaGuard?: RequestHandler;
  runtimeAdapters?: BuilderRuntimeAdapters;
};

const builderDatasourceUseCases = createBuilderDatasourceUseCases({
  datasourceRepository: builderDatasourceRepository,
  errors: builderErrors,
});

const builderDefinitionUseCases = createBuilderDefinitionUseCases({
  metadataRepository: builderMetadataRepository,
  errors: builderErrors,
});

const builderViewUseCases = createBuilderViewUseCases({
  metadataRepository: builderMetadataRepository,
  errors: builderErrors,
  defaultViewPermission: BUILDER_DEFAULT_VIEW_PERMISSION,
});

const builderRuntimeUseCases = createBuilderRuntimeUseCases({
  metadataRepository: builderMetadataRepository,
  errors: builderErrors,
  runtimeAdapters: starterBuilderRuntimeAdapters,
  runFieldTrigger: runBuilderFieldTrigger,
  runTriggers: runBuilderTriggers,
  listFieldOptions: builderDatasourceUseCases.listBuilderFieldOptions,
  getRuntimeBuilderView: builderViewUseCases.getRuntimeBuilderView,
});

const builderMigrationService = createBuilderMigrationService({
  repository: builderSchemaMigrationRepository,
  errors: builderErrors,
});

export const { listBuilderDbTables, listBuilderFieldOptions } = builderDatasourceUseCases;

export const {
  createBuilderForm,
  createBuilderList,
  deleteBuilderForm,
  deleteBuilderList,
  getBuilderForm,
  getBuilderList,
  listAllBuilderForms,
  listAllBuilderLists,
  listBuilderForms,
  listBuilderLists,
  replicateBuilderForm,
  replicateBuilderList,
  updateBuilderForm,
  updateBuilderList,
} = builderDefinitionUseCases;

export const {
  createBuilderView,
  deleteBuilderView,
  getBuilderView,
  getRuntimeBuilderView,
  listBuilderViews,
  replicateBuilderView,
  updateBuilderView,
} = builderViewUseCases;

export const {
  createBuilderViewEntry,
  createCompositeBuilderViewEntry,
  createRuntimeBuilderFormEntry,
  deleteBuilderViewEntry,
  getRuntimeBuilderForm,
  getRuntimeBuilderList,
  listBuilderViewEntries,
  listRuntimeBuilderFormFieldOptions,
  listRuntimeBuilderListEntries,
  runRuntimeBuilderFormFieldTrigger,
  runRuntimeBuilderViewFieldTrigger,
  updateCompositeBuilderViewEntry,
  updateBuilderViewEntry,
} = builderRuntimeUseCases;

export const { assertBuilderSchemaVersion, getBuilderSchemaVersion, runBuilderMigrations } =
  builderMigrationService;

let schemaCheckPromise: Promise<void> | null = null;

export async function requireBuilderSchemaVersion(
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    schemaCheckPromise ??= assertBuilderSchemaVersion().catch((error: unknown) => {
      schemaCheckPromise = null;
      throw error;
    });
    await schemaCheckPromise;
    next();
  } catch (error) {
    next(error);
  }
}

export function createBuilderRouter(deps: BuilderRouterDependencies): Router {
  const router = createExpressRouter();
  router.use(runWithRequestContext);
  router.use(
    createBuilderPackageRouter({
      requireAuth: deps.requireAuth,
      adminGuard: deps.requirePermission(BUILDER_ADMIN_PERMISSION),
      schemaGuard: deps.schemaGuard,
      auditFromRequest: deps.auditFromRequest,
      getPermissions: (req) => req.auth?.permissions ?? [],
      errors: builderErrors,
      adminUseCases: {
        ...builderDatasourceUseCases,
        ...builderDefinitionUseCases,
        ...builderViewUseCases,
      },
      runtimeUseCases: builderRuntimeUseCases,
      runtimeAdapters: deps.runtimeAdapters,
    }),
  );
  return router;
}

export const builderRouter = createBuilderRouter({
  requireAuth,
  requirePermission,
  auditFromRequest,
  schemaGuard: requireBuilderSchemaVersion,
});
