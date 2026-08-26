import { createBuilderDatasourceUseCases } from "@winu/builder-backend/datasources";
import { builderDatasourceRepository } from "../repositories/builderDatasourceRepository";
import { builderErrors } from "../shared/builderErrors";

const builderDatasourceUseCases = createBuilderDatasourceUseCases({
  datasourceRepository: builderDatasourceRepository,
  errors: builderErrors,
});

export const { listBuilderDbTables, listBuilderFieldOptions } = builderDatasourceUseCases;
