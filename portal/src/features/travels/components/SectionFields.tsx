"use client";

import type { Path } from "react-hook-form";
import { FileField, MultiFileField, NumberField, TextField } from "@/components/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TravelFormValues } from "../travelFormValues";
import { TravelRichTextField } from "./TravelRichTextField";

const path = (index: number, field: string) =>
  `sections.${index}.${field}` as Path<TravelFormValues>;

const locales = [
  { key: "mn", label: "Монгол", title: "title", description: "description" },
  { key: "en", label: "English", title: "titleEn", description: "descriptionEn" },
  { key: "zh", label: "中文", title: "titleZh", description: "descriptionZh" },
  { key: "ko", label: "한국어", title: "titleKo", description: "descriptionKo" },
] as const;

export function SectionFields({ index }: { index: number }) {
  return (
    <div className="space-y-5">
      <NumberField<TravelFormValues> name={path(index, "sortOrder")} label="Дараалал" />
      <FileField<TravelFormValues>
        name={path(index, "mapImage")}
        label="Маршрутын map зураг · 2:3 босоо"
        scope="travel"
        description="Portrait 2:3 харьцаатай (800×1200 px жишээтэй) зураг."
      />
      <MultiFileField<TravelFormValues>
        name={path(index, "images")}
        label="Бүлгийн gallery зургууд"
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
              label={locale.key === "mn" ? "Бүлгийн гарчиг" : "Section title"}
            />
            <TravelRichTextField
              name={path(index, locale.description)}
              label={locale.key === "mn" ? "Бүлгийн танилцуулга" : "Section description"}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
