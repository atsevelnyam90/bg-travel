"use client";

import { useTranslations } from "next-intl";
import type { BookingBudgetScreen } from "../hooks/useBookingBudgetScreen";
import { BlackTomatoJourneyBlocks } from "./BlackTomatoJourneyBlocks";
import { BlackTomatoPopularDestinationsTabMarkup } from "./BlackTomatoPopularDestinationsTabMarkup";
import { BlackTomatoSpotlightTabMarkup } from "./BlackTomatoSpotlightTabMarkup";
import { BlackTomatoTravelMonthsTabMarkup } from "./BlackTomatoTravelMonthsTabMarkup";
import journeyStyles from "./journey.module.css";
import optionTwoStyles from "./journeyOptionTwo.module.css";

type BlackTomatoJourneySectionProps = {
  bookingScreen?: BookingBudgetScreen;
  variant?: "default" | "option2";
};

export function BlackTomatoJourneySection({
  bookingScreen,
  variant = "default",
}: BlackTomatoJourneySectionProps = {}) {
  const t = useTranslations("publicJourney.ui");
  const isOptionTwo = variant === "option2";

  return (
    <section
      className={
        isOptionTwo
          ? `section section--filtered_tiles bg-light ${journeyStyles.journey} ${optionTwoStyles.section}`
          : `section section--filtered_tiles pt-xl sm:pt-xl pb-lg bg-light ${journeyStyles.journey}`
      }
      data-journey-variant={isOptionTwo ? "option2" : undefined}
      id="journey-start"
    >
      <div className={`container${isOptionTwo ? ` ${optionTwoStyles.container}` : ""}`}>
        {isOptionTwo ? null : (
          <header className="align-text-center">
            <h2>{t("sectionTitle")}</h2>
            <ul className="list list--tabs" style={{ display: "none" }}>
              <li>
                <button
                  type="button"
                  className="text-sm-xs text-headings uppercase js-toggle-tab is-active"
                  data-toggle-tab="by-traveller"
                >
                  By Traveller
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-sm-xs text-headings uppercase js-toggle-tab"
                  data-toggle-tab="most-popular"
                >
                  Most Popular
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-sm-xs text-headings uppercase js-toggle-tab"
                  data-toggle-tab="by-month"
                >
                  By month
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-sm-xs text-headings uppercase js-toggle-tab"
                  data-toggle-tab="in-the-spotlight"
                >
                  In the Spotlight
                </button>
              </li>
            </ul>
          </header>
        )}

        <div
          className={`section__content section__content--row section${isOptionTwo ? ` ${optionTwoStyles.content}` : ""}`}
        >
          <div
            className={`tab tab--col--3 section__tab is-active${isOptionTwo ? ` ${optionTwoStyles.tab}` : ""}`}
            data-tab="by-traveller"
          >
            <BlackTomatoJourneyBlocks bookingScreen={bookingScreen} variant={variant} />
          </div>
          <BlackTomatoPopularDestinationsTabMarkup />
          <BlackTomatoTravelMonthsTabMarkup />
          <BlackTomatoSpotlightTabMarkup />
        </div>
      </div>
    </section>
  );
}
