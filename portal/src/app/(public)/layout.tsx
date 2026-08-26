import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";

/**
 * НЭВТРЭЛТГҮЙ бүлэг.
 *
 * `(app)`-аас ялгаатай нь `RequireAuth` БАЙХГҮЙ, AppShell БАЙХГҮЙ.
 * Route group-оор тусгаарласнаар "энэ хуудас нээлттэй юу" гэдэг нь
 * folder-ын нэрнээс шууд харагдана — санамсаргүйгээр хамгаалалт
 * алдагдахаас сэргийлнэ.
 *
 * ⚠️ Route group нь URL-д НЭМЭГДДЭГГҮЙ. Тиймээс `(public)` болон `(app)`
 * нэг URL орон зайг хуваалцана. Мөргөлдөхөөс сэргийлж тусад нь префикс барина:
 *
 *   /market/**   → нээлттэй (энэ бүлэг)
 *   бусад бүх    → дотоод (`(app)`, нэвтрэлт шаардана)
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/market" className="flex items-center gap-2 font-medium">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground text-xs">
              {brand.shortName}
            </span>
            {brand.name}
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Нэвтрэх</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} {brand.name}
      </footer>
    </div>
  );
}
