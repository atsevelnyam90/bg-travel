"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "../hooks/useSession";

function GuestFallback() {
  return (
    <div className="space-y-4" role="status" aria-label="Нэвтрэлтийн мэдээлэл шалгаж байна">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-72 w-full rounded-3xl" />
    </div>
  );
}

function GuestErrorFallback({ retry }: { retry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
      <p className="font-medium text-sm">Нэвтрэлтийн мэдээллийг шалгаж чадсангүй.</p>
      <Button type="button" variant="outline" onClick={retry}>
        Дахин оролдох
      </Button>
    </div>
  );
}

/** Session-тэй хэрэглэгчид нэвтрэх дэлгэцийг дахин харуулахгүй. */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated, isError, isLoading, refetch } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isError && isAuthenticated) router.replace("/admin/dashboard");
  }, [isLoading, isError, isAuthenticated, router]);

  if (isLoading || isAuthenticated) return <GuestFallback />;
  if (isError) return <GuestErrorFallback retry={() => void refetch()} />;

  return <>{children}</>;
}
