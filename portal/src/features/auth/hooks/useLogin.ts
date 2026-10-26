"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setTokens } from "@/lib/api/authTokens";
import { fetchMe, login } from "../api";
import { sessionKeys } from "./useSession";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: async (tokens) => {
      // Platform adapter web дээр token-ийг үлдээхгүй; httpOnly session cookie ашиглана.
      // Native adapter дээр Bearer token хадгалагдана.
      await setTokens(tokens);

      // Login route дээр өмнөх unauthenticated `null` cache үлдсэн байж болно.
      // Admin руу client navigation хийхээс өмнө session-ийг бодитоор авч cache-д
      // тавихгүй бол guard хуучин null-ийг хараад skeleton/redirect race үүсгэнэ.
      queryClient.setQueryData(sessionKeys.me, await fetchMe());
    },
  });
}
