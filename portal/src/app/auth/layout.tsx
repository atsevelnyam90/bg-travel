import Image from "next/image";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { RequireGuest } from "@/features/auth/components/RequireGuest";

export default function AuthPathLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(28rem,0.85fr)]">
      <section className="relative hidden min-h-dvh overflow-hidden lg:flex" aria-label="BG Travel">
        <Image
          src="/bg-travel/poster.jpg"
          alt="Уулсаар хүрээлэгдсэн аяллын үзэсгэлэнт газар"
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 0vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-foreground/10" />
        <div className="relative z-10 flex w-full flex-col justify-end p-10 text-primary-foreground xl:p-14">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] uppercase opacity-80">
              {brand.name}
            </p>
            <h1 className="text-balance font-semibold text-4xl leading-tight tracking-tight xl:text-5xl">
              Аялал бүрийн ард цэгцтэй төлөвлөлт бий.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 opacity-80">
              Захиалга, аялал болон өдөр тутмын ажлаа нэг дороос удирдаарай.
            </p>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -top-28 -right-24 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-muted blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-7 flex justify-center">
            <Image
              src="/bg-travel/logo.png"
              alt={brand.name}
              width={247}
              height={266}
              priority
              className="h-auto w-28 sm:w-32"
            />
          </div>
          <RequireGuest>{children}</RequireGuest>
          <p className="mt-6 text-center text-muted-foreground text-xs">
            Зөвхөн эрх бүхий ажилтанд зориулсан удирдлагын хэсэг
          </p>
        </div>
      </section>
    </main>
  );
}
