import type {
  BuilderSchemaMigrationDefinition,
  BuilderSchemaMigrationRecord,
  BuilderSchemaMigrationRepository,
} from "@winu/builder-backend/migrations";
import { prismaUnfiltered } from "@/lib/prisma";

export const builderSchemaMigrationRepository: BuilderSchemaMigrationRepository = {
  async ensureMigrationTable(): Promise<void> {
    await prismaUnfiltered.$executeRaw`
      CREATE TABLE IF NOT EXISTS "builder_schema_migrations" (
        "version" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "builder_schema_migrations_pkey" PRIMARY KEY ("version")
      )
    `;
  },

  async getLatestMigration(): Promise<BuilderSchemaMigrationRecord | null> {
    const [row] = await prismaUnfiltered.$queryRaw<BuilderSchemaMigrationRecord[]>`
      SELECT "version", "name", "appliedAt"
      FROM "builder_schema_migrations"
      ORDER BY "version" DESC
      LIMIT 1
    `;

    return row ?? null;
  },

  async applyMigration(migration: BuilderSchemaMigrationDefinition): Promise<void> {
    await prismaUnfiltered.$transaction(async (tx) => {
      for (const statement of migration.statements) {
        // Statements are package-owned migration constants, not user input.
        await tx.$executeRawUnsafe(statement);
      }

      await tx.$executeRaw`
        INSERT INTO "builder_schema_migrations" ("version", "name")
        VALUES (${migration.version}, ${migration.name})
        ON CONFLICT ("version") DO NOTHING
      `;
    });
  },
};
