-- Section gallery нь өдрийн зургаас тусдаа, тухайн чиглэлийн curated media байна.
ALTER TABLE "travel_itinerary_sections"
  ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
