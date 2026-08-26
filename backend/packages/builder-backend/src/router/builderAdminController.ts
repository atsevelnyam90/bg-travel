import { builder as builderContract } from "@winu/contracts";
import type { Request, Response } from "express";
import type { BuilderErrors } from "../errors";
import type { BuilderAdminControllerUseCases, BuilderAuditFromRequest } from "./controllerTypes";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function idParam(errors: Pick<BuilderErrors, "badRequest">, req: Request) {
  const id = req.params.id;
  if (typeof id !== "string" || !uuidPattern.test(id)) {
    throw errors.badRequest("id буруу байна");
  }
  return id;
}

export function createBuilderAdminController(
  auditFromRequest: BuilderAuditFromRequest,
  useCases: BuilderAdminControllerUseCases,
  errors: Pick<BuilderErrors, "badRequest">,
) {
  return {
    async listDbTables(_req: Request, res: Response) {
      res.json(await useCases.listBuilderDbTables());
    },

    async listForms(req: Request, res: Response) {
      res.json(
        await useCases.listBuilderForms(
          builderContract.listBuilderFormsQuerySchema.parse(req.query),
        ),
      );
    },

    async listFormOptions(_req: Request, res: Response) {
      res.json(await useCases.listAllBuilderForms());
    },

    async getForm(req: Request, res: Response) {
      res.json(await useCases.getBuilderForm(idParam(errors, req)));
    },

    async createForm(req: Request, res: Response) {
      const form = await useCases.createBuilderForm(
        builderContract.createBuilderFormSchema.parse(req.body),
      );
      await auditFromRequest(req)({
        action: "create",
        resource: "builder-form",
        resourceId: form.id,
        meta: { id: form.id },
      });
      res.status(201).json(form);
    },

    async updateForm(req: Request, res: Response) {
      const id = idParam(errors, req);
      const form = await useCases.updateBuilderForm(
        id,
        builderContract.updateBuilderFormSchema.parse(req.body),
      );
      await auditFromRequest(req)({
        action: "update",
        resource: "builder-form",
        resourceId: form.id,
        meta: { id: form.id },
      });
      res.json(form);
    },

    async replicateForm(req: Request, res: Response) {
      const id = idParam(errors, req);
      const form = await useCases.replicateBuilderForm(
        id,
        builderContract.replicateBuilderEntitySchema.parse(req.body),
      );
      res.status(201).json(form);
    },

    async deleteForm(req: Request, res: Response) {
      const id = idParam(errors, req);
      await useCases.deleteBuilderForm(id);
      await auditFromRequest(req)({ action: "delete", resource: "builder-form", meta: { id } });
      res.status(204).end();
    },

    async listLists(req: Request, res: Response) {
      res.json(
        await useCases.listBuilderLists(
          builderContract.listBuilderListsQuerySchema.parse(req.query),
        ),
      );
    },

    async listListOptions(_req: Request, res: Response) {
      res.json(await useCases.listAllBuilderLists());
    },

    async getList(req: Request, res: Response) {
      res.json(await useCases.getBuilderList(idParam(errors, req)));
    },

    async createList(req: Request, res: Response) {
      const list = await useCases.createBuilderList(
        builderContract.createBuilderListSchema.parse(req.body),
      );
      await auditFromRequest(req)({
        action: "create",
        resource: "builder-list",
        resourceId: list.id,
        meta: { id: list.id },
      });
      res.status(201).json(list);
    },

    async updateList(req: Request, res: Response) {
      const id = idParam(errors, req);
      const list = await useCases.updateBuilderList(
        id,
        builderContract.updateBuilderListSchema.parse(req.body),
      );
      await auditFromRequest(req)({
        action: "update",
        resource: "builder-list",
        resourceId: list.id,
        meta: { id: list.id },
      });
      res.json(list);
    },

    async replicateList(req: Request, res: Response) {
      const id = idParam(errors, req);
      const list = await useCases.replicateBuilderList(
        id,
        builderContract.replicateBuilderEntitySchema.parse(req.body),
      );
      res.status(201).json(list);
    },

    async deleteList(req: Request, res: Response) {
      const id = idParam(errors, req);
      await useCases.deleteBuilderList(id);
      await auditFromRequest(req)({ action: "delete", resource: "builder-list", meta: { id } });
      res.status(204).end();
    },

    async listViews(req: Request, res: Response) {
      res.json(
        await useCases.listBuilderViews(
          builderContract.listBuilderViewsQuerySchema.parse(req.query),
        ),
      );
    },

    async createView(req: Request, res: Response) {
      const view = await useCases.createBuilderView(
        builderContract.createBuilderViewSchema.parse(req.body),
      );
      await auditFromRequest(req)({
        action: "create",
        resource: "builder-view",
        resourceId: view.id,
        meta: { id: view.id },
      });
      res.status(201).json(view);
    },

    async getView(req: Request, res: Response) {
      res.json(await useCases.getBuilderView(idParam(errors, req)));
    },

    async updateView(req: Request, res: Response) {
      const id = idParam(errors, req);
      const view = await useCases.updateBuilderView(
        id,
        builderContract.updateBuilderViewSchema.parse(req.body),
      );
      await auditFromRequest(req)({
        action: "update",
        resource: "builder-view",
        resourceId: view.id,
        meta: { id: view.id },
      });
      res.json(view);
    },

    async replicateView(req: Request, res: Response) {
      const id = idParam(errors, req);
      const view = await useCases.replicateBuilderView(
        id,
        builderContract.replicateBuilderEntitySchema.parse(req.body),
      );
      res.status(201).json(view);
    },

    async deleteView(req: Request, res: Response) {
      const id = idParam(errors, req);
      await useCases.deleteBuilderView(id);
      await auditFromRequest(req)({ action: "delete", resource: "builder-view", meta: { id } });
      res.status(204).end();
    },
  };
}
