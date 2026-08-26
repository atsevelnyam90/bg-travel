"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearTokens } from "@/lib/api/authTokens";
import { logout } from "../api";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      // Сервер талд алдаа гарсан ч клиент талыг заавал цэвэрлэнэ —
      // "гарлаа" гэж дарсан хэрэглэгч нэвтэрсэн хэвээр үлдэж болохгүй.
      await clearTokens();
      queryClient.clear();
    },
  });
}
