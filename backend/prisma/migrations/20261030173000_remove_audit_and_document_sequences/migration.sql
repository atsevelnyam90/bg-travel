-- Runtime audit болон дарааллын нэмэлт write/commit-уудыг бүрэн авна.
UPDATE "roles"
SET "permissions" = array_remove("permissions", 'audit:read')
WHERE 'audit:read' = ANY("permissions");

DROP TABLE IF EXISTS "audit_logs";
DROP TABLE IF EXISTS "document_sequences";
