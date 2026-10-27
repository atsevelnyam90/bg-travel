"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import type { files } from "@/api/generated/contracts";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { uploadFile } from "@/lib/api/upload";
import { useFieldError } from "./useFieldError";

type MultiFileFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  scope: files.PresignUploadInput["scope"];
  description?: string;
};

export function MultiFileField<T extends FieldValues>({
  name,
  label,
  scope,
  description,
}: MultiFileFieldProps<T>) {
  const { control } = useFormContext<T>();
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const rawValue: unknown = field.value;
          const urls: string[] = Array.isArray(rawValue)
            ? rawValue.filter((value: unknown): value is string => typeof value === "string")
            : [];
          return (
            <div className="space-y-3">
              <input
                ref={inputRef}
                id={name}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (files.length === 0) return;
                  setUploading(true);
                  try {
                    const uploaded = [];
                    for (const file of files) uploaded.push(await uploadFile(file, scope));
                    field.onChange([...urls, ...uploaded]);
                  } catch (error) {
                    toast.error(apiErrorMessage(error, "Зургуудыг байршуулж чадсангүй"));
                  } finally {
                    setUploading(false);
                    event.target.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-3">
                {urls.map((url) => (
                  <div key={url} className="relative">
                    {/* biome-ignore lint/performance/noImgElement: гадаад object storage URL. */}
                    <img src={url} alt="" className="size-28 rounded-md border object-cover" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="absolute -top-2 -right-2 rounded-full"
                      aria-label="Зураг хасах"
                      onClick={() => field.onChange(urls.filter((item) => item !== url))}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {uploading ? "Байршуулж байна…" : "Зураг нэмэх"}
              </Button>
            </div>
          );
        }}
      />
      {description && !message ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? <FieldError id={errorId}>{message}</FieldError> : null}
    </Field>
  );
}
