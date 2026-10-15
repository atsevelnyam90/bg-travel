"use client";

import { Palette } from "lucide-react";
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
  const { theme, selectTheme } = useTravelThemeScreen();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={styles.trigger} variant="outline" aria-label="Change color theme">
          <Palette size={18} />
          <span>Themes</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.menu}>
        <DropdownMenuLabel>BG Travel · Color themes</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={selectTheme}>
          {travelThemes.map((item) => (
            <DropdownMenuRadioItem key={item.id} value={item.id} className={styles.option}>
              <span className={styles.swatches} data-palette={item.id} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
