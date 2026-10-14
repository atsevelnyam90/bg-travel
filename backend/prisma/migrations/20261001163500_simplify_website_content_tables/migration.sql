-- Simplify website content tables for builder-managed public pages.
-- Page rows are selected by public nav type; child rows are section records.

-- website_pages: slug/title/description were page copy fields, but the builder needs
-- one row per public nav item keyed by type.
ALTER TABLE "website_pages" ADD COLUMN "type" TEXT;
UPDATE "website_pages"
SET "type" = COALESCE(NULLIF("slug", ''), 'home')
WHERE "type" IS NULL;
ALTER TABLE "website_pages" ALTER COLUMN "type" SET NOT NULL;

DROP INDEX IF EXISTS "website_pages_slug_key";
CREATE UNIQUE INDEX "website_pages_type_key" ON "website_pages"("type");

ALTER TABLE "website_pages" DROP COLUMN "slug";
ALTER TABLE "website_pages" DROP COLUMN "title";
ALTER TABLE "website_pages" DROP COLUMN "description";

-- website_sections: keep only the relation, section type, title and description.
ALTER TABLE "website_sections" ADD COLUMN "description" TEXT;
UPDATE "website_sections"
SET "description" = COALESCE("body", "subtitle")
WHERE "description" IS NULL;

DROP INDEX IF EXISTS "website_sections_pageId_sectionKey_itemKey_key";
DROP INDEX IF EXISTS "website_sections_sectionKey_sortOrder_idx";

ALTER TABLE "website_sections" DROP COLUMN "sectionKey";
ALTER TABLE "website_sections" DROP COLUMN "itemKey";
ALTER TABLE "website_sections" DROP COLUMN "subtitle";
ALTER TABLE "website_sections" DROP COLUMN "body";
ALTER TABLE "website_sections" DROP COLUMN "imageUrl";
ALTER TABLE "website_sections" DROP COLUMN "actionLabel";
ALTER TABLE "website_sections" DROP COLUMN "actionHref";
