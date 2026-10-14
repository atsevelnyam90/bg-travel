"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "../hooks/useSession";

function AuthFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

/**
 * Client талын route guard.
 *
 * Middleware ашиглаж БОЛОХГҮЙ — Capacitor build нь `output: export` тул
 * middleware ажиллахгүй (09-mobile-desktop.md §5). Mobile дээр аль ч
 * тохиолдолд client guard хэрэгтэй болно.
 *
 * ⚠️ Энэ бол харагдац. Бодит хамгаалалт нь backend-ийн requirePermission.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/auth/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <AuthFallback />;
  }

  if (!isAuthenticated) return <AuthFallback />;

  return <>{children}</>;
}
