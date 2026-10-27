"use client";

import { FileField, NumberField, SelectField, TextField } from "@/components/form";
import type { TravelFormValues } from "../travelFormValues";
import { TravelRichTextField } from "./TravelRichTextField";

export function TravelGeneralFields() {
  return (
    <div className="grid gap-4 md:grid-cols-12">
      <div className="md:col-span-6">
        <TextField<TravelFormValues> name="slug" label="Тогтмол холбоос" />
      </div>
      <div className="md:col-span-6">
        <NumberField<TravelFormValues> name="durationDays" label="Хоног" min={1} />
      </div>
      <div className="md:col-span-6">
        <SelectField<TravelFormValues>
          name="category"
          label="Ангилал"
          options={[
            { label: "Дотоод аялал", value: "DOMESTIC" },
            { label: "Гадаад аялал", value: "INTERNATIONAL" },
            { label: "Хуримын аялал", value: "WEDDING" },
          ]}
        />
      </div>
      <div className="md:col-span-6">
        <SelectField<TravelFormValues>
          name="status"
          label="Нийтлэх төлөв"
          options={[
            { label: "Ноорог", value: "DRAFT" },
            { label: "Нийтэлсэн", value: "PUBLISHED" },
            { label: "Архив", value: "ARCHIVED" },
          ]}
        />
      </div>
      <div className="md:col-span-12">
        <FileField<TravelFormValues>
          name="coverImage"
          label="Нүүр зураг"
          scope="travel"
          description="Аяллын жагсаалт болон дэлгэрэнгүй хуудасны үндсэн зураг."
        />
      </div>
    </div>
  );
}

type LocaleConfig = {
  name: "name" | "nameEn" | "nameZh" | "nameKo";
  destination:
    | "destinationLabel"
    | "destinationLabelEn"
    | "destinationLabelZh"
    | "destinationLabelKo";
  tagline: "tagline" | "taglineEn" | "taglineZh" | "taglineKo";
  description: "description" | "descriptionEn" | "descriptionZh" | "descriptionKo";
  labels: { name: string; destination: string; tagline: string; description: string };
};

const localeConfigs: Record<"mn" | "en" | "zh" | "ko", LocaleConfig> = {
  mn: {
    name: "name",
    destination: "destinationLabel",
    tagline: "tagline",
    description: "description",
    labels: {
      name: "Аяллын нэр",
      destination: "Чиглэлийн жижиг гарчиг",
      tagline: "Hero дэд гарчиг",
      description: "Аяллын ерөнхий танилцуулга",
    },
  },
  en: {
    name: "nameEn",
    destination: "destinationLabelEn",
    tagline: "taglineEn",
    description: "descriptionEn",
    labels: {
      name: "Travel name",
      destination: "Destination label",
      tagline: "Hero subtitle",
      description: "Travel overview",
    },
  },
  zh: {
    name: "nameZh",
    destination: "destinationLabelZh",
    tagline: "taglineZh",
    description: "descriptionZh",
    labels: {
      name: "旅行名称",
      destination: "目的地短标题",
      tagline: "主视觉副标题",
      description: "旅行介绍",
    },
  },
  ko: {
    name: "nameKo",
    destination: "destinationLabelKo",
    tagline: "taglineKo",
    description: "descriptionKo",
    labels: {
      name: "여행명",
      destination: "목적지 소제목",
      tagline: "히어로 부제목",
      description: "여행 소개",
    },
  },
};

export function TravelLocaleFields({ locale }: { locale: keyof typeof localeConfigs }) {
  const config = localeConfigs[locale];
  return (
    <div className="grid gap-4 md:grid-cols-12">
      <div className="md:col-span-12">
        <TextField<TravelFormValues> name={config.name} label={config.labels.name} />
      </div>
      <div className="md:col-span-6">
        <TextField<TravelFormValues> name={config.destination} label={config.labels.destination} />
      </div>
      <div className="md:col-span-6">
        <TextField<TravelFormValues> name={config.tagline} label={config.labels.tagline} />
      </div>
      <div className="md:col-span-12">
        <TravelRichTextField name={config.description} label={config.labels.description} />
      </div>
    </div>
  );
}
