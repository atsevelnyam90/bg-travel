"use client";

import type { ComponentProps } from "react";
import { type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldError } from "./useFieldError";

type TextFieldProps<T extends FieldValues> = Omit<ComponentProps<typeof Input>, "name"> & {
  name: Path<T>;
  label: string;
  description?: string;
};

/**
 * RHF + shadcn Field-ийн нимгэн холбоос. Дэлгэц бүр label/error/aria-г
 * дахин зохиохгүй байх нь зорилго — winu-д энэ давтагдсан байсан.
 */
export function TextField<T extends FieldValues>({
  name,
  label,
  description,
  onBlur,
  ...props
}: TextFieldProps<T>) {
  const { register } = useFormContext<T>();
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);
  const registration = register(name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        {...registration}
        {...props}
        onBlur={(event) => {
          registration.onBlur(event);
          onBlur?.(event);
        }}
      />
      {description && !message ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? <FieldError id={errorId}>{message}</FieldError> : null}
    </Field>
  );
}
