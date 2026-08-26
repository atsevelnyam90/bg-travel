import { createBuilderMigrationService } from "@winu/builder-backend/migrations";
import { builderErrors } from "../shared/builderErrors";
import { builderSchemaMigrationRepository } from "./builderSchemaMigrationRepository";

const builderMigrationService = createBuilderMigrationService({
  repository: builderSchemaMigrationRepository,
  errors: builderErrors,
});

export const { assertBuilderSchemaVersion, getBuilderSchemaVersion, runBuilderMigrations } =
  builderMigrationService;
