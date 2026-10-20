-- Itinerary media нь олон зурагтай байж болно. Хуучин ганц URL-г алдалгүй array руу шилжүүлнэ.
ALTER TABLE "travel_details"
  ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "travel_details"
SET "images" = ARRAY["mediaUrl"]
WHERE "mediaUrl" IS NOT NULL;

ALTER TABLE "travel_details"
  DROP CONSTRAINT "travel_details_media_pair_check",
  DROP COLUMN "mediaUrl",
  DROP COLUMN "mediaType";

DROP TYPE "TravelMediaType";
