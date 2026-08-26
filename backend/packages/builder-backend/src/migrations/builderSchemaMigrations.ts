import type { BuilderSchemaMigrationDefinition } from "./migrationTypes";

export const CURRENT_BUILDER_SCHEMA_VERSION = 1;

export const BUILDER_SCHEMA_MIGRATIONS: readonly BuilderSchemaMigrationDefinition[] = [
  {
    version: 1,
    name: "baseline-builder-metadata-v1",
    statements: [],
  },
];
