import {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
  Router,
} from "express";
import { createBuilderAdminController } from "./builderAdminController";
import { createBuilderRuntimeController } from "./builderRuntimeController";
import type { BuilderControllerDependencies } from "./controllerTypes";

function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export type BuilderRouterDependencies = BuilderControllerDependencies & {
  requireAuth: RequestHandler;
  adminGuard: RequestHandler;
  schemaGuard?: RequestHandler;
};

export function createBuilderRouter(deps: BuilderRouterDependencies): Router {
  const router: Router = Router();
  const adminMiddlewares = [deps.adminGuard, deps.schemaGuard].filter(Boolean) as RequestHandler[];
  const runtimeMiddlewares = [deps.requireAuth, deps.schemaGuard].filter(
    Boolean,
  ) as RequestHandler[];
  const builderAdminController = createBuilderAdminController(
    deps.auditFromRequest,
    deps.adminUseCases,
    deps.errors,
  );
  const builderRuntimeController = createBuilderRuntimeController({
    auditFromRequest: deps.auditFromRequest,
    getPermissions: deps.getPermissions,
    errors: deps.errors,
    useCases: deps.runtimeUseCases,
    runtimeAdapters: deps.runtimeAdapters,
  });

  router.get(
    "/datasources/tables",
    ...adminMiddlewares,
    asyncHandler(builderAdminController.listDbTables),
  );

  router.get("/forms", ...adminMiddlewares, asyncHandler(builderAdminController.listForms));
  router.get(
    "/forms/options",
    ...adminMiddlewares,
    asyncHandler(builderAdminController.listFormOptions),
  );
  router.get("/forms/:id", ...adminMiddlewares, asyncHandler(builderAdminController.getForm));
  router.post("/forms", ...adminMiddlewares, asyncHandler(builderAdminController.createForm));
  router.patch("/forms/:id", ...adminMiddlewares, asyncHandler(builderAdminController.updateForm));
  router.post(
    "/forms/:id/replicate",
    ...adminMiddlewares,
    asyncHandler(builderAdminController.replicateForm),
  );
  router.delete("/forms/:id", ...adminMiddlewares, asyncHandler(builderAdminController.deleteForm));

  router.get("/lists", ...adminMiddlewares, asyncHandler(builderAdminController.listLists));
  router.get(
    "/lists/options",
    ...adminMiddlewares,
    asyncHandler(builderAdminController.listListOptions),
  );
  router.get("/lists/:id", ...adminMiddlewares, asyncHandler(builderAdminController.getList));
  router.post("/lists", ...adminMiddlewares, asyncHandler(builderAdminController.createList));
  router.patch("/lists/:id", ...adminMiddlewares, asyncHandler(builderAdminController.updateList));
  router.post(
    "/lists/:id/replicate",
    ...adminMiddlewares,
    asyncHandler(builderAdminController.replicateList),
  );
  router.delete("/lists/:id", ...adminMiddlewares, asyncHandler(builderAdminController.deleteList));

  router.get("/views", ...adminMiddlewares, asyncHandler(builderAdminController.listViews));
  router.post("/views", ...adminMiddlewares, asyncHandler(builderAdminController.createView));
  router.get("/views/:id", ...adminMiddlewares, asyncHandler(builderAdminController.getView));
  router.patch("/views/:id", ...adminMiddlewares, asyncHandler(builderAdminController.updateView));
  router.post(
    "/views/:id/replicate",
    ...adminMiddlewares,
    asyncHandler(builderAdminController.replicateView),
  );
  router.delete("/views/:id", ...adminMiddlewares, asyncHandler(builderAdminController.deleteView));

  router.get(
    "/runtime/forms/:id",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.getForm),
  );
  router.get(
    "/runtime/forms/:id/fields/:fieldKey/options",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.listFieldOptions),
  );
  router.post(
    "/runtime/forms/:id/fields/:fieldKey/triggers/:event",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.runFormFieldTrigger),
  );
  router.post(
    "/runtime/forms/:id/entries",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.createFormEntry),
  );
  router.get(
    "/runtime/lists/:id",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.getList),
  );
  router.get(
    "/runtime/lists/:id/entries",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.listListEntries),
  );
  router.get(
    "/runtime/views/:id",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.getView),
  );
  router.post(
    "/runtime/views/:viewId/fields/:fieldKey/triggers/:event",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.runViewFieldTrigger),
  );
  router.get(
    "/runtime/views/:viewId/entries",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.listEntries),
  );
  router.post(
    "/runtime/views/:viewId/entries",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.createEntry),
  );
  router.patch(
    "/runtime/views/:viewId/entries/:id",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.updateEntry),
  );
  router.delete(
    "/runtime/views/:viewId/entries/:id",
    ...runtimeMiddlewares,
    asyncHandler(builderRuntimeController.deleteEntry),
  );

  return router;
}
