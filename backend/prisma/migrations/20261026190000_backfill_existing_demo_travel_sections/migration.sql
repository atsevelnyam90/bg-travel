-- Complete the existing production demo without replacing editor-managed values.
BEGIN;
LOCK TABLE "travel_itinerary_sections" IN SHARE ROW EXCLUSIVE MODE;

WITH changed AS (
  UPDATE "travels"
  SET "destinationLabel" = 'ХӨХХОТ · ХАНОЙ · КАТ БА · ХАЛОНГ',
      "version" = "version" + 1,
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE "slug" = 'vietnam-three-cities'
    AND "deletedAt" IS NULL
    AND "destinationLabel" IS NULL
  RETURNING "id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'update', 'travel', "id",
       '{"source":"demoTravelBackfill","changedFields":["destinationLabel"]}'::jsonb
FROM changed;

WITH changed AS (
  UPDATE "travels"
  SET "tagline" = 'ХОТЫН СОЁЛ, АРЛЫН АМРАЛТ, БУЛАНГИЙН АДАЛ ЯВДАЛ',
      "version" = "version" + 1,
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE "slug" = 'vietnam-three-cities'
    AND "deletedAt" IS NULL
    AND "tagline" IS NULL
  RETURNING "id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'update', 'travel', "id",
       '{"source":"demoTravelBackfill","changedFields":["tagline"]}'::jsonb
FROM changed;

-- Skip the section backfill when an editor has already created or removed a section.
CREATE TEMP TABLE "demo_travel_backfill_targets" ON COMMIT DROP AS
SELECT "id" FROM "travels" AS travel
WHERE "slug" = 'vietnam-three-cities'
  AND "deletedAt" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "travel_itinerary_sections" AS section
    WHERE section."travelId" = travel."id"
  );

INSERT INTO "travel_itinerary_sections"
  ("id", "travelId", "title", "description", "images", "sortOrder")
SELECT gen_random_uuid()::text, target."id", section."title", section."description",
       section."images", section."sortOrder"
FROM "demo_travel_backfill_targets" AS target
CROSS JOIN (VALUES
  (
    'ХӨХХОТ & ХАНОЙ',
    'Хөххотоос аяллаа эхлүүлж, Ханойн түүхэн дурсгал, хуучны гудамж болон орчин үеийн хэмнэлийг танина.',
    ARRAY[
      '/images/trips/vietnam-three-cities/hanoi-old-quarter.jpg',
      '/images/trips/vietnam-three-cities/hanoi-mausoleum.jpg',
      '/images/trips/vietnam-three-cities/one-pillar-pagoda.jpg'
    ]::text[],
    1
  ),
  (
    'КАТ БА & ХАЛОНГ',
    'Далайн эргийн амралт, шохойн чулуун арлууд, усан онгоцны аяллыг нэг хэсэгт төвлөрүүлнэ.',
    ARRAY[
      '/images/trips/vietnam-three-cities/cat-ba-beach.jpg',
      '/images/trips/vietnam-three-cities/halong-bay.jpg',
      '/images/trips/vietnam-three-cities/halong-cruise.jpg',
      '/images/trips/vietnam-three-cities/halong-cave.jpg'
    ]::text[],
    2
  ),
  (
    'БУЦАХ ЗАМ',
    'Ханойгоос Хөххотоор дамжин Эрээнд хүрснээр аялал өндөрлөнө.',
    ARRAY[
      '/images/trips/vietnam-three-cities/vietnam-travelers.jpg',
      '/images/trips/vietnam-three-cities/flight-home.jpg'
    ]::text[],
    3
  )
) AS section("title", "description", "images", "sortOrder");

INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'create', 'travelItinerarySection', section."id",
       '{"source":"demoTravelBackfill"}'::jsonb
FROM "travel_itinerary_sections" AS section
JOIN "demo_travel_backfill_targets" AS target ON target."id" = section."travelId";

WITH changed AS (
  UPDATE "travel_details" AS detail
  SET "sectionId" = section."id",
      "version" = detail."version" + 1,
      "updatedAt" = CURRENT_TIMESTAMP
  FROM "travel_itinerary_sections" AS section
  JOIN "demo_travel_backfill_targets" AS target ON target."id" = section."travelId"
  WHERE detail."travelId" = target."id"
    AND detail."sectionId" IS NULL
    AND detail."deletedAt" IS NULL
    AND (
      (section."sortOrder" = 1 AND detail."dayNumber" BETWEEN 1 AND 3)
      OR (section."sortOrder" = 2 AND detail."dayNumber" BETWEEN 4 AND 6)
      OR (section."sortOrder" = 3 AND detail."dayNumber" BETWEEN 7 AND 8)
    )
  RETURNING detail."id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'update', 'travelDetail', "id",
       '{"source":"demoTravelBackfill","changedFields":["sectionId"]}'::jsonb
FROM changed;

COMMIT;
