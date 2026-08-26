export type BuilderSchemaMigrationDefinition = {
  version: number;
  name: string;
  statements: readonly string[];
};

export type BuilderSchemaMigrationRecord = {
  version: number;
  name: string;
  appliedAt: Date | string;
};

export type BuilderSchemaMigrationRepository = {
  ensureMigrationTable(): Promise<void>;
  getLatestMigration(): Promise<BuilderSchemaMigrationRecord | null>;
  applyMigration(migration: BuilderSchemaMigrationDefinition): Promise<void>;
};

export type RunBuilderMigrationsResult = {
  fromVersion: number | null;
  toVersion: number;
  applied: readonly BuilderSchemaMigrationDefinition[];
};
