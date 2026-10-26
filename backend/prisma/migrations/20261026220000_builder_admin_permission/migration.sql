-- Existing system admins need Builder access without organization management.
-- Preserve custom role permissions and make repeated execution harmless.
BEGIN;

WITH changed AS (
  UPDATE "roles" AS role
  SET "permissions" = array_append(role."permissions", 'builder:manage'),
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE role."name" IN ('owner', 'admin')
    AND role."isSystem" = true
    AND NOT ('builder:manage' = ANY(role."permissions"))
  RETURNING role."id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'update', 'role', "id",
       '{"source":"builderAdminPermissionMigration","changedFields":["permissions"]}'::jsonb
FROM changed;

COMMIT;
