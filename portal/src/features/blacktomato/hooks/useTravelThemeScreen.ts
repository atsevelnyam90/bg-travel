"use client";

import { useEffect, useState } from "react";

export const travelThemes = [
  { id: "original", name: "Original", description: "White · charcoal · pink" },
  { id: "sunrise", name: "Gobi Sunrise", description: "Ivory · coral · berry" },
  { id: "rose", name: "Rose Caravan", description: "Blush · plum · amber" },
  { id: "midnight", name: "Midnight Oasis", description: "Deep plum · gold · rose" },
] as const;

type TravelTheme = (typeof travelThemes)[number]["id"];
const storageKey = "bg-travel-theme";

export function useTravelThemeScreen() {
  const [theme, setTheme] = useState<TravelTheme>("sunrise");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (travelThemes.some((item) => item.id === saved)) {
        setTheme(saved as TravelTheme);
      }
    } catch {
      // The default palette also works when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".blacktomato-shell");
    if (shell) shell.dataset.travelTheme = theme;
  }, [theme]);

  function selectTheme(value: string) {
    const selected = travelThemes.find((item) => item.id === value);
    if (!selected) return;
    setTheme(selected.id);
    try {
      localStorage.setItem(storageKey, selected.id);
    } catch {
      // Switching palettes remains available without persistence.
    }
  }

  return { theme, selectTheme };
}
