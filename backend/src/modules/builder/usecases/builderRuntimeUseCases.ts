import { createBuilderRuntimeUseCases } from "@winu/builder-backend/usecases";
import { starterBuilderRuntimeAdapters } from "../datasources/runtimeEntryDatasources";
import { builderMetadataRepository } from "../repositories/builderMetadataRepository";
import { builderErrors } from "../shared/builderErrors";
import { runBuilderFieldTrigger } from "../triggers/runBuilderFieldTrigger";
import { runBuilderTriggers } from "../triggers/runBuilderTriggers";
import { listBuilderFieldOptions as listBuilderDatasourceFieldOptions } from "./builderDatasourceUseCases";
import { getRuntimeBuilderView } from "./builderViewUseCases";

const builderRuntimeUseCases = createBuilderRuntimeUseCases({
  metadataRepository: builderMetadataRepository,
  errors: builderErrors,
  runtimeAdapters: starterBuilderRuntimeAdapters,
  runFieldTrigger: runBuilderFieldTrigger,
  runTriggers: runBuilderTriggers,
  listFieldOptions: listBuilderDatasourceFieldOptions,
  getRuntimeBuilderView,
});

export const {
  createBuilderViewEntry,
  createRuntimeBuilderFormEntry,
  deleteBuilderViewEntry,
  getRuntimeBuilderForm,
  getRuntimeBuilderList,
  listBuilderViewEntries,
  listRuntimeBuilderFormFieldOptions,
  listRuntimeBuilderListEntries,
  runRuntimeBuilderFormFieldTrigger,
  runRuntimeBuilderViewFieldTrigger,
  updateBuilderViewEntry,
} = builderRuntimeUseCases;
