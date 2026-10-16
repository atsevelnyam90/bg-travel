import { badRequest } from "@/lib/errors";

export function optionalText(values: Record<string, unknown>, key: string) {
  const value = values[key];
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function requiredText(values: Record<string, unknown>, key: string, label: string) {
  const value = optionalText(values, key);
  if (!value) throw badRequest(`${label} талбар заавал бөглөгдөнө`);
  return value;
}

export function requiredInteger(values: Record<string, unknown>, key: string, label: string) {
  const value = values[key];
  if (value === null || value === undefined || value === "") {
    throw badRequest(`${label} талбар заавал бөглөгдөнө`);
  }
  const number = Number(value);
  if (!Number.isInteger(number)) throw badRequest(`${label} талбар бүхэл тоо байх ёстой`);
  return number;
}

export function optionalInteger(
  values: Record<string, unknown>,
  key: string,
  label: string,
  fallback = 0,
) {
  const value = values[key];
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  if (!Number.isInteger(number)) throw badRequest(`${label} талбар бүхэл тоо байх ёстой`);
  return number;
}

export function optionalEnum<const T extends readonly string[]>(
  values: Record<string, unknown>,
  key: string,
  allowed: T,
  fallback: T[number],
): T[number] {
  const value = values[key];
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = String(value);
  if (!(allowed as readonly string[]).includes(normalized)) {
    throw badRequest(`${key} талбарын утга буруу байна`);
  }
  return normalized as T[number];
}
