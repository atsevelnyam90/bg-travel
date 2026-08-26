"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/config/nav";
import { cn } from "@/lib/utils";
import { useVisibleNav } from "./useVisibleNav";

// Mobile-д sidebar биш bottom nav — эрхий хуруунд хүрдэг байрлал.
// Хамгийн ихдээ 5 зүйл: түүнээс олон бол шахагдаж дарахад хэцүү болно.
const MAX_ITEMS = 5;

export function BottomNav() {
  const pathname = usePathname();
  const items = useVisibleNav(navSections)
    .flatMap((section) => section.items)
    .slice(0, MAX_ITEMS);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Үндсэн цэс"
      className="sticky bottom-0 z-20 flex w-full overflow-hidden border-t bg-background md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const label = item.mobileLabel ?? item.label;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 basis-0 flex-col items-center gap-1 overflow-hidden px-1 py-2.5 text-xs transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="size-5" />
            <span className="block w-full truncate text-center leading-tight">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
