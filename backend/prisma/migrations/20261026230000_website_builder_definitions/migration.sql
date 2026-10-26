-- Restore the four WebSite Builder definitions shown in the development
-- database. Existing definitions and views, including editor changes, win.
BEGIN;

WITH created AS (
  INSERT INTO "builder_definitions"
    ("id", "type", "title", "source", "schema", "triggers", "updatedAt")
  VALUES
    (
      '44444444-4444-4444-8444-444444444441', 'form', 'WebSite Pages Form',
      '{"type":"dbTable","tableName":"website_pages"}'::jsonb,
      '{"presentation":"dialog","fields":[{"key":"type","label":"Page type","type":"text","required":true,"hidden":false,"disabled":false,"triggers":[]},{"key":"status","label":"Status","type":"text","required":true,"hidden":false,"disabled":false,"defaultValue":"draft","triggers":[]},{"key":"sortOrder","label":"Sort order","type":"number","required":false,"hidden":false,"disabled":false,"triggers":[]}],"subforms":[{"key":"sections","label":"Sections","viewId":"44444444-4444-4444-8444-444444444453","parentField":"id","childField":"pageId","buttonLabel":"Add section","icon":"plus","presentation":"dialog"}]}'::jsonb,
      '[]'::jsonb, CURRENT_TIMESTAMP
    ),
    (
      '44444444-4444-4444-8444-444444444442', 'list', 'WebSite Pages List',
      '{"type":"dbTable","tableName":"website_pages"}'::jsonb,
      '{"columns":[{"key":"type","label":"Page type","sortable":true,"hidden":false,"align":"left"},{"key":"status","label":"Status","sortable":true,"hidden":false,"align":"left"},{"key":"sortOrder","label":"Sort order","sortable":true,"hidden":false,"align":"right"}]}'::jsonb,
      '[]'::jsonb, CURRENT_TIMESTAMP
    ),
    (
      '44444444-4444-4444-8444-444444444451', 'form', 'WebSite Sections Form',
      '{"type":"dbTable","tableName":"website_sections"}'::jsonb,
      '{"presentation":"dialog","fields":[{"key":"pageId","label":"Page ID","type":"text","required":true,"hidden":true,"disabled":false,"triggers":[]},{"key":"type","label":"Section type","type":"text","required":true,"hidden":false,"disabled":false,"triggers":[]},{"key":"title","label":"Title","type":"text","required":true,"hidden":false,"disabled":false,"triggers":[]},{"key":"description","label":"Description","type":"textarea","required":false,"hidden":false,"disabled":false,"triggers":[]},{"key":"sortOrder","label":"Sort order","type":"number","required":false,"hidden":false,"disabled":false,"triggers":[]},{"key":"isActive","label":"Active","type":"checkbox","required":false,"hidden":false,"disabled":false,"triggers":[]}],"subforms":[]}'::jsonb,
      '[]'::jsonb, CURRENT_TIMESTAMP
    ),
    (
      '44444444-4444-4444-8444-444444444452', 'list', 'WebSite Sections List',
      '{"type":"dbTable","tableName":"website_sections"}'::jsonb,
      '{"columns":[{"key":"type","label":"Section type","sortable":true,"hidden":false,"align":"left"},{"key":"title","label":"Title","sortable":true,"hidden":false,"align":"left"},{"key":"sortOrder","label":"Sort order","sortable":true,"hidden":false,"align":"right"},{"key":"isActive","label":"Active","sortable":true,"hidden":false,"align":"left"}]}'::jsonb,
      '[]'::jsonb, CURRENT_TIMESTAMP
    )
  ON CONFLICT ("id") DO NOTHING
  RETURNING "id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'create', 'builderDefinition', "id",
       '{"source":"websiteBuilderDefinitionsMigration"}'::jsonb
FROM created;

WITH created AS (
  INSERT INTO "builder_views"
    ("id", "title", "formId", "listId", "permissionRead", "permissionWrite", "triggers", "updatedAt")
  VALUES
    (
      '44444444-4444-4444-8444-444444444443', 'WebSite Pages',
      '44444444-4444-4444-8444-444444444441',
      '44444444-4444-4444-8444-444444444442',
      'builder:manage', 'builder:manage', '[]'::jsonb, CURRENT_TIMESTAMP
    ),
    (
      '44444444-4444-4444-8444-444444444453', 'WebSite Sections',
      '44444444-4444-4444-8444-444444444451',
      '44444444-4444-4444-8444-444444444452',
      'builder:manage', 'builder:manage', '[]'::jsonb, CURRENT_TIMESTAMP
    )
  ON CONFLICT ("id") DO NOTHING
  RETURNING "id"
)
INSERT INTO "audit_logs" ("id", "action", "resource", "resourceId", "meta")
SELECT gen_random_uuid()::text, 'create', 'builderView', "id",
       '{"source":"websiteBuilderDefinitionsMigration"}'::jsonb
FROM created;

COMMIT;
