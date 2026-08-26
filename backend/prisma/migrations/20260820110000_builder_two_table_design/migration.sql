-- Builder v4: compact two-table design.
-- Definitions table stores both forms and lists via `type`.
-- Views table links one form definition and one list definition.

DROP TABLE IF EXISTS "builder_view_entries";
DROP TABLE IF EXISTS "builder_entries";
DROP TABLE IF EXISTS "builder_views";
DROP TABLE IF EXISTS "builder_forms";
DROP TABLE IF EXISTS "builder_lists";
DROP TABLE IF EXISTS "builder_screens";

CREATE TABLE "builder_definitions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" JSONB,
    "schema" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "builder_definitions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "builder_definitions_type_check" CHECK ("type" IN ('form', 'list'))
);

CREATE TABLE "builder_views" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "formId" TEXT,
    "listId" TEXT,
    "permissionRead" TEXT,
    "permissionWrite" TEXT,
    "triggers" JSONB,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "builder_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "builder_definitions_type_createdAt_idx" ON "builder_definitions"("type", "createdAt");
CREATE INDEX "builder_views_formId_idx" ON "builder_views"("formId");
CREATE INDEX "builder_views_listId_idx" ON "builder_views"("listId");
CREATE INDEX "builder_views_createdAt_idx" ON "builder_views"("createdAt");

ALTER TABLE "builder_views"
ADD CONSTRAINT "builder_views_formId_fkey"
FOREIGN KEY ("formId") REFERENCES "builder_definitions"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "builder_views"
ADD CONSTRAINT "builder_views_listId_fkey"
FOREIGN KEY ("listId") REFERENCES "builder_definitions"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
