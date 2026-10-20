-- Travel-ын stable public metadata болон өдөр бүрийн itinerary-г canonical domain data болгоно.
CREATE TYPE "TravelCategory" AS ENUM ('DOMESTIC', 'INTERNATIONAL', 'WEDDING');
CREATE TYPE "TravelStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "TravelMediaType" AS ENUM ('IMAGE', 'VIDEO');

ALTER TABLE "travels"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "category" "TravelCategory" NOT NULL DEFAULT 'DOMESTIC',
  ADD COLUMN "status" "TravelStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "coverImage" TEXT,
  ADD COLUMN "durationDays" INTEGER NOT NULL DEFAULT 1;

-- Existing names Mongolian эсвэл давхцсан байсан ч id suffix нь deterministic, unique slug өгнө.
UPDATE "travels"
SET "slug" = COALESCE(
  NULLIF(
    TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER("name"), '[^a-z0-9]+', '-', 'g')),
    ''
  ),
  'travel'
) || '-' || SUBSTRING("id" FROM 1 FOR 8)
WHERE "slug" IS NULL;

ALTER TABLE "travels"
  ALTER COLUMN "slug" SET NOT NULL,
  ADD CONSTRAINT "travels_durationDays_check" CHECK ("durationDays" > 0);

CREATE UNIQUE INDEX "travels_slug_key" ON "travels"("slug");
CREATE INDEX "travels_status_category_idx" ON "travels"("status", "category");

CREATE TABLE "travel_details" (
  "id" TEXT NOT NULL,
  "travelId" TEXT NOT NULL,
  "dayNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "mediaUrl" TEXT,
  "mediaType" "TravelMediaType",
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "travel_details_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "travel_details_dayNumber_check" CHECK ("dayNumber" > 0),
  CONSTRAINT "travel_details_media_pair_check" CHECK (
    ("mediaUrl" IS NULL AND "mediaType" IS NULL)
    OR ("mediaUrl" IS NOT NULL AND "mediaType" IS NOT NULL)
  ),
  CONSTRAINT "travel_details_travelId_fkey"
    FOREIGN KEY ("travelId") REFERENCES "travels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "travel_details_travelId_dayNumber_idx" ON "travel_details"("travelId", "dayNumber");
CREATE UNIQUE INDEX "travel_details_active_day_key"
  ON "travel_details"("travelId", "dayNumber")
  WHERE "deletedAt" IS NULL;
