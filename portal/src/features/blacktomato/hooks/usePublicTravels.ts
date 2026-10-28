"use client";

import { useQuery } from "@tanstack/react-query";
import type { travels } from "@/api/generated/contracts";
import { usePublicLocale } from "@/lib/i18n/PublicI18nProvider";
import { listPublicTravels } from "../api";

export const publicTravelKeys = {
  list: (locale: string, category?: travels.PublicTravel["category"]) =>
    ["public", "travels", locale, category ?? "all"] as const,
};

export function usePublicTravels(category?: travels.PublicTravel["category"], enabled = true) {
  const { locale } = usePublicLocale();
  return useQuery({
    queryKey: publicTravelKeys.list(locale, category),
    queryFn: () => listPublicTravels(locale, category),
    enabled,
    staleTime: 60_000,
  });
}
