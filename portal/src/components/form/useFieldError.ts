"use client";

import { type FieldValues, type Path, useFormContext } from "react-hook-form";

/** Талбар бүрт давтагддаг алдаа+id логикийг нэг газар. */
export function useFieldError<T extends FieldValues>(name: Path<T>) {
  const {
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const message = typeof error?.message === "string" ? error.message : undefined;

  return {
    message,
    errorId: `${name}-error`,
    invalid: message ? (true as const) : undefined,
    describedBy: message ? `${name}-error` : undefined,
  };
}
