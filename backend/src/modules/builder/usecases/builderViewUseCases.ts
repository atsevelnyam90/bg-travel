import { createBuilderViewUseCases } from "@winu/builder-backend/usecases";
import { builderMetadataRepository } from "../repositories/builderMetadataRepository";
import { builderErrors } from "../shared/builderErrors";
import { DEFAULT_BUILDER_VIEW_PERMISSION } from "../shared/builderMapper";

const builderViewUseCases = createBuilderViewUseCases({
  metadataRepository: builderMetadataRepository,
  errors: builderErrors,
  defaultViewPermission: DEFAULT_BUILDER_VIEW_PERMISSION,
});

export const {
  createBuilderView,
  deleteBuilderView,
  getBuilderView,
  getRuntimeBuilderView,
  listBuilderViews,
  replicateBuilderView,
  updateBuilderView,
} = builderViewUseCases;
