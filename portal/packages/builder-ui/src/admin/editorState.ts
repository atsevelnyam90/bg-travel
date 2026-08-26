export const BUILDER_EDITOR_NONE_VALUE = "__none";

export type BuilderEditorSelectOption = {
  label: string;
  value: string;
};

export type BuilderEditorDbTable<TFieldType extends string = string> = {
  name: string;
  label?: string;
  lookupColumns?: Array<{
    name: string;
    label: string;
  }>;
  columns: Array<{
    name: string;
    label: string;
    fieldType: TFieldType;
    nullable: boolean;
    dataType: string;
    sortable: boolean;
  }>;
};

type BuilderEditorSource =
  | { type: "dbTable"; tableName: string }
  | { type: "apiEndpoint"; basePath: string }
  | null;

type BuilderEditorTrigger<TEvent extends string> = {
  event: TEvent;
  action: string;
  enabled: boolean;
  blocking: boolean;
  config: Record<string, unknown>;
};

type BuilderEditorField<TFieldType extends string> = {
  key: string;
  label: string;
  type: TFieldType;
  required: boolean;
  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  options?: BuilderEditorSelectOption[];
  optionsSource?:
    | {
        type: "dbTable";
        tableName: string;
        valueField: string;
        labelField: string;
        searchFields?: string[];
        filterBy?: {
          field: string;
          valueFromField: string;
        };
      }
    | undefined;
  triggers?: BuilderEditorFieldTrigger[];
};

type BuilderEditorColumn = {
  key: string;
  label: string;
  sortable: boolean;
  align: "left" | "right";
};

export type BuilderFormEditorEntity<
  TFieldType extends string = string,
  TTriggerEvent extends string = string,
> = {
  title: string;
  description: string | null;
  version: number;
  source: BuilderEditorSource;
  schema: { fields: BuilderEditorField<TFieldType>[] };
  triggers: BuilderEditorTrigger<TTriggerEvent>[];
};

export type BuilderListEditorEntity<TTriggerEvent extends string = string> = {
  title: string;
  description: string | null;
  version: number;
  source: BuilderEditorSource;
  schema: { columns: BuilderEditorColumn[] };
  triggers: BuilderEditorTrigger<TTriggerEvent>[];
};

export type BuilderFormEditorFieldValues<TFieldType extends string = string> = {
  key: string;
  label: string;
  type: TFieldType;
  required: boolean;
  hidden: boolean;
  disabled: boolean;
  placeholder?: string;
  optionsText?: string;
  optionsMode: "static" | "table";
  optionsTable: string;
  optionsValueField: string;
  optionsLabelField: string;
  optionsSearchFieldsText?: string;
  optionsDependsOn?: string;
  optionsFilterField?: string;
  triggers: BuilderEditorFieldTriggerValues[];
};

export type BuilderEditorTriggerValues<TEvent extends string = string> = {
  event: TEvent;
  route: string;
  enabled: boolean;
  blocking: boolean;
};

export type BuilderEditorFieldTrigger = {
  event: string;
  action: string;
  enabled: boolean;
  debounceMs: number;
  config: Record<string, unknown>;
};

export type BuilderEditorFieldTriggerValues = {
  event: string;
  action: string;
  enabled: boolean;
  debounceMs: number;
};

export type BuilderFormEditorValues<
  TFieldType extends string = string,
  TTriggerEvent extends string = string,
> = {
  title: string;
  description?: string;
  sourceType: "none" | "dbTable" | "apiEndpoint";
  sourceTable: string;
  apiBasePath?: string;
  fields: BuilderFormEditorFieldValues<TFieldType>[];
  triggers: BuilderEditorTriggerValues<TTriggerEvent>[];
  version: number;
};

export type BuilderListEditorColumnValues = {
  key: string;
  label: string;
  sortable: boolean;
  align: "left" | "right";
};

export type BuilderListEditorValues<TTriggerEvent extends string = string> = {
  title: string;
  description?: string;
  sourceType: "none" | "dbTable" | "apiEndpoint";
  sourceTable: string;
  apiBasePath?: string;
  columns: BuilderListEditorColumnValues[];
  triggers: BuilderEditorTriggerValues<TTriggerEvent>[];
  version: number;
};

export type BuilderViewEditorEntity<TTrigger = unknown> = {
  title: string;
  description: string | null;
  formId: string | null;
  listId: string | null;
  permissionRead?: string | null;
  permissionWrite?: string | null;
  triggers: TTrigger[];
  version: number;
};

export type BuilderViewEditorValues = {
  title: string;
  description?: string;
  formId: string;
  listId: string;
  permissionRead: string;
  permissionWrite: string;
  triggersText?: string;
  version: number;
};

export function builderEditorOptionsToText(options?: BuilderEditorSelectOption[]) {
  return (options ?? []).map((option) => `${option.label}:${option.value}`).join("\n");
}

export function builderEditorTextToOptions(
  value?: string,
): BuilderEditorSelectOption[] | undefined {
  const rows = (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (rows.length === 0) return undefined;
  return rows.map((line) => {
    const [label, ...rest] = line.split(":");
    return { label: label.trim(), value: rest.join(":").trim() || label.trim() };
  });
}

export function builderEditorSearchFieldsToText(fields?: string[]) {
  return (fields ?? []).join("\n");
}

export function builderEditorTextToSearchFields(value?: string): string[] | undefined {
  const fields = (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return fields.length > 0 ? fields : undefined;
}

export function getBuilderEditorTriggerRoute(config: Record<string, unknown>) {
  const route = config.route ?? config.path ?? config.url;
  return typeof route === "string" ? route : "";
}

function valuesFromTriggers<TEvent extends string>(
  triggers: BuilderEditorTrigger<TEvent>[],
): BuilderEditorTriggerValues<TEvent>[] {
  return triggers
    .filter((trigger) => trigger.action === "callApi" || trigger.action === "webhook")
    .map((trigger) => ({
      event: trigger.event,
      route: getBuilderEditorTriggerRoute(trigger.config),
      enabled: trigger.enabled,
      blocking: trigger.blocking,
    }))
    .filter((trigger) => trigger.route);
}

function valuesFromFieldTriggers(
  triggers?: BuilderEditorFieldTrigger[],
): BuilderEditorFieldTriggerValues[] {
  return (triggers ?? []).map((trigger) => ({
    event: trigger.event,
    action: trigger.action,
    enabled: trigger.enabled,
    debounceMs: trigger.debounceMs,
  }));
}

export function builderFormEditorValuesFromEntity<
  TFieldType extends string,
  TTriggerEvent extends string,
>(
  form: BuilderFormEditorEntity<TFieldType, TTriggerEvent> | null,
  emptyValues: BuilderFormEditorValues<TFieldType, TTriggerEvent>,
): BuilderFormEditorValues<TFieldType, TTriggerEvent> {
  if (!form) return emptyValues;
  const source = form.source;
  return {
    title: form.title,
    description: form.description ?? "",
    sourceType: source?.type ?? "none",
    sourceTable: source?.type === "dbTable" ? source.tableName : BUILDER_EDITOR_NONE_VALUE,
    apiBasePath: source?.type === "apiEndpoint" ? source.basePath : "",
    fields: form.schema.fields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
      hidden: field.hidden ?? false,
      disabled: field.disabled ?? false,
      placeholder: field.placeholder ?? "",
      optionsText: builderEditorOptionsToText(field.options),
      optionsMode: field.optionsSource?.type === "dbTable" ? "table" : "static",
      optionsTable:
        field.optionsSource?.type === "dbTable"
          ? field.optionsSource.tableName
          : BUILDER_EDITOR_NONE_VALUE,
      optionsValueField:
        field.optionsSource?.type === "dbTable"
          ? field.optionsSource.valueField
          : BUILDER_EDITOR_NONE_VALUE,
      optionsLabelField:
        field.optionsSource?.type === "dbTable"
          ? field.optionsSource.labelField
          : BUILDER_EDITOR_NONE_VALUE,
      optionsSearchFieldsText:
        field.optionsSource?.type === "dbTable"
          ? builderEditorSearchFieldsToText(field.optionsSource.searchFields)
          : "",
      optionsDependsOn:
        field.optionsSource?.type === "dbTable"
          ? (field.optionsSource.filterBy?.valueFromField ?? "")
          : "",
      optionsFilterField:
        field.optionsSource?.type === "dbTable" ? (field.optionsSource.filterBy?.field ?? "") : "",
      triggers: valuesFromFieldTriggers(field.triggers),
    })),
    triggers: valuesFromTriggers(form.triggers),
    version: form.version,
  };
}

export function builderListEditorValuesFromEntity<TTriggerEvent extends string>(
  list: BuilderListEditorEntity<TTriggerEvent> | null,
  emptyValues: BuilderListEditorValues<TTriggerEvent>,
): BuilderListEditorValues<TTriggerEvent> {
  if (!list) return emptyValues;
  const source = list.source;
  return {
    title: list.title,
    description: list.description ?? "",
    sourceType: source?.type ?? "none",
    sourceTable: source?.type === "dbTable" ? source.tableName : BUILDER_EDITOR_NONE_VALUE,
    apiBasePath: source?.type === "apiEndpoint" ? source.basePath : "",
    columns: list.schema.columns.map((column) => ({
      key: column.key,
      label: column.label,
      sortable: column.sortable,
      align: column.align,
    })),
    triggers: valuesFromTriggers(list.triggers),
    version: list.version,
  };
}

export function builderViewEditorValuesFromEntity<TTrigger>(
  view: BuilderViewEditorEntity<TTrigger> | null,
  emptyValues: BuilderViewEditorValues,
  defaultPermission: string,
): BuilderViewEditorValues {
  if (!view) return emptyValues;
  return {
    title: view.title,
    description: view.description ?? "",
    formId: view.formId ?? BUILDER_EDITOR_NONE_VALUE,
    listId: view.listId ?? BUILDER_EDITOR_NONE_VALUE,
    permissionRead: view.permissionRead ?? defaultPermission,
    permissionWrite: view.permissionWrite ?? defaultPermission,
    triggersText: JSON.stringify(view.triggers ?? [], null, 2),
    version: view.version,
  };
}

export function builderFormEditorFieldsFromTable<TFieldType extends string>(
  table: BuilderEditorDbTable<TFieldType>,
): BuilderFormEditorFieldValues<TFieldType>[] {
  return table.columns.map((column) => ({
    key: column.name,
    label: column.label,
    type: column.fieldType,
    required: !column.nullable,
    hidden: false,
    disabled: false,
    placeholder: "",
    optionsText: "",
    optionsMode: "static",
    optionsTable: BUILDER_EDITOR_NONE_VALUE,
    optionsValueField: BUILDER_EDITOR_NONE_VALUE,
    optionsLabelField: BUILDER_EDITOR_NONE_VALUE,
    optionsSearchFieldsText: "",
    optionsDependsOn: "",
    optionsFilterField: "",
    triggers: [],
  }));
}

export function builderListEditorColumnsFromTable<TFieldType extends string>(
  table: BuilderEditorDbTable<TFieldType>,
): BuilderListEditorColumnValues[] {
  return table.columns.map((column) => ({
    key: column.name,
    label: column.label,
    sortable: column.sortable,
    align: column.fieldType === "number" || column.fieldType === "money" ? "right" : "left",
  }));
}

export function builderFormEditorInputFromValues<
  TFieldType extends string,
  TTriggerEvent extends string,
>(values: BuilderFormEditorValues<TFieldType, TTriggerEvent>) {
  const source =
    values.sourceType === "dbTable" && values.sourceTable !== BUILDER_EDITOR_NONE_VALUE
      ? { type: "dbTable" as const, tableName: values.sourceTable }
      : values.sourceType === "apiEndpoint" && values.apiBasePath
        ? { type: "apiEndpoint" as const, basePath: values.apiBasePath }
        : null;

  return {
    title: values.title,
    description: values.description || null,
    source,
    schema: {
      fields: values.fields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        hidden: field.hidden,
        disabled: field.disabled,
        placeholder: field.placeholder || undefined,
        options:
          field.type === "select" && field.optionsMode === "static"
            ? builderEditorTextToOptions(field.optionsText)
            : undefined,
        optionsSource:
          field.type === "select" &&
          field.optionsMode === "table" &&
          field.optionsTable !== BUILDER_EDITOR_NONE_VALUE &&
          field.optionsValueField !== BUILDER_EDITOR_NONE_VALUE &&
          field.optionsLabelField !== BUILDER_EDITOR_NONE_VALUE
            ? {
                type: "dbTable" as const,
                tableName: field.optionsTable,
                valueField: field.optionsValueField,
                labelField: field.optionsLabelField,
                searchFields: builderEditorTextToSearchFields(field.optionsSearchFieldsText),
                filterBy:
                  field.optionsDependsOn && field.optionsFilterField
                    ? {
                        field: field.optionsFilterField,
                        valueFromField: field.optionsDependsOn,
                      }
                    : undefined,
              }
            : undefined,
        triggers: field.triggers.map((trigger) => ({
          event: trigger.event,
          action: trigger.action,
          enabled: trigger.enabled,
          debounceMs: trigger.debounceMs,
          config: {},
        })),
      })),
    },
    triggers: values.triggers.map((trigger) => ({
      event: trigger.event,
      action: "callApi" as const,
      enabled: trigger.enabled,
      blocking: trigger.blocking,
      config: { route: trigger.route },
    })),
    version: values.version,
  };
}

export function builderListEditorInputFromValues<TTriggerEvent extends string>(
  values: BuilderListEditorValues<TTriggerEvent>,
) {
  const source =
    values.sourceType === "dbTable" && values.sourceTable !== BUILDER_EDITOR_NONE_VALUE
      ? { type: "dbTable" as const, tableName: values.sourceTable }
      : values.sourceType === "apiEndpoint" && values.apiBasePath
        ? { type: "apiEndpoint" as const, basePath: values.apiBasePath }
        : null;

  return {
    title: values.title,
    description: values.description || null,
    source,
    schema: { columns: values.columns },
    triggers: values.triggers.map((trigger) => ({
      event: trigger.event,
      action: "callApi" as const,
      enabled: trigger.enabled,
      blocking: trigger.blocking,
      config: { route: trigger.route },
    })),
    version: values.version,
  };
}

export function builderViewEditorInputFromValues<TTrigger>(
  values: BuilderViewEditorValues,
  parseTriggers: (value: string) => TTrigger[],
) {
  return {
    title: values.title,
    description: values.description || null,
    formId: values.formId === BUILDER_EDITOR_NONE_VALUE ? null : values.formId,
    listId: values.listId === BUILDER_EDITOR_NONE_VALUE ? null : values.listId,
    permissionRead: values.permissionRead,
    permissionWrite: values.permissionWrite,
    triggers: values.triggersText?.trim() ? parseTriggers(values.triggersText) : [],
    version: values.version,
  };
}
