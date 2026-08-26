import { logger } from "@/lib/logger";
import { prisma, prismaUnfiltered } from "@/lib/prisma";
import { runBuilderMigrations } from "../migrations/builderMigrationService";

try {
  const result = await runBuilderMigrations();
  logger.info(
    {
      fromVersion: result.fromVersion,
      toVersion: result.toVersion,
      applied: result.applied.map((migration) => ({
        version: migration.version,
        name: migration.name,
      })),
    },
    "Builder migrations complete",
  );
} finally {
  await prisma.$disconnect();
  await prismaUnfiltered.$disconnect();
}
