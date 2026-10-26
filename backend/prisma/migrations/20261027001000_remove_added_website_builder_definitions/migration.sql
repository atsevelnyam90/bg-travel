-- Remove only the WebSite metadata introduced during the investigation.
-- Keep soft-deletion history and leave website content and unrelated views intact.
BEGIN;

WITH removed AS (
  UPDATE "builder_views"
  SET "deletedAt" = CURRENT_TIMESTAMP,
      "updatedAt" = CURRENT_TIMESTAMP,
      "version" = "version" + 1
  WHERE "id" IN (
    '44444444-4444-4444-8444-444444444443',
    '44444444-4444-4444-8444-444444444453'
  ) AND "deletedAt" IS NULL
  RETURNING "id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'delete', 'builderView', "id",
       '{"source":"removeAddedWebsiteBuilderDefinitions","changedFields":["deletedAt"]}'::jsonb
FROM removed;

WITH removed AS (
  UPDATE "builder_definitions"
  SET "deletedAt" = CURRENT_TIMESTAMP,
      "updatedAt" = CURRENT_TIMESTAMP,
      "version" = "version" + 1
  WHERE "id" IN (
    '44444444-4444-4444-8444-444444444441',
    '44444444-4444-4444-8444-444444444442',
    '44444444-4444-4444-8444-444444444451',
    '44444444-4444-4444-8444-444444444452'
  ) AND "deletedAt" IS NULL
  RETURNING "id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'delete', 'builderDefinition', "id",
       '{"source":"removeAddedWebsiteBuilderDefinitions","changedFields":["deletedAt"]}'::jsonb
FROM removed;

COMMIT;
