"use client";

import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useFieldError } from "./useFieldError";

type CheckboxFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function CheckboxField<T extends FieldValues>({
  name,
  label,
  description,
  disabled,
}: CheckboxFieldProps<T>) {
  const { control } = useFormContext<T>();
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);

  return (
    <Field orientation="horizontal" data-invalid={invalid}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Checkbox
            id={name}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        )}
      />
      <div className="grid gap-1">
        <Label htmlFor={name}>{label}</Label>
        {description && !message ? <FieldDescription>{description}</FieldDescription> : null}
        {message ? <FieldError id={errorId}>{message}</FieldError> : null}
      </div>
    </Field>
  );
}
