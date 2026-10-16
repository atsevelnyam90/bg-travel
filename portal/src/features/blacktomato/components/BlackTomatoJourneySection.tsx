"use client";

import { useTranslations } from "next-intl";
import { BlackTomatoJourneyBlocks } from "./BlackTomatoJourneyBlocks";
import { BlackTomatoPopularDestinationsTabMarkup } from "./BlackTomatoPopularDestinationsTabMarkup";
import { BlackTomatoSpotlightTabMarkup } from "./BlackTomatoSpotlightTabMarkup";
import { BlackTomatoTravelMonthsTabMarkup } from "./BlackTomatoTravelMonthsTabMarkup";
import journeyStyles from "./journey.module.css";

export function BlackTomatoJourneySection() {
  const t = useTranslations("publicJourney.ui");

  return (
    <section
      className={`section section--filtered_tiles pt-xl sm:pt-xl pb-lg bg-light ${journeyStyles.journey}`}
      id="journey-start"
    >
      <div className="container">
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

        <div className="section__content section__content--row section">
          <div className="tab tab--col--3 section__tab is-active" data-tab="by-traveller">
            <BlackTomatoJourneyBlocks />
          </div>
          <BlackTomatoPopularDestinationsTabMarkup />
          <BlackTomatoTravelMonthsTabMarkup />
          <BlackTomatoSpotlightTabMarkup />
        </div>
      </div>
    </section>
  );
}
