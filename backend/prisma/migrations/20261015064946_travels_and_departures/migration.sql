-- CreateEnum
CREATE TYPE "TravelStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "travels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "galleryImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "destination" TEXT,
    "durationDays" INTEGER NOT NULL,
    "durationNights" INTEGER NOT NULL,
    "includedServices" TEXT,
    "excludedServices" TEXT,
    "status" "TravelStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "travels_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "travels_duration_days_check" CHECK ("durationDays" > 0),
    CONSTRAINT "travels_duration_nights_check" CHECK ("durationNights" >= 0)
);

-- CreateTable
CREATE TABLE "travel_departures" (
    "id" TEXT NOT NULL,
    "travelId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "returnDate" DATE NOT NULL,
    "transportType" "transport_type" NOT NULL,
    "unitPriceMinor" BIGINT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isBookingOpen" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "travel_departures_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "travel_departures_dates_check" CHECK ("returnDate" >= "departureDate"),
    CONSTRAINT "travel_departures_capacity_check" CHECK ("capacity" > 0),
    CONSTRAINT "travel_departures_price_check" CHECK ("unitPriceMinor" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "travels_slug_key" ON "travels"("slug");

-- CreateIndex
CREATE INDEX "travels_status_sortOrder_idx" ON "travels"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "travel_departures_travelId_departureDate_idx" ON "travel_departures"("travelId", "departureDate");

-- AddForeignKey
ALTER TABLE "travel_departures" ADD CONSTRAINT "travel_departures_travelId_fkey" FOREIGN KEY ("travelId") REFERENCES "travels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
