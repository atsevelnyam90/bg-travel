"use client";

import type { Path } from "react-hook-form";
import { MultiFileField, NumberField, SelectField, TextField } from "@/components/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TravelFormValues } from "../travelFormValues";
import { TravelRichTextField } from "./TravelRichTextField";

const path = (index: number, field: string) =>
  `details.${index}.${field}` as Path<TravelFormValues>;
const locales = [
  { key: "mn", label: "Монгол", title: "title", content: "content" },
  { key: "en", label: "English", title: "titleEn", content: "contentEn" },
  { key: "zh", label: "中文", title: "titleZh", content: "contentZh" },
  { key: "ko", label: "한국어", title: "titleKo", content: "contentKo" },
] as const;

export function DetailFields({
  index,
  sectionOptions,
}: {
  index: number;
  sectionOptions: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <SelectField<TravelFormValues>
            name={path(index, "sectionId")}
            label="Хөтөлбөрийн бүлэг"
            options={sectionOptions}
            clearable
          />
        </div>
        <NumberField<TravelFormValues> name={path(index, "dayNumber")} label="Өдөр" min={1} />
      </div>
      <MultiFileField<TravelFormValues>
        name={path(index, "images")}
        label="Зургууд"
        scope="travel"
      />
      <Tabs defaultValue="mn">
        <TabsList variant="line" className="max-w-full justify-start overflow-x-auto">
          {locales.map((locale) => (
            <TabsTrigger key={locale.key} value={locale.key}>
              {locale.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {locales.map((locale) => (
          <TabsContent key={locale.key} value={locale.key} className="space-y-4 pt-4">
            <TextField<TravelFormValues>
              name={path(index, locale.title)}
              label={locale.key === "mn" ? "Гарчиг" : "Day title"}
            />
            <TravelRichTextField
              name={path(index, locale.content)}
              label={locale.key === "mn" ? "Тайлбар" : "Day description"}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
