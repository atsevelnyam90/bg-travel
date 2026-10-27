ALTER TABLE "travels"
  ADD COLUMN "nameEn" TEXT,
  ADD COLUMN "destinationLabelEn" TEXT,
  ADD COLUMN "taglineEn" TEXT,
  ADD COLUMN "descriptionEn" TEXT,
  ADD COLUMN "nameZh" TEXT,
  ADD COLUMN "destinationLabelZh" TEXT,
  ADD COLUMN "taglineZh" TEXT,
  ADD COLUMN "descriptionZh" TEXT,
  ADD COLUMN "nameKo" TEXT,
  ADD COLUMN "destinationLabelKo" TEXT,
  ADD COLUMN "taglineKo" TEXT,
  ADD COLUMN "descriptionKo" TEXT;

ALTER TABLE "travel_itinerary_sections"
  ADD COLUMN "titleEn" TEXT,
  ADD COLUMN "descriptionEn" TEXT,
  ADD COLUMN "titleZh" TEXT,
  ADD COLUMN "descriptionZh" TEXT,
  ADD COLUMN "titleKo" TEXT,
  ADD COLUMN "descriptionKo" TEXT;

ALTER TABLE "travel_details"
  ADD COLUMN "titleEn" TEXT,
  ADD COLUMN "contentEn" TEXT,
  ADD COLUMN "titleZh" TEXT,
  ADD COLUMN "contentZh" TEXT,
  ADD COLUMN "titleKo" TEXT,
  ADD COLUMN "contentKo" TEXT;
