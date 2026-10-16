"use client";

import { useQuery } from "@tanstack/react-query";
import type { auth } from "@/api/generated/contracts";
import { ApiError } from "@/lib/api/apiClient";
import { fetchMe } from "../api";

export const sessionKeys = { me: ["auth", "me"] as const };

/**
 * Одоогийн session. Нэвтрээгүй бол `data` нь `null` — алдаа БИШ.
 * 401-ыг хэвийн төлөв гэж үзнэ, эс тэгвэл нэвтрэх хуудас алдаа харуулна.
 */
export function useSession() {
  const query = useQuery<auth.Me | null>({
    queryKey: sessionKeys.me,
    queryFn: async ({ signal }) => {
      try {
        return await fetchMe(signal);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    // Route transition үеэр түр тасарсан хүсэлтийг нэг удаа автоматаар сэргээнэ.
    retry: 1,
    retryDelay: 300,
  });

  return {
    session: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError || (query.isPending && !query.isFetching),
    isAuthenticated: Boolean(query.data),
    refetch: query.refetch,
  };
}
