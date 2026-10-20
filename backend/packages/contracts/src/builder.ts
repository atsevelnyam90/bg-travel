import { z } from "zod";
import { PERMISSIONS } from "./permissions";
import { paginatedSchema, paginationQuerySchema } from "./shared";

const fieldKeyPattern = /^[a-z][a-zA-Z0-9_]{0,62}$/;

const entityBaseInputSchema = z.object({
  title: z.string().min(1, "Гарчиг оруулна уу").max(160),
  description: z.string().max(500).nullable().optional(),
});

const entityBaseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  version: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const builderDefinitionTypeSchema = z.enum(["form", "list"]);
export type BuilderDefinitionType = z.infer<typeof builderDefinitionTypeSchema>;

export const builderDatasourceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("dbTable"),
    tableName: z.string().min(1).max(128),
  }),
  z.object({
    type: z.literal("apiEndpoint"),
    basePath: z.string().min(1).max(240),
    listPath: z.string().max(240).optional(),
    createPath: z.string().max(240).optional(),
    updatePath: z.string().max(240).optional(),
    deletePath: z.string().max(240).optional(),
  }),
]);
export type BuilderDatasource = z.infer<typeof builderDatasourceSchema>;

export const builderDbColumnSchema = z.object({
  name: z.string(),
  label: z.string(),
  dataType: z.string(),
  nullable: z.boolean(),
  fieldType: z.enum(["text", "number", "money", "checkbox", "date"]),
  sortable: z.boolean(),
});
export type BuilderDbColumn = z.infer<typeof builderDbColumnSchema>;

export const builderDbTableSchema = z.object({
  name: z.string(),
  label: z.string(),
  columns: z.array(builderDbColumnSchema),
  lookupColumns: z.array(builderDbColumnSchema).optional(),
});
export type BuilderDbTable = z.infer<typeof builderDbTableSchema>;

export const builderFieldTypeSchema = z.enum([
  "text",
  "textarea",
  "number",
  "money",
  "select",
  "checkbox",
  "date",
  "file",
]);
export type BuilderFieldType = z.infer<typeof builderFieldTypeSchema>;

export const builderFileStorageSchema = z.enum(["s3", "server"]);
export type BuilderFileStorage = z.infer<typeof builderFileStorageSchema>;

export const builderFileContentKindSchema = z.enum(["image", "file"]);
export type BuilderFileContentKind = z.infer<typeof builderFileContentKindSchema>;

export const builderSelectOptionSchema = z.object({
  label: z.string().min(1).max(120),
  value: z.string().min(1).max(120),
});
export type BuilderSelectOption = z.infer<typeof builderSelectOptionSchema>;

export const builderSelectOptionsSourceSchema = z.object({
  type: z.literal("dbTable"),
  tableName: z.string().min(1).max(128),
  valueField: z.string().regex(fieldKeyPattern),
  labelField: z.string().regex(fieldKeyPattern),
  searchFields: z.array(z.string().regex(fieldKeyPattern)).max(5).optional(),
  filterBy: z
    .object({
      field: z.string().regex(fieldKeyPattern),
      valueFromField: z.string().regex(fieldKeyPattern),
    })
    .optional(),
});
export type BuilderSelectOptionsSource = z.infer<typeof builderSelectOptionsSourceSchema>;

export const builderPresentationSchema = z.enum(["dialog", "drawer"]);
export type BuilderPresentation = z.infer<typeof builderPresentationSchema>;

export const builderFormSubformSchema = z.object({
  key: z.string().regex(fieldKeyPattern),
  label: z.string().min(1).max(120),
  viewId: z.uuid(),
  parentField: z.string().regex(fieldKeyPattern),
  childField: z.string().regex(fieldKeyPattern),
  buttonLabel: z.string().min(1).max(120).optional(),
  icon: z.string().max(80).optional(),
  presentation: builderPresentationSchema.default("dialog"),
});
export type BuilderFormSubform = z.infer<typeof builderFormSubformSchema>;

export const builderFieldTriggerEventSchema = z.enum(["onChange", "onBlur"]);
export type BuilderFieldTriggerEvent = z.infer<typeof builderFieldTriggerEventSchema>;

export const builderFieldTriggerSchema = z.object({
  event: builderFieldTriggerEventSchema,
  action: z.string().min(1).max(240),
  enabled: z.boolean().default(true),
  debounceMs: z.number().int().min(0).max(5000).default(300),
  config: z.record(z.string(), z.unknown()).default({}),
});
export type BuilderFieldTrigger = z.infer<typeof builderFieldTriggerSchema>;

export const builderFieldSchema = z.object({
  key: z.string().regex(fieldKeyPattern, "Жишээ: customerName"),
  label: z.string().min(1).max(120),
  type: builderFieldTypeSchema,
  required: z.boolean().default(false),
  hidden: z.boolean().default(false),
  disabled: z.boolean().default(false),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  storage: builderFileStorageSchema.optional(),
  contentKind: builderFileContentKindSchema.optional(),
  multiple: z.boolean().optional(),
  maxBytes: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024)
    .optional(),
  placeholder: z.string().max(160).optional(),
  description: z.string().max(240).optional(),
  options: z.array(builderSelectOptionSchema).max(50).optional(),
  optionsSource: builderSelectOptionsSourceSchema.optional(),
  triggers: z.array(builderFieldTriggerSchema).max(10).default([]),
});
export type BuilderField = z.infer<typeof builderFieldSchema>;

export const builderFileUploadRequestSchema = z.object({
  contentType: z.string().min(1).max(160),
  contentLength: z.number().int().positive(),
});
export type BuilderFileUploadRequest = z.infer<typeof builderFileUploadRequestSchema>;

export const builderFileUploadResponseSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
});
export type BuilderFileUploadResponse = z.infer<typeof builderFileUploadResponseSchema>;

export const builderFilePresignResponseSchema = builderFileUploadResponseSchema.extend({
  uploadUrl: z.string().url(),
  expiresInSeconds: z.number().int().positive(),
});
export type BuilderFilePresignResponse = z.infer<typeof builderFilePresignResponseSchema>;

export const builderColumnSchema = z.object({
  key: z.string().regex(fieldKeyPattern),
  label: z.string().min(1).max(120),
  sortable: z.boolean().default(false),
  hidden: z.boolean().default(false),
  align: z.enum(["left", "right"]).default("left"),
});
export type BuilderColumn = z.infer<typeof builderColumnSchema>;

export const builderListOrderBySchema = z.object({
  field: z.string().regex(fieldKeyPattern),
  direction: z.enum(["asc", "desc"]),
});
export type BuilderListOrderBy = z.infer<typeof builderListOrderBySchema>;

const builderListOrderByListSchema = z.preprocess(
  (value) => (value && !Array.isArray(value) ? [value] : value),
  z.array(builderListOrderBySchema).max(8),
);

export const builderFormLayoutFieldSchema = z.object({
  key: z.string().regex(fieldKeyPattern),
  span: z.number().int().min(1).max(12).default(12),
});
export type BuilderFormLayoutField = z.infer<typeof builderFormLayoutFieldSchema>;

export const builderFormLayoutGroupSchema = z.object({
  id: z.string().regex(fieldKeyPattern),
  title: z.string().min(1).max(120).optional(),
  columns: z.union([z.literal(6), z.literal(8), z.literal(12)]).default(12),
  fields: z.array(builderFormLayoutFieldSchema).max(64).default([]),
});
export type BuilderFormLayoutGroup = z.infer<typeof builderFormLayoutGroupSchema>;

export const builderFormLayoutSchema = z.object({
  groups: z.array(builderFormLayoutGroupSchema).max(24).default([]),
});
export type BuilderFormLayout = z.infer<typeof builderFormLayoutSchema>;

export const builderFormSchema = z.object({
  presentation: builderPresentationSchema.default("dialog"),
  fields: z.array(builderFieldSchema).min(1).max(64),
  layout: builderFormLayoutSchema.optional(),
  subforms: z.array(builderFormSubformSchema).max(24).default([]),
});
export type BuilderFormSchema = z.infer<typeof builderFormSchema>;

export const builderListSchema = z.object({
  columns: z.array(builderColumnSchema).min(1).max(24),
  orderBy: builderListOrderByListSchema.optional(),
});
export type BuilderListSchema = z.infer<typeof builderListSchema>;

const definitionBaseSchema = entityBaseSchema.extend({
  source: builderDatasourceSchema.nullable(),
});

export const permissionSchema = z.enum(PERMISSIONS).nullable().optional();

export const builderFormTriggerEventSchema = z.enum([
  "beforeCreate",
  "afterCreate",
  "beforeUpdate",
  "afterUpdate",
]);
export type BuilderFormTriggerEvent = z.infer<typeof builderFormTriggerEventSchema>;

export const builderListTriggerEventSchema = z.enum([
  "beforeRead",
  "afterRead",
  "beforeDelete",
  "afterDelete",
]);
export type BuilderListTriggerEvent = z.infer<typeof builderListTriggerEventSchema>;

export const builderTriggerEventSchema = z.union([
  builderFormTriggerEventSchema,
  builderListTriggerEventSchema,
]);
export type BuilderTriggerEvent = z.infer<typeof builderTriggerEventSchema>;

export const builderTriggerSchema = z.object({
  event: builderTriggerEventSchema,
  action: z.enum(["callApi", "webhook", "audit", "notify", "validate"]),
  enabled: z.boolean().default(true),
  blocking: z.boolean().default(true),
  config: z.record(z.string(), z.unknown()).default({}),
});
export type BuilderTrigger = z.infer<typeof builderTriggerSchema>;

export const builderFormTriggerSchema = builderTriggerSchema.extend({
  event: builderFormTriggerEventSchema,
});
export type BuilderFormTrigger = z.infer<typeof builderFormTriggerSchema>;

export const builderListTriggerSchema = builderTriggerSchema.extend({
  event: builderListTriggerEventSchema,
});
export type BuilderListTrigger = z.infer<typeof builderListTriggerSchema>;

export const builderFormRecordSchema = definitionBaseSchema.extend({
  type: z.literal("form"),
  schema: builderFormSchema,
  triggers: z.array(builderFormTriggerSchema).default([]),
});
export type BuilderForm = z.infer<typeof builderFormRecordSchema>;

export const builderListRecordSchema = definitionBaseSchema.extend({
  type: z.literal("list"),
  schema: builderListSchema,
  triggers: z.array(builderListTriggerSchema).default([]),
});
export type BuilderList = z.infer<typeof builderListRecordSchema>;

export const builderDefinitionSchema = z.discriminatedUnion("type", [
  builderFormRecordSchema,
  builderListRecordSchema,
]);
export type BuilderDefinition = z.infer<typeof builderDefinitionSchema>;

export const builderViewSchema = entityBaseSchema.extend({
  formId: z.uuid().nullable(),
  listId: z.uuid().nullable(),
  form: builderFormRecordSchema.nullable().optional(),
  list: builderListRecordSchema.nullable().optional(),
  permissionRead: permissionSchema,
  permissionWrite: permissionSchema,
  triggers: z.array(builderTriggerSchema).default([]),
});
export type BuilderView = z.infer<typeof builderViewSchema>;

export const listBuilderFormsQuerySchema = paginationQuerySchema;
export type ListBuilderFormsQuery = z.infer<typeof listBuilderFormsQuerySchema>;
export const listBuilderFormsResponseSchema = paginatedSchema(builderFormRecordSchema);
export type ListBuilderFormsResponse = z.infer<typeof listBuilderFormsResponseSchema>;

export const createBuilderFormSchema = entityBaseInputSchema.extend({
  source: builderDatasourceSchema.nullable().optional(),
  schema: builderFormSchema,
  triggers: z.array(builderFormTriggerSchema).max(20).optional(),
});
export type CreateBuilderFormInput = z.infer<typeof createBuilderFormSchema>;
export const updateBuilderFormSchema = createBuilderFormSchema.extend({
  version: z.number().int(),
});
export type UpdateBuilderFormInput = z.infer<typeof updateBuilderFormSchema>;

export const listBuilderListsQuerySchema = paginationQuerySchema;
export type ListBuilderListsQuery = z.infer<typeof listBuilderListsQuerySchema>;
export const listBuilderListsResponseSchema = paginatedSchema(builderListRecordSchema);
export type ListBuilderListsResponse = z.infer<typeof listBuilderListsResponseSchema>;

export const createBuilderListSchema = entityBaseInputSchema.extend({
  source: builderDatasourceSchema.nullable().optional(),
  schema: builderListSchema,
  triggers: z.array(builderListTriggerSchema).max(20).optional(),
});
export type CreateBuilderListInput = z.infer<typeof createBuilderListSchema>;
export const updateBuilderListSchema = createBuilderListSchema.extend({
  version: z.number().int(),
});
export type UpdateBuilderListInput = z.infer<typeof updateBuilderListSchema>;

export const listBuilderViewsQuerySchema = paginationQuerySchema;
export type ListBuilderViewsQuery = z.infer<typeof listBuilderViewsQuerySchema>;
export const listBuilderViewsResponseSchema = paginatedSchema(builderViewSchema);
export type ListBuilderViewsResponse = z.infer<typeof listBuilderViewsResponseSchema>;

export const createBuilderViewSchema = entityBaseInputSchema.extend({
  formId: z.uuid().nullable().optional(),
  listId: z.uuid().nullable().optional(),
  permissionRead: permissionSchema,
  permissionWrite: permissionSchema,
  triggers: z.array(builderTriggerSchema).max(20).optional(),
});
export type CreateBuilderViewInput = z.infer<typeof createBuilderViewSchema>;
export const updateBuilderViewSchema = createBuilderViewSchema.extend({
  version: z.number().int(),
});
export type UpdateBuilderViewInput = z.infer<typeof updateBuilderViewSchema>;

export const replicateBuilderEntitySchema = z.object({
  title: z.string().min(1).max(160).optional(),
});
export type ReplicateBuilderEntityInput = z.infer<typeof replicateBuilderEntitySchema>;

export const builderViewEntrySchema = z.object({
  id: z.uuid(),
  viewId: z.uuid(),
  values: z.record(z.string(), z.unknown()),
  version: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type BuilderViewEntry = z.infer<typeof builderViewEntrySchema>;

export const listBuilderFieldOptionsQuerySchema = z
  .object({
    search: z.string().max(80).optional(),
  })
  .passthrough();
export type ListBuilderFieldOptionsQuery = z.infer<typeof listBuilderFieldOptionsQuerySchema> & {
  depends?: Record<string, string>;
};
export const listBuilderFieldOptionsResponseSchema = z.array(builderSelectOptionSchema);
export type ListBuilderFieldOptionsResponse = z.infer<typeof listBuilderFieldOptionsResponseSchema>;

export const runBuilderFieldTriggerSchema = z.object({
  value: z.unknown().optional(),
  values: z.record(z.string(), z.unknown()).default({}),
});
export type RunBuilderFieldTriggerInput = z.infer<typeof runBuilderFieldTriggerSchema>;

export const builderFieldTriggerToastSchema = z.object({
  type: z.enum(["success", "error", "info", "warning"]).default("info"),
  message: z.string().min(1).max(500),
});
export type BuilderFieldTriggerToast = z.infer<typeof builderFieldTriggerToastSchema>;

export const builderFieldTriggerPatchSchema = z.object({
  field: z.string().regex(fieldKeyPattern),
  value: z.unknown(),
});
export type BuilderFieldTriggerPatch = z.infer<typeof builderFieldTriggerPatchSchema>;

export const builderFieldTriggerResponseSchema = z.object({
  schema: z.array(builderFieldTriggerPatchSchema).default([]),
  valuesPatch: z.record(z.string(), z.unknown()).default({}),
  fieldErrors: z.record(z.string(), z.string()).default({}),
  toast: builderFieldTriggerToastSchema.nullable().optional(),
});
export type BuilderFieldTriggerResponse = z.infer<typeof builderFieldTriggerResponseSchema>;

export const listBuilderViewEntriesQuerySchema = paginationQuerySchema.extend({
  filterField: z.string().regex(fieldKeyPattern).optional(),
  filterValue: z.string().max(240).optional(),
});
export type ListBuilderViewEntriesQuery = z.infer<typeof listBuilderViewEntriesQuerySchema>;
export const listBuilderViewEntriesResponseSchema = paginatedSchema(builderViewEntrySchema);
export type ListBuilderViewEntriesResponse = z.infer<typeof listBuilderViewEntriesResponseSchema>;

export const createBuilderViewEntrySchema = z.object({
  id: z.uuid().optional(),
  values: z.record(z.string(), z.unknown()),
});
export type CreateBuilderViewEntryInput = z.infer<typeof createBuilderViewEntrySchema>;

export const builderCompositeDataRowSchema = z.record(z.string(), z.unknown());
export type BuilderCompositeDataRow = z.infer<typeof builderCompositeDataRowSchema>;
export const builderCompositeDataSchema = z.record(
  z.string(),
  z.union([builderCompositeDataRowSchema, z.array(builderCompositeDataRowSchema)]),
);
export type BuilderCompositeData = z.infer<typeof builderCompositeDataSchema>;
export const createCompositeBuilderViewEntrySchema = z.object({
  data: builderCompositeDataSchema,
});
export type CreateCompositeBuilderViewEntryInput = z.infer<
  typeof createCompositeBuilderViewEntrySchema
>;
export const updateCompositeBuilderViewEntrySchema = createCompositeBuilderViewEntrySchema;
export type UpdateCompositeBuilderViewEntryInput = z.infer<
  typeof updateCompositeBuilderViewEntrySchema
>;

export const updateBuilderViewEntrySchema = createBuilderViewEntrySchema.extend({
  version: z.number().int(),
});
export type UpdateBuilderViewEntryInput = z.infer<typeof updateBuilderViewEntrySchema>;
