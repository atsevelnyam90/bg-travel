"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearTokens } from "@/lib/api/authTokens";
import { logout } from "../api";
import { sessionKeys } from "./useSession";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      // Сервер талд алдаа гарсан ч клиент талыг заавал цэвэрлэнэ —
      // "гарлаа" гэж дарсан хэрэглэгч нэвтэрсэн хэвээр үлдэж болохгүй.
      await clearTokens();
      await queryClient.cancelQueries();
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== sessionKeys.me[0],
      });
      queryClient.setQueryData(sessionKeys.me, null);
    },
  });
}
