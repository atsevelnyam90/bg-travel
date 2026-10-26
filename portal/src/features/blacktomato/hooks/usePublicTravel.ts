"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicTravel } from "../api";

export const publicTravelDetailKeys = {
  detail: (slug: string) => ["public", "travels", "detail", slug] as const,
};

export function usePublicTravel(slug: string) {
  return useQuery({
    queryKey: publicTravelDetailKeys.detail(slug),
    queryFn: () => getPublicTravel(slug),
    enabled: slug.length > 0,
    staleTime: 60_000,
  });
}
