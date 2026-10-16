"use client";

import { Palette } from "lucide-react";
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
import { travelThemes, useTravelThemeScreen } from "../hooks/useTravelThemeScreen";
import styles from "./travelThemes.module.css";

export function TravelThemeSwitcher() {
  const t = useTranslations("publicThemes");
  const { theme, selectTheme } = useTravelThemeScreen();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={styles.trigger} variant="outline" aria-label={t("changeTheme")}>
          <Palette size={18} />
          <span>{t("trigger")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.menu}>
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={selectTheme}>
          {travelThemes.map((item) => (
            <DropdownMenuRadioItem key={item.id} value={item.id} className={styles.option}>
              <span className={styles.swatches} data-palette={item.id} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>
                <strong>{t(`items.${item.id}.name`)}</strong>
                <small>{t(`items.${item.id}.description`)}</small>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
