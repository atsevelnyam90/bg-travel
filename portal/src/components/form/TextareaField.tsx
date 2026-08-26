"use client";

import type { ComponentProps } from "react";
import { type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useFieldError } from "./useFieldError";

type TextareaFieldProps<T extends FieldValues> = Omit<ComponentProps<typeof Textarea>, "name"> & {
  name: Path<T>;
  label: string;
  description?: string;
};

export function TextareaField<T extends FieldValues>({
  name,
  label,
  description,
  onBlur,
  ...props
}: TextareaFieldProps<T>) {
  const { register } = useFormContext<T>();
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);
  const registration = register(name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea
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
