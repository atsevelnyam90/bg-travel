import type { BuilderErrors } from "../errors";
import {
  BUILDER_SCHEMA_MIGRATIONS,
  CURRENT_BUILDER_SCHEMA_VERSION,
} from "./builderSchemaMigrations";
import type {
  BuilderSchemaMigrationDefinition,
  BuilderSchemaMigrationRepository,
  RunBuilderMigrationsResult,
} from "./migrationTypes";

export type BuilderMigrationServiceDependencies = {
  repository: BuilderSchemaMigrationRepository;
  errors: Pick<BuilderErrors, "conflict">;
  migrations?: readonly BuilderSchemaMigrationDefinition[];
  currentVersion?: number;
};

export function createBuilderMigrationService(deps: BuilderMigrationServiceDependencies) {
  const migrations = deps.migrations ?? BUILDER_SCHEMA_MIGRATIONS;
  const currentVersion = deps.currentVersion ?? CURRENT_BUILDER_SCHEMA_VERSION;

  assertValidMigrations(migrations, currentVersion);

  return {
    async getBuilderSchemaVersion(): Promise<number | null> {
      await deps.repository.ensureMigrationTable();
      return (await deps.repository.getLatestMigration())?.version ?? null;
    },

    async runBuilderMigrations(): Promise<RunBuilderMigrationsResult> {
      await deps.repository.ensureMigrationTable();
      const latest = await deps.repository.getLatestMigration();
      const fromVersion = latest?.version ?? null;
      const pending = migrations.filter((migration) => migration.version > (fromVersion ?? 0));

      for (const migration of pending) {
        await deps.repository.applyMigration(migration);
      }

      return {
        fromVersion,
        toVersion: currentVersion,
        applied: pending,
      };
    },

    async assertBuilderSchemaVersion(): Promise<void> {
      await deps.repository.ensureMigrationTable();
      const latest = await deps.repository.getLatestMigration();

      if (!latest) {
        throw deps.errors.conflict(
          "Builder DB schema version олдсонгүй. Builder migration ажиллуулна уу.",
        );
      }

      if (latest.version < currentVersion) {
        throw deps.errors.conflict(
          `Builder DB schema хуучин байна. DB=${latest.version}, package=${currentVersion}. Builder migration ажиллуулна уу.`,
        );
      }

      if (latest.version > currentVersion) {
        throw deps.errors.conflict(
          `Builder DB schema package-аас шинэ байна. DB=${latest.version}, package=${currentVersion}. Package update шалгана уу.`,
        );
      }
    },
  };
}

function assertValidMigrations(
  migrations: readonly BuilderSchemaMigrationDefinition[],
  currentVersion: number,
) {
  let previousVersion = 0;
  const names = new Set<string>();

  for (const migration of migrations) {
    if (!Number.isInteger(migration.version) || migration.version <= 0) {
      throw new Error("Builder migration version эерэг бүхэл тоо байх ёстой");
    }
    if (migration.version <= previousVersion) {
      throw new Error("Builder migrations version-оор өсөх дараалалтай байх ёстой");
    }
    if (names.has(migration.name)) {
      throw new Error(`Builder migration name давхардсан байна: ${migration.name}`);
    }
    previousVersion = migration.version;
    names.add(migration.name);
  }

  if (previousVersion !== currentVersion) {
    throw new Error(
      "Builder current schema version сүүлийн migration version-той тэнцүү байх ёстой",
    );
  }
}
