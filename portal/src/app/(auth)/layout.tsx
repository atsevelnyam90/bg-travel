import type { ReactNode } from "react";
import { brand } from "@/config/brand";

// Auth дэлгэцүүд нь ЖИНХЭНЭ route — modal БИШ (04-auth.md §5):
// deep link, back товч, Capacitor universal link, password manager, алдааны төлөв.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary font-semibold text-lg text-primary-foreground">
            {brand.shortName}
          </span>
          <h1 className="mt-4 font-semibold text-xl tracking-tight">{brand.name}</h1>
        </div>
        {children}
      </div>
    </main>
  );
}
