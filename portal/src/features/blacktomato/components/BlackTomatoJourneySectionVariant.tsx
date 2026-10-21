"use client";

import { useSearchParams } from "next/navigation";
import { useBookingBudgetScreen } from "../hooks/useBookingBudgetScreen";
import { BlackTomatoBookingBudgetView } from "./BlackTomatoBookingBudgetSection";
import { BlackTomatoJourneySection } from "./BlackTomatoJourneySection";

export function BlackTomatoJourneySectionVariant() {
  const searchParams = useSearchParams();
  const isOptionTwo = searchParams.get("option") === "2";
  const bookingScreen = useBookingBudgetScreen();

  return (
    <>
      <BlackTomatoBookingBudgetView
        screen={bookingScreen}
        variant={isOptionTwo ? "sideDrawer" : "drawer"}
      />
      <BlackTomatoJourneySection
        bookingScreen={isOptionTwo ? bookingScreen : undefined}
        variant={isOptionTwo ? "option2" : "default"}
      />
    </>
  );
}
