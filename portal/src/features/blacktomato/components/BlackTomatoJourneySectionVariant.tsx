"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useBookingBudgetScreen } from "../hooks/useBookingBudgetScreen";
import type { JourneyCategoryId } from "../hooks/useJourneyExplorerScreen";
import { BlackTomatoBookingBudgetView } from "./BlackTomatoBookingBudgetSection";
import { BlackTomatoJourneySection } from "./BlackTomatoJourneySection";

const JOURNEY_CATEGORY_IDS = new Set<JourneyCategoryId>(["domestic", "international", "wedding"]);

function parseJourneyCategory(value: string | null): JourneyCategoryId | null {
  return value && JOURNEY_CATEGORY_IDS.has(value as JourneyCategoryId)
    ? (value as JourneyCategoryId)
    : null;
}

export function BlackTomatoJourneySectionVariant() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOptionTwo = searchParams.get("option") === "2";
  const initialCategoryId = parseJourneyCategory(searchParams.get("journeyCategory"));
  const bookingScreen = useBookingBudgetScreen();
  const updateJourneyCategory = useCallback(
    (categoryId: JourneyCategoryId | null) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (categoryId) nextParams.set("journeyCategory", categoryId);
      else nextParams.delete("journeyCategory");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <>
      <BlackTomatoBookingBudgetView
        screen={bookingScreen}
        variant={isOptionTwo ? "sideDrawer" : "drawer"}
      />
      <BlackTomatoJourneySection
        bookingScreen={isOptionTwo ? bookingScreen : undefined}
        initialCategoryId={initialCategoryId}
        onCategoryChange={updateJourneyCategory}
        variant={isOptionTwo ? "option2" : "default"}
      />
    </>
  );
}
