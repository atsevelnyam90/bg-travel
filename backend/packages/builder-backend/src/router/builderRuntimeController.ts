import { builder as builderContract } from "@winu/contracts";
import type { Request, Response } from "express";
import type { BuilderErrors } from "../errors";
import type { BuilderRuntimeAdapters } from "../runtime";
import type {
  BuilderAuditFromRequest,
  BuilderPermissionReader,
  BuilderRuntimeControllerUseCases,
} from "./controllerTypes";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function uuidParam(errors: Pick<BuilderErrors, "badRequest">, req: Request, key: string) {
  const value = req.params[key];
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    throw errors.badRequest(`${key} буруу байна`);
  }
  return value;
}

function fieldKeyParam(errors: Pick<BuilderErrors, "badRequest">, req: Request) {
  const fieldKey = req.params.fieldKey;
  if (typeof fieldKey !== "string" || fieldKey.length > 63) {
    throw errors.badRequest("fieldKey буруу байна");
  }
  return fieldKey;
}

function fieldTriggerEventParam(errors: Pick<BuilderErrors, "badRequest">, req: Request) {
  const parsed = builderContract.builderFieldTriggerEventSchema.safeParse(req.params.event);
  if (!parsed.success) throw errors.badRequest("trigger event буруу байна");
  return parsed.data;
}

export function createBuilderRuntimeController(deps: {
  auditFromRequest: BuilderAuditFromRequest;
  getPermissions: BuilderPermissionReader;
  errors: Pick<BuilderErrors, "badRequest">;
  useCases: BuilderRuntimeControllerUseCases;
  runtimeAdapters?: BuilderRuntimeAdapters;
}) {
  return {
    async getForm(req: Request, res: Response) {
      const id = uuidParam(deps.errors, req, "id");
      res.json(await deps.useCases.getRuntimeBuilderForm(id));
    },

    async getList(req: Request, res: Response) {
      const id = uuidParam(deps.errors, req, "id");
      res.json(await deps.useCases.getRuntimeBuilderList(id));
    },

    async listListEntries(req: Request, res: Response) {
      const id = uuidParam(deps.errors, req, "id");
      const query = builderContract.listBuilderViewEntriesQuerySchema.parse(req.query);
      res.json(await deps.useCases.listRuntimeBuilderListEntries(id, query, deps.runtimeAdapters));
    },

    async listFieldOptions(req: Request, res: Response) {
      const id = uuidParam(deps.errors, req, "id");
      const fieldKey = fieldKeyParam(deps.errors, req);
      const query = builderContract.listBuilderFieldOptionsQuerySchema.parse({
        ...req.query,
        depends: collectDepends(req.query),
      });
      res.json(await deps.useCases.listRuntimeBuilderFormFieldOptions(id, fieldKey, query));
    },

    async runFormFieldTrigger(req: Request, res: Response) {
      const id = uuidParam(deps.errors, req, "id");
      const fieldKey = fieldKeyParam(deps.errors, req);
      const event = fieldTriggerEventParam(deps.errors, req);
      const input = builderContract.runBuilderFieldTriggerSchema.parse(req.body);
      res.json(await deps.useCases.runRuntimeBuilderFormFieldTrigger(id, fieldKey, event, input));
    },

    async createFormEntry(req: Request, res: Response) {
      const id = uuidParam(deps.errors, req, "id");
      const input = builderContract.createBuilderViewEntrySchema.parse(req.body);
      const { entry, audit } = await deps.useCases.createRuntimeBuilderFormEntry(
        id,
        input,
        deps.runtimeAdapters,
      );
      await deps.auditFromRequest(req)({
        action: "create",
        ...audit,
      });
      res.status(201).json(entry);
    },

    async getView(req: Request, res: Response) {
      const id = uuidParam(deps.errors, req, "id");
      res.json(await deps.useCases.getRuntimeBuilderView(id, deps.getPermissions(req)));
    },

    async runViewFieldTrigger(req: Request, res: Response) {
      const viewId = uuidParam(deps.errors, req, "viewId");
      const fieldKey = fieldKeyParam(deps.errors, req);
      const event = fieldTriggerEventParam(deps.errors, req);
      const input = builderContract.runBuilderFieldTriggerSchema.parse(req.body);
      res.json(
        await deps.useCases.runRuntimeBuilderViewFieldTrigger(
          viewId,
          fieldKey,
          event,
          input,
          deps.getPermissions(req),
        ),
      );
    },

    async listEntries(req: Request, res: Response) {
      const viewId = uuidParam(deps.errors, req, "viewId");
      const query = builderContract.listBuilderViewEntriesQuerySchema.parse(req.query);
      res.json(
        await deps.useCases.listBuilderViewEntries(
          viewId,
          query,
          deps.getPermissions(req),
          deps.runtimeAdapters,
        ),
      );
    },

    async createEntry(req: Request, res: Response) {
      const viewId = uuidParam(deps.errors, req, "viewId");
      const input = builderContract.createBuilderViewEntrySchema.parse(req.body);
      const { entry, audit } = await deps.useCases.createBuilderViewEntry(
        viewId,
        input,
        deps.getPermissions(req),
        deps.runtimeAdapters,
      );
      await deps.auditFromRequest(req)({
        action: "create",
        ...audit,
      });
      res.status(201).json(entry);
    },

    async updateEntry(req: Request, res: Response) {
      const viewId = uuidParam(deps.errors, req, "viewId");
      const id = uuidParam(deps.errors, req, "id");
      const input = builderContract.updateBuilderViewEntrySchema.parse(req.body);
      const { entry, audit } = await deps.useCases.updateBuilderViewEntry(
        viewId,
        id,
        input,
        deps.getPermissions(req),
        deps.runtimeAdapters,
      );
      await deps.auditFromRequest(req)({
        action: "update",
        ...audit,
      });
      res.json(entry);
    },

    async deleteEntry(req: Request, res: Response) {
      const viewId = uuidParam(deps.errors, req, "viewId");
      const id = uuidParam(deps.errors, req, "id");
      const audit = await deps.useCases.deleteBuilderViewEntry(
        viewId,
        id,
        deps.getPermissions(req),
        deps.runtimeAdapters,
      );
      await deps.auditFromRequest(req)({
        action: "delete",
        ...audit,
      });
      res.status(204).end();
    },
  };
}

function collectDepends(query: Request["query"]) {
  const depends: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith("depends.") || typeof value !== "string") continue;
    depends[key.slice("depends.".length)] = value;
  }
  return depends;
}
