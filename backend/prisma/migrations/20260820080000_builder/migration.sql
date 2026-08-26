-- Dynamic builder: screen schema registry + runtime JSON entries.

CREATE TABLE "builder_screens" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tableSchema" JSONB NOT NULL,
    "formSchema" JSONB NOT NULL,
    "permissionRead" TEXT,
    "permissionWrite" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "builder_screens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "builder_entries" (
    "id" TEXT NOT NULL,
    "screenId" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "builder_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "builder_screens_key_key" ON "builder_screens"("key");
CREATE INDEX "builder_screens_createdAt_idx" ON "builder_screens"("createdAt");
CREATE INDEX "builder_entries_screenId_createdAt_idx" ON "builder_entries"("screenId", "createdAt");

ALTER TABLE "builder_entries"
ADD CONSTRAINT "builder_entries_screenId_fkey"
FOREIGN KEY ("screenId") REFERENCES "builder_screens"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
