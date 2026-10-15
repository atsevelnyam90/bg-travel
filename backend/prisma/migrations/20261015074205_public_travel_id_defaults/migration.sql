-- AlterTable
ALTER TABLE "travel_departures" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "travels" ALTER COLUMN "publicId" SET DEFAULT gen_random_uuid()::text;
