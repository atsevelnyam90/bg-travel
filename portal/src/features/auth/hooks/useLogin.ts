"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setTokens } from "@/lib/api/authTokens";
import { login } from "../api";
import { sessionKeys } from "./useSession";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: async (tokens) => {
      // Mobile-д Bearer токен хэрэгтэй. Web дээр cookie аль хэдийн тавигдсан
      // ч хадгалахад хор хөнөөлгүй — apiClient cookie-г эхэнд ашиглана.
      await setTokens(tokens);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.me });
    },
  });
}
