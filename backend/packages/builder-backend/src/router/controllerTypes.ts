import type { Permission } from "@winu/contracts";
import type { Request } from "express";
import type { BuilderDatasourceUseCases } from "../datasources";
import type { BuilderErrors } from "../errors";
import type { BuilderRuntimeAdapters } from "../runtime";
import type {
  BuilderDefinitionUseCases,
  BuilderRuntimeUseCases,
  BuilderViewUseCases,
} from "../usecases";

export type BuilderAuditInput = {
  action: "create" | "update" | "delete";
  resource: string;
  resourceId?: string | null;
  meta?: Record<string, unknown>;
};

export type BuilderAuditFromRequest = (
  req: Request,
) => (input: BuilderAuditInput) => Promise<void> | void;

export type BuilderPermissionReader = (req: Request) => readonly Permission[];

export type BuilderAdminControllerUseCases = BuilderDatasourceUseCases &
  BuilderDefinitionUseCases &
  BuilderViewUseCases;

export type BuilderRuntimeControllerUseCases = BuilderRuntimeUseCases;

export type BuilderControllerDependencies = {
  auditFromRequest: BuilderAuditFromRequest;
  getPermissions: BuilderPermissionReader;
  errors: Pick<BuilderErrors, "badRequest">;
  adminUseCases: BuilderAdminControllerUseCases;
  runtimeUseCases: BuilderRuntimeControllerUseCases;
  runtimeAdapters?: BuilderRuntimeAdapters;
};
