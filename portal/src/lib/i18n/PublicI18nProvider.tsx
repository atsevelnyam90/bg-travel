"use client";

import { NextIntlClientProvider } from "next-intl";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultPublicLocale,
  isPublicLocale,
  type PublicLocale,
  publicLocaleHtmlLang,
  publicMessages,
} from "./config";

type PublicLocaleContextValue = {
  locale: PublicLocale;
  selectLocale: (locale: PublicLocale) => void;
};

const PublicLocaleContext = createContext<PublicLocaleContextValue | null>(null);
const storageKey = "bg-travel-public-locale";

// Explicit client configuration also works in Capacitor's static export.
export function PublicI18nProvider({
  children,
  locale: initialLocale = defaultPublicLocale,
}: {
  children: ReactNode;
  locale?: PublicLocale;
}) {
  const [locale, setLocale] = useState<PublicLocale>(initialLocale);

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(storageKey);
      if (isPublicLocale(savedLocale)) setLocale(savedLocale);
    } catch {
      // The default locale remains available when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const previousLang = document.documentElement.lang;
    document.documentElement.lang = publicLocaleHtmlLang[locale];
    return () => {
      document.documentElement.lang = previousLang;
    };
  }, [locale]);

  const selectLocale = useCallback((nextLocale: PublicLocale) => {
    setLocale(nextLocale);
    try {
      localStorage.setItem(storageKey, nextLocale);
    } catch {
      // Language switching still works for the current visit without persistence.
    }
  }, []);

  const contextValue = useMemo(() => ({ locale, selectLocale }), [locale, selectLocale]);

  return (
    <PublicLocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider
        locale={locale}
        messages={publicMessages[locale]}
        timeZone="Asia/Ulaanbaatar"
      >
        {children}
      </NextIntlClientProvider>
    </PublicLocaleContext.Provider>
  );
}

export function usePublicLocale(): PublicLocaleContextValue {
  const context = useContext(PublicLocaleContext);
  if (!context) throw new Error("usePublicLocale must be used inside PublicI18nProvider");
  return context;
}
