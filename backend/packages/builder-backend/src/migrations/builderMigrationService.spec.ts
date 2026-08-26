import { describe, expect, it } from "vitest";
import { createBuilderMigrationService } from "./builderMigrationService";
import type {
  BuilderSchemaMigrationDefinition,
  BuilderSchemaMigrationRecord,
  BuilderSchemaMigrationRepository,
} from "./migrationTypes";

const errors = {
  conflict(message: string) {
    return new Error(message);
  },
};

class MemoryMigrationRepository implements BuilderSchemaMigrationRepository {
  ensured = false;
  records: BuilderSchemaMigrationRecord[] = [];
  applied: BuilderSchemaMigrationDefinition[] = [];

  async ensureMigrationTable(): Promise<void> {
    this.ensured = true;
  }

  async getLatestMigration(): Promise<BuilderSchemaMigrationRecord | null> {
    return this.records.at(-1) ?? null;
  }

  async applyMigration(migration: BuilderSchemaMigrationDefinition): Promise<void> {
    this.applied.push(migration);
    this.records.push({ version: migration.version, name: migration.name, appliedAt: new Date() });
  }
}

describe("createBuilderMigrationService", () => {
  it("applies pending migrations in order", async () => {
    const repository = new MemoryMigrationRepository();
    const migrations = [
      { version: 1, name: "one", statements: [] },
      { version: 2, name: "two", statements: ["ALTER TABLE example ADD COLUMN name TEXT"] },
    ];
    const service = createBuilderMigrationService({
      repository,
      errors,
      migrations,
      currentVersion: 2,
    });

    const result = await service.runBuilderMigrations();

    expect(repository.ensured).toBe(true);
    expect(result.fromVersion).toBeNull();
    expect(result.toVersion).toBe(2);
    expect(result.applied.map((migration) => migration.version)).toEqual([1, 2]);
    expect(await service.getBuilderSchemaVersion()).toBe(2);
  });

  it("fails clearly when DB schema is older than package schema", async () => {
    const repository = new MemoryMigrationRepository();
    repository.records.push({ version: 1, name: "one", appliedAt: new Date() });
    const service = createBuilderMigrationService({
      repository,
      errors,
      migrations: [
        { version: 1, name: "one", statements: [] },
        { version: 2, name: "two", statements: [] },
      ],
      currentVersion: 2,
    });

    await expect(service.assertBuilderSchemaVersion()).rejects.toThrow(
      "Builder DB schema хуучин байна",
    );
  });
});
