"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { brand } from "@/config/brand";
import { useSession } from "@/features/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";

// Capacitor static export-д root redirect найдваргүй тул root нь login fallback render хийнэ.
export default function RootPage() {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary font-semibold text-lg text-primary-foreground">
            {brand.shortName}
          </span>
          <h1 className="mt-4 font-semibold text-xl tracking-tight">{brand.name}</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
