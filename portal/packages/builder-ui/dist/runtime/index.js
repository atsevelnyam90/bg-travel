// src/runtime/runtimeUtils.ts
function emptyFieldValue(field) {
  return field.type === "checkbox" ? false : "";
}
function createBuilderFormDefaultValues(schema) {
  const values = {};
  for (const field of schema?.fields ?? []) {
    values[field.key] = emptyFieldValue(field);
  }
  return { values };
}
function createBuilderEntryDefaultValues(view, editing) {
  const values = {};
  for (const field of view.form?.schema.fields ?? []) {
    const existing = editing?.values[field.key];
    values[field.key] = existing === void 0 ? emptyFieldValue(field) : existing;
  }
  return { values, version: editing?.version ?? 0 };
}
function formatBuilderRuntimeValue(value, locale = "mn-MN") {
  if (value === null || value === void 0 || value === "") return "\u2014";
  if (typeof value === "boolean") return value ? "\u0422\u0438\u0439\u043C" : "\u04AE\u0433\u04AF\u0439";
  if (typeof value === "number") return new Intl.NumberFormat(locale).format(value);
  return String(value);
}
export {
  createBuilderEntryDefaultValues,
  createBuilderFormDefaultValues,
  formatBuilderRuntimeValue
};
//# sourceMappingURL=index.js.map