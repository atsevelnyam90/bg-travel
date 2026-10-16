"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { publicLocales } from "@/lib/i18n/config";
import { usePublicLocale } from "@/lib/i18n/PublicI18nProvider";
import styles from "./publicLocaleSwitcher.module.css";

export function PublicLocaleSwitcher() {
  const t = useTranslations("publicLanguage");
  const { locale, selectLocale } = usePublicLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={styles.trigger} variant="outline" aria-label={t("changeLanguage")}>
          <Languages aria-hidden="true" size={18} />
          <span>{t(`short.${locale}`)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.menu}>
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => {
            const nextLocale = publicLocales.find((item) => item === value);
            if (nextLocale) selectLocale(nextLocale);
          }}
        >
          {publicLocales.map((item) => (
            <DropdownMenuRadioItem className={styles.option} key={item} value={item}>
              <span lang={item}>{t(`names.${item}`)}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
