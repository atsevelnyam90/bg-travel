"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicPaymentInfo } from "../api";

export const publicPaymentInfoKeys = {
  all: ["public", "payment-info"] as const,
};

export function usePublicPaymentInfo() {
  return useQuery({
    queryKey: publicPaymentInfoKeys.all,
    queryFn: getPublicPaymentInfo,
    staleTime: 5 * 60_000,
  });
}
