-- Give the existing system administrators access to trips without granting
-- organization management. Preserve other role permissions and edited views.
BEGIN;

WITH changed AS (
  UPDATE "roles" AS role
  SET "permissions" = role."permissions" || ARRAY(
        SELECT permission
        FROM unnest(ARRAY['travel:read', 'travel:write']) AS permission
        WHERE NOT permission = ANY(role."permissions")
      ),
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE role."name" IN ('owner', 'admin')
    AND role."isSystem" = true
    AND (NOT 'travel:read' = ANY(role."permissions")
      OR NOT 'travel:write' = ANY(role."permissions"))
  RETURNING role."id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'update', 'role', "id",
       '{"source":"travelPermissionsMigration","changedFields":["permissions"]}'::jsonb
FROM changed;

WITH target AS (
  SELECT "id", "permissionRead", "permissionWrite"
  FROM "builder_views"
  WHERE "id" IN (
    '66666666-6666-4666-8666-666666666663',
    '66666666-6666-4666-8666-666666666673',
    '66666666-6666-4666-8666-666666666683',
    '66666666-6666-4666-8666-666666666693'
  )
    AND ("permissionRead" = 'org:manage' OR "permissionWrite" = 'org:manage')
  FOR UPDATE
), changed AS (
  UPDATE "builder_views" AS view
  SET "permissionRead" = CASE
        WHEN target."permissionRead" = 'org:manage' THEN 'travel:read'
        ELSE target."permissionRead"
      END,
      "permissionWrite" = CASE
        WHEN target."permissionWrite" = 'org:manage' THEN 'travel:write'
        ELSE target."permissionWrite"
      END,
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
         'source', 'travelPermissionsMigration',
         'changedFields', to_jsonb(array_remove(ARRAY[
           CASE WHEN old_read = 'org:manage' THEN 'permissionRead' END,
           CASE WHEN old_write = 'org:manage' THEN 'permissionWrite' END
         ], NULL))
       )
FROM changed;

COMMIT;
