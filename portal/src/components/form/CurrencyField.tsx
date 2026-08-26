"use client";

import type { FocusEventHandler } from "react";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldError } from "./useFieldError";

type CurrencyFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Валютын тэмдэг. Default ₮. */
  symbol?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
};

const format = (value: number | null) =>
  value === null || Number.isNaN(value) ? "" : new Intl.NumberFormat("mn-MN").format(value);

// Хэрэглэгч "1 200 000" гэж хардаг, форм 1200000 гэсэн ТОО хадгална.
// Дэлгэц бүр өөрөө форматлахаас сэргийлнэ.
const parse = (raw: string): number | null => {
  const digits = raw.replace(/[^\d]/g, "");
  return digits === "" ? null : Number(digits);
};

export function CurrencyField<T extends FieldValues>({
  name,
  label,
  description,
  disabled,
  symbol = "₮",
  onBlur,
}: CurrencyFieldProps<T>) {
  const { control } = useFormContext<T>();
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="relative">
            <Input
              id={name}
              // inputMode=numeric — mobile дээр тоон гар нээгдэнэ.
              inputMode="numeric"
              autoComplete="off"
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              value={format(field.value ?? null)}
              onChange={(event) => field.onChange(parse(event.target.value))}
              onBlur={(event) => {
                field.onBlur();
                onBlur?.(event);
              }}
              className="pr-8 text-right tabular-nums"
            />
            <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm">
              {symbol}
            </span>
          </div>
        )}
      />
      {description && !message ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? <FieldError id={errorId}>{message}</FieldError> : null}
    </Field>
  );
}
