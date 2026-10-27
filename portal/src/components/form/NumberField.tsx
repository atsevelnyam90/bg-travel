"use client";

import type { ComponentProps } from "react";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldError } from "./useFieldError";

type NumberFieldProps<T extends FieldValues> = Omit<
  ComponentProps<typeof Input>,
  "name" | "value" | "onChange"
> & {
  name: Path<T>;
  label: string;
  description?: string;
};

export function NumberField<T extends FieldValues>({
  name,
  label,
  description,
  ...props
}: NumberFieldProps<T>) {
  const { control } = useFormContext<T>();
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={name}
            type="number"
            inputMode="numeric"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...props}
            value={field.value == null ? "" : String(field.value)}
            onChange={(event) => {
              const value = event.target.value;
              field.onChange(value === "" ? null : Number(value));
            }}
            onBlur={field.onBlur}
          />
        )}
      />
      {description && !message ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? <FieldError id={errorId}>{message}</FieldError> : null}
    </Field>
  );
}
