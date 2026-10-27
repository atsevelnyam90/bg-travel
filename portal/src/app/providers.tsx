"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthSessionBootstrap } from "@/features/auth/components/AuthSessionBootstrap";
import { ApiError } from "@/lib/api/apiClient";

export function Providers({ children }: { children: ReactNode }) {
  // Client бүрийг state-д хадгална — request хооронд cache алдагдахаас сэргийлнэ.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              // 4xx дээр дахин оролдох нь утгагүй — эрх/валидацийн алдаа өөрөө засагдахгүй.
              if (error instanceof ApiError && error.status < 500) return false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionBootstrap />
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
