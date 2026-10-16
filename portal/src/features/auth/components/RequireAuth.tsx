"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

function AuthErrorFallback({ retry }: { retry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-medium text-sm">Нэвтрэлтийн мэдээллийг шалгаж чадсангүй.</p>
      <p className="text-muted-foreground text-sm">Сүлжээгээ шалгаад дахин оролдоно уу.</p>
      <Button type="button" variant="outline" onClick={retry}>
        Дахин оролдох
      </Button>
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
  const { isAuthenticated, isError, isLoading, refetch } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isError && !isAuthenticated) router.replace("/auth/login");
  }, [isLoading, isError, isAuthenticated, router]);

  if (isLoading) {
    return <AuthFallback />;
  }

  if (isError) {
    return <AuthErrorFallback retry={() => void refetch()} />;
  }

  if (!isAuthenticated) return <AuthFallback />;

  return <>{children}</>;
}
