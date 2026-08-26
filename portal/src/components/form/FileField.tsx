"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import type { files } from "@/api/generated/contracts";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { ApiError } from "@/lib/api/apiClient";
import { uploadFile } from "@/lib/api/upload";
import { useFieldError } from "./useFieldError";

type FileFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  scope: files.PresignUploadInput["scope"];
  description?: string;
  accept?: string;
};

/** Утга нь байршуулсан файлын нийтийн ХАЯГ (URL). */
export function FileField<T extends FieldValues>({
  name,
  label,
  scope,
  description,
  accept = "image/*",
}: FileFieldProps<T>) {
  const { control } = useFormContext<T>();
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);
  const [isUploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="space-y-2">
            <input
              ref={inputRef}
              id={name}
              type="file"
              accept={accept}
              className="sr-only"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  field.onChange(await uploadFile(file, scope));
                } catch (error) {
                  toast.error(
                    error instanceof ApiError ? error.message : "Файл байршуулахад алдаа гарлаа",
                  );
                } finally {
                  setUploading(false);
                  // Ижил файлыг дахин сонгоход onChange асахын тулд цэвэрлэнэ.
                  event.target.value = "";
                }
              }}
            />

            {field.value ? (
              <div className="flex items-center gap-2">
                {/* biome-ignore lint/performance/noImgElement: гадаад S3 хаяг — next/image домэйн тохиргоо шаардана */}
                <img src={field.value} alt="" className="size-16 rounded-md border object-cover" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Хасах"
                  onClick={() => field.onChange(null)}
                >
                  <X />
                </Button>
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
              {isUploading ? "Байршуулж байна…" : field.value ? "Солих" : "Файл сонгох"}
            </Button>
          </div>
        )}
      />
      {description && !message ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? <FieldError id={errorId}>{message}</FieldError> : null}
    </Field>
  );
}
