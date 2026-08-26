"use client";

import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldError } from "./useFieldError";

export type SelectOption = { value: string; label: string };

type SelectFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  disabled?: boolean;
};

// Radix Select нь жинхэнэ <input> биш тул register биш Controller ашиглана.
export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = "Сонгоно уу",
  description,
  disabled,
}: SelectFieldProps<T>) {
  const { control } = useFormContext<T>();
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
            <SelectTrigger id={name} aria-invalid={invalid} aria-describedby={describedBy}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {description && !message ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? <FieldError id={errorId}>{message}</FieldError> : null}
    </Field>
  );
}
