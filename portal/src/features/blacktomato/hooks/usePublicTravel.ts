"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicLocale } from "@/lib/i18n/PublicI18nProvider";
import { getPublicTravel } from "../api";

export const publicTravelDetailKeys = {
  detail: (slug: string, locale: string) => ["public", "travels", "detail", slug, locale] as const,
};

export function usePublicTravel(slug: string) {
  const { locale } = usePublicLocale();
  return useQuery({
    queryKey: publicTravelDetailKeys.detail(slug, locale),
    queryFn: () => getPublicTravel(slug, locale),
    enabled: slug.length > 0,
    staleTime: 60_000,
  });
}
