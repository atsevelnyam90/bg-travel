import { brand } from "@/config/brand";
import en from "./messages/en.json";
import ko from "./messages/ko.json";
import mn from "./messages/mn.json";
import zh from "./messages/zh.json";

export const publicLocales = ["mn", "en", "zh", "ko"] as const;
export type PublicLocale = (typeof publicLocales)[number];
export const defaultPublicLocale: PublicLocale = brand.locale;

export const publicMessages = { en, ko, mn, zh } satisfies Record<PublicLocale, typeof mn>;

export const publicLocaleHtmlLang: Record<PublicLocale, string> = {
  mn: "mn",
  en: "en",
  zh: "zh-CN",
  ko: "ko",
};

export function isPublicLocale(value: string | null): value is PublicLocale {
  return publicLocales.some((locale) => locale === value);
}

declare module "next-intl" {
  interface AppConfig {
    Locale: PublicLocale;
    Messages: typeof mn;
  }
}
