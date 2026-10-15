-- Public API-д дотоод primary key задруулахгүй тогтвортой танигч нэмнэ.
-- Existing мөрүүдийг эхлээд backfill хийсний дараа NOT NULL/unique болгоно.
ALTER TABLE "travels" ADD COLUMN "publicId" TEXT;
ALTER TABLE "travel_departures" ADD COLUMN "publicId" TEXT;

UPDATE "travels"
SET "publicId" = gen_random_uuid()::text
WHERE "publicId" IS NULL;

UPDATE "travel_departures"
SET "publicId" = gen_random_uuid()::text
WHERE "publicId" IS NULL;

ALTER TABLE "travels" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "travel_departures" ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "travels_publicId_key" ON "travels"("publicId");
CREATE UNIQUE INDEX "travel_departures_publicId_key" ON "travel_departures"("publicId");
