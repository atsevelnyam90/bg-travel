-- Hero copy болон олон өдрийн хөтөлбөрийг destination-аар бүлэглэх canonical бүтэц.
ALTER TABLE "travels"
  ADD COLUMN "destinationLabel" TEXT,
  ADD COLUMN "tagline" TEXT;

CREATE TABLE "travel_itinerary_sections" (
  "id" TEXT NOT NULL,
  "travelId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "travel_itinerary_sections_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "travel_itinerary_sections_travelId_fkey"
    FOREIGN KEY ("travelId") REFERENCES "travels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "travel_itinerary_sections_id_travelId_key"
  ON "travel_itinerary_sections"("id", "travelId");
CREATE INDEX "travel_itinerary_sections_travelId_sortOrder_idx"
  ON "travel_itinerary_sections"("travelId", "sortOrder");

ALTER TABLE "travel_details" ADD COLUMN "sectionId" TEXT;
CREATE INDEX "travel_details_sectionId_idx" ON "travel_details"("sectionId");
ALTER TABLE "travel_details"
  ADD CONSTRAINT "travel_details_sectionId_travelId_fkey"
  FOREIGN KEY ("sectionId", "travelId")
  REFERENCES "travel_itinerary_sections"("id", "travelId")
  ON DELETE RESTRICT ON UPDATE CASCADE;
