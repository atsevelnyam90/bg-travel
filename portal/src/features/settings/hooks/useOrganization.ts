"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganization, listBanks, updateOrganization } from "../api";

export const orgKeys = {
  all: ["org"] as const,
  detail: () => [...orgKeys.all, "detail"] as const,
  banks: () => [...orgKeys.all, "banks"] as const,
};

export function useOrganization() {
  return useQuery({ queryKey: orgKeys.detail(), queryFn: getOrganization });
}

export function useBanks() {
  return useQuery({
    queryKey: orgKeys.banks(),
    queryFn: listBanks,
    // Банкны жагсаалт бараг өөрчлөгддөггүй — дахин татах шаардлагагүй.
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: orgKeys.all }),
  });
}
