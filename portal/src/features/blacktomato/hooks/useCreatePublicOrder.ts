"use client";

import { useMutation } from "@tanstack/react-query";
import { createPublicOrder } from "../api";

export function useCreatePublicOrder() {
  return useMutation({ mutationFn: createPublicOrder });
}
