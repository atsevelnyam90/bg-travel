"use client";

import { useQuery } from "@tanstack/react-query";
import { listPublicTravels } from "../api";

export const publicTravelKeys = {
  all: ["public", "travels"] as const,
};

export function usePublicTravels() {
  return useQuery({
    queryKey: publicTravelKeys.all,
    queryFn: listPublicTravels,
    staleTime: 60_000,
  });
}
