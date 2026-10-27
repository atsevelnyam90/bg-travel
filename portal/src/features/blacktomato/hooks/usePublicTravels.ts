"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicLocale } from "@/lib/i18n/PublicI18nProvider";
import { listPublicTravels } from "../api";

export const publicTravelKeys = {
  all: (locale: string) => ["public", "travels", locale] as const,
};

export function usePublicTravels() {
  const { locale } = usePublicLocale();
  return useQuery({
    queryKey: publicTravelKeys.all(locale),
    queryFn: () => listPublicTravels(locale),
    staleTime: 60_000,
  });
}
