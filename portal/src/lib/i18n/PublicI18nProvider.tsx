"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { defaultPublicLocale, type PublicLocale, publicMessages } from "./config";

// Explicit client configuration also works in Capacitor's static export.
export function PublicI18nProvider({
  children,
  locale = defaultPublicLocale,
}: {
  children: ReactNode;
  locale?: PublicLocale;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={publicMessages[locale]}
      timeZone="Asia/Ulaanbaatar"
    >
      {children}
    </NextIntlClientProvider>
  );
}
