-- Builder v2: form, list, view are separate reusable entities.

CREATE TABLE "builder_forms" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "builder_forms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "builder_lists" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "builder_lists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "builder_views" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "formId" TEXT,
    "listId" TEXT,
    "permissionRead" TEXT,
    "permissionWrite" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "builder_views_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "builder_view_entries" (
    "id" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "builder_view_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "builder_forms_key_key" ON "builder_forms"("key");
CREATE INDEX "builder_forms_createdAt_idx" ON "builder_forms"("createdAt");
CREATE UNIQUE INDEX "builder_lists_key_key" ON "builder_lists"("key");
CREATE INDEX "builder_lists_createdAt_idx" ON "builder_lists"("createdAt");
CREATE UNIQUE INDEX "builder_views_key_key" ON "builder_views"("key");
CREATE INDEX "builder_views_formId_idx" ON "builder_views"("formId");
CREATE INDEX "builder_views_listId_idx" ON "builder_views"("listId");
CREATE INDEX "builder_views_createdAt_idx" ON "builder_views"("createdAt");
CREATE INDEX "builder_view_entries_viewId_createdAt_idx" ON "builder_view_entries"("viewId", "createdAt");

ALTER TABLE "builder_views"
ADD CONSTRAINT "builder_views_formId_fkey"
FOREIGN KEY ("formId") REFERENCES "builder_forms"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "builder_views"
ADD CONSTRAINT "builder_views_listId_fkey"
FOREIGN KEY ("listId") REFERENCES "builder_lists"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "builder_view_entries"
ADD CONSTRAINT "builder_view_entries_viewId_fkey"
FOREIGN KEY ("viewId") REFERENCES "builder_views"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
