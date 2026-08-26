export type BuilderRuntimeFieldLike = {
  key: string;
  type: string;
};

export type BuilderRuntimeFormSchemaLike = {
  fields: readonly BuilderRuntimeFieldLike[];
};

export type BuilderRuntimeViewLike = {
  form?: {
    schema: BuilderRuntimeFormSchemaLike;
  } | null;
};

export type BuilderRuntimeEntryLike = {
  id: string;
  values: Record<string, unknown>;
  version: number;
};

export type BuilderRuntimeFormValues = {
  values: Record<string, unknown>;
};

export type BuilderRuntimeEntryValues = BuilderRuntimeFormValues & {
  version: number;
};

function emptyFieldValue(field: BuilderRuntimeFieldLike) {
  return field.type === "checkbox" ? false : "";
}

export function createBuilderFormDefaultValues(
  schema?: BuilderRuntimeFormSchemaLike,
): BuilderRuntimeFormValues {
  const values: Record<string, unknown> = {};
  for (const field of schema?.fields ?? []) {
    values[field.key] = emptyFieldValue(field);
  }
  return { values };
}

export function createBuilderEntryDefaultValues(
  view: BuilderRuntimeViewLike,
  editing: BuilderRuntimeEntryLike | null,
): BuilderRuntimeEntryValues {
  const values: Record<string, unknown> = {};
  for (const field of view.form?.schema.fields ?? []) {
    const existing = editing?.values[field.key];
    values[field.key] = existing === undefined ? emptyFieldValue(field) : existing;
  }
  return { values, version: editing?.version ?? 0 };
}

export function formatBuilderRuntimeValue(value: unknown, locale = "mn-MN") {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Тийм" : "Үгүй";
  if (typeof value === "number") return new Intl.NumberFormat(locale).format(value);
  return String(value);
}
