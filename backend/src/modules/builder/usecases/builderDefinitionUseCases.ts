import { createBuilderDefinitionUseCases } from "@winu/builder-backend/usecases";
import { builderMetadataRepository } from "../repositories/builderMetadataRepository";
import { builderErrors } from "../shared/builderErrors";

const builderDefinitionUseCases = createBuilderDefinitionUseCases({
  metadataRepository: builderMetadataRepository,
  errors: builderErrors,
});

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
