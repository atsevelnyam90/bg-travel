import { brand } from "@/config/brand";
import en from "./messages/en.json";
import mn from "./messages/mn.json";

export const publicLocales = ["mn", "en"] as const;
export type PublicLocale = (typeof publicLocales)[number];
export const defaultPublicLocale: PublicLocale = brand.locale;

export const publicMessages = { mn, en } satisfies Record<PublicLocale, typeof mn>;

declare module "next-intl" {
  interface AppConfig {
    Locale: PublicLocale;
    Messages: typeof mn;
  }
}
