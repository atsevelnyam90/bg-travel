"use client";

import type { ReactNode } from "react";
import { usePublicLocale } from "@/lib/i18n/PublicI18nProvider";

export function BlackTomatoLocalizedShell({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const { locale } = usePublicLocale();

  return (
    <div className={className} data-locale={locale} lang={locale === "zh" ? "zh-CN" : locale}>
      {children}
    </div>
  );
}
