import type { BuilderTriggerHandler } from "../triggerTypes";

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isBlank(value: unknown) {
  return value === null || value === undefined || value === "";
}

export const validateTriggerHandler: BuilderTriggerHandler = async (trigger, context, deps) => {
  const required = asStringArray(trigger.config.required);
  if (required.length === 0) return;

  for (const key of required) {
    if (isBlank(context.values?.[key])) {
      throw deps.errors.badRequest(`${key} талбар trigger validation дээр заавал бөглөгдөнө`);
    }
  }
};
