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
    queryFn: async () => {
      try {
        // Session bootstrap route transition-оос урт насална. TanStack-ийн
        // observer signal-ийг хэрэглэвэл layout солигдох агшинд хүсэлт abort
        // болж, шинэ guard цуцлагдсан pending state өвлөж болно. fetchMe өөрийн
        // timeout-той тул orphan request хязгааргүй үргэлжлэхгүй.
        return await fetchMe();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    // Authenticated session-ийг богино хугацаанд cache хийж болно. Харин `null`
    // session fresh байж болохгүй: өөр tab/login урсгалаар cookie шинэчлэгдсэн бол
    // дараагийн protected route mount дээр /auth/me-г дахин шалгах ёстой.
    staleTime: (sessionQuery) => (sessionQuery.state.data ? 5 * 60 * 1000 : 0),
    retry: false,
  });

  return {
    session: query.data ?? null,
    isLoading: query.isLoading || (query.isFetching && query.data === null),
    isError: query.isError || (query.isPending && !query.isFetching),
    isAuthenticated: Boolean(query.data),
    refetch: query.refetch,
  };
}
