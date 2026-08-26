-- Builder v3: runtime is id-first, while key remains optional legacy/display metadata.
-- Form/List can bind to a project DB table or API endpoint via source JSON.
-- View can store trigger pipeline metadata.

ALTER TABLE "builder_forms"
ALTER COLUMN "key" DROP NOT NULL,
ADD COLUMN "source" JSONB;

ALTER TABLE "builder_lists"
ALTER COLUMN "key" DROP NOT NULL,
ADD COLUMN "source" JSONB;

ALTER TABLE "builder_views"
ALTER COLUMN "key" DROP NOT NULL,
ADD COLUMN "triggers" JSONB;
