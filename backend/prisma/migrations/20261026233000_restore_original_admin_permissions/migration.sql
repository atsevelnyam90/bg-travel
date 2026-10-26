-- Keep Dulguun's original org:manage model and grant it to system admins.
-- Earlier migrations have already run; reverse only their permission changes.
BEGIN;

WITH changed AS (
  UPDATE "roles" AS role
  SET "permissions" = array_remove(array_remove(array_remove(
        role."permissions", 'travel:read'), 'travel:write'), 'builder:manage')
        || CASE
          WHEN role."name" = 'admin' AND NOT 'org:manage' = ANY(role."permissions")
            THEN ARRAY['org:manage']
          ELSE ARRAY[]::text[]
        END,
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE role."name" IN ('owner', 'admin')
    AND role."isSystem" = true
    AND (role."permissions" && ARRAY['travel:read', 'travel:write', 'builder:manage']
      OR (role."name" = 'admin' AND NOT 'org:manage' = ANY(role."permissions")))
  RETURNING role."id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'update', 'role', "id",
       '{"source":"restoreOriginalAdminPermissions","changedFields":["permissions"]}'::jsonb
FROM changed;

WITH target AS (
  SELECT "id", "permissionRead", "permissionWrite"
  FROM "builder_views"
  WHERE "id" IN (
    '66666666-6666-4666-8666-666666666663',
    '66666666-6666-4666-8666-666666666673',
    '66666666-6666-4666-8666-666666666683',
    '66666666-6666-4666-8666-666666666693',
    '44444444-4444-4444-8444-444444444443',
    '44444444-4444-4444-8444-444444444453'
  )
    AND ("permissionRead" IN ('travel:read', 'travel:write', 'builder:manage')
      OR "permissionWrite" IN ('travel:read', 'travel:write', 'builder:manage'))
  FOR UPDATE
), changed AS (
  UPDATE "builder_views" AS view
  SET "permissionRead" = CASE
        WHEN target."permissionRead" IN ('travel:read', 'travel:write', 'builder:manage')
          THEN 'org:manage' ELSE target."permissionRead" END,
      "permissionWrite" = CASE
        WHEN target."permissionWrite" IN ('travel:read', 'travel:write', 'builder:manage')
          THEN 'org:manage' ELSE target."permissionWrite" END,
      "version" = view."version" + 1,
      "updatedAt" = CURRENT_TIMESTAMP
  FROM target
  WHERE view."id" = target."id"
  RETURNING view."id", target."permissionRead" AS old_read,
            target."permissionWrite" AS old_write
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'update', 'builderView', "id",
       jsonb_build_object(
         'source', 'restoreOriginalAdminPermissions',
         'changedFields', to_jsonb(array_remove(ARRAY[
           CASE WHEN old_read IN ('travel:read', 'travel:write', 'builder:manage') THEN 'permissionRead' END,
           CASE WHEN old_write IN ('travel:read', 'travel:write', 'builder:manage') THEN 'permissionWrite' END
         ], NULL))
       )
FROM changed;

COMMIT;
