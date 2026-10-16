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
      // Platform adapter web дээр token-ийг үлдээхгүй; httpOnly session cookie ашиглана.
      // Native adapter дээр Bearer token хадгалагдана.
      await setTokens(tokens);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.me });
    },
  });
}
