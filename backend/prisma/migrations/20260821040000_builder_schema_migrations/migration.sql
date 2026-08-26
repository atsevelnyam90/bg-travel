CREATE TABLE IF NOT EXISTS "builder_schema_migrations" (
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "builder_schema_migrations_pkey" PRIMARY KEY ("version")
);

INSERT INTO "builder_schema_migrations" ("version", "name")
VALUES (1, 'baseline-builder-metadata-v1')
ON CONFLICT ("version") DO NOTHING;
