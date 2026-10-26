"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { usePublicLocale } from "@/lib/i18n/PublicI18nProvider";
import type { BookingBudgetScreen } from "../hooks/useBookingBudgetScreen";
import {
  type JourneyCategoryId,
  useJourneyExplorerScreen,
} from "../hooks/useJourneyExplorerScreen";
import { usePublicTravels } from "../hooks/usePublicTravels";
import { createJourneyCategories } from "../journeyTravelMapper";
import { BlackTomatoBookingBudgetSection } from "./BlackTomatoBookingBudgetSection";
import { BlackTomatoBookingSearchBar } from "./BlackTomatoBookingSearchBar";
import styles from "./journey.module.css";
import optionTwoStyles from "./journeyOptionTwo.module.css";

type BlackTomatoJourneyBlocksProps = {
  bookingScreen?: BookingBudgetScreen;
  initialCategoryId?: JourneyCategoryId | null;
  onCategoryChange?: (categoryId: JourneyCategoryId | null) => void;
  variant?: "default" | "option2";
};

function travelHref(slug: string, categoryId: JourneyCategoryId, isOptionTwo: boolean): string {
  const params = new URLSearchParams({ fromCategory: categoryId, slug });
  if (isOptionTwo) params.set("option", "2");
  return `/trip-detail?${params.toString()}`;
}

export function BlackTomatoJourneyBlocks({
  bookingScreen,
  initialCategoryId = null,
  onCategoryChange,
  variant = "default",
}: BlackTomatoJourneyBlocksProps = {}) {
  const t = useTranslations("publicJourney.ui");
  const bookingT = useTranslations("publicBooking");
  const { locale } = usePublicLocale();
  const travelsQuery = usePublicTravels();
  const isOptionTwo = variant === "option2";
  const journeyCategories = useMemo(
    () => createJourneyCategories(locale, travelsQuery.data ?? []),
    [locale, travelsQuery.data],
  );
  const tripCounts = useMemo(
    () =>
      Object.fromEntries(
        journeyCategories.map((category) => [category.id, category.trips.length]),
      ) as Record<JourneyCategoryId, number>,
    [journeyCategories],
  );
  const screen = useJourneyExplorerScreen({
    initialCategoryId,
    onCategoryChange,
    tripCounts,
  });
  const selectedCategory =
    journeyCategories.find((category) => category.id === screen.selectedCategoryId) ?? null;

  return (
    <div className={`${styles.blocks}${isOptionTwo ? ` ${optionTwoStyles.blocks}` : ""}`}>
      {isOptionTwo ? (
        bookingScreen ? (
          <BlackTomatoBookingSearchBar
            mobilePanelOpen={screen.isMobileFilterOpen}
            onMobilePanelClose={screen.closeMobileFilter}
            screen={bookingScreen}
          />
        ) : null
      ) : (
        <div className={styles.bookingColumn} id="journey-booking">
          <BlackTomatoBookingBudgetSection variant="card" />
        </div>
      )}

      <div
        className={`${styles.explorer} ${screen.isCategoryOpen ? styles.explorerOpen : ""}${isOptionTwo ? ` ${optionTwoStyles.explorer}` : ""}`}
        data-journey-open={screen.isCategoryOpen ? "" : undefined}
        data-journey-step={
          isOptionTwo ? (screen.isCategoryOpen ? "trips" : "categories") : undefined
        }
        data-selected-category={selectedCategory?.id}
        id="journey-explorer"
      >
        <div
          aria-hidden={screen.isCategoryOpen}
          className={`${styles.categoryCards}${isOptionTwo ? ` ${optionTwoStyles.categoryCards}` : ""}`}
        >
          {journeyCategories.map((category) => (
            <div
              className={
                isOptionTwo
                  ? `${styles.categoryCard} ${optionTwoStyles.categoryCard}${
                      category.id === screen.selectedCategoryId
                        ? ` ${styles.categoryCardSelected}`
                        : ""
                    }`
                  : `col col--3 panel content__over post-layout-- ${styles.categoryCard} ${
                      category.id === screen.selectedCategoryId ? styles.categoryCardSelected : ""
                    }`
              }
              key={category.id}
              style={{ width: "100%" }}
            >
              <div
                className={
                  isOptionTwo
                    ? optionTwoStyles.categoryMedia
                    : "panel__content panel__content--overlay panel__content--with-link"
                }
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <button
                  aria-expanded={screen.isCategoryOpen && category.id === screen.selectedCategoryId}
                  className={`${styles.categoryButton}${isOptionTwo ? ` ${optionTwoStyles.categoryButton}` : ""}`}
                  onClick={() => screen.openCategory(category.id)}
                  tabIndex={screen.isCategoryOpen ? -1 : 0}
                  type="button"
                >
                  <h5 className={isOptionTwo ? optionTwoStyles.categoryTitle : "h6 strong"}>
                    {category.title}
                  </h5>
                  <div className={isOptionTwo ? optionTwoStyles.overlay : "overlay"} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          aria-hidden={!screen.isCategoryOpen}
          aria-live="polite"
          className={`${styles.tripPanel}${isOptionTwo ? ` ${optionTwoStyles.tripPanel}` : ""}`}
          id="trip-list"
        >
          {selectedCategory ? (
            <>
              <MobileJourneyNavigation
                backLabel={t("backToCategories")}
                breadcrumbLabel={t("breadcrumbLabel")}
                categoryTitle={selectedCategory.title}
                filterLabel={bookingT("filters")}
                isActive={screen.isCategoryOpen}
                journeysLabel={t("journeys")}
                onBack={screen.closeCategory}
                onOpenCategories={screen.closeCategory}
                onOpenFilter={isOptionTwo ? screen.openMobileFilter : undefined}
              />

              <header className={styles.tripPanelHeader}>
                <button
                  aria-label={t("backToCategories")}
                  className={styles.backButton}
                  onClick={screen.closeCategory}
                  tabIndex={screen.isCategoryOpen && !screen.isMobile ? 0 : -1}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={20} />
                </button>
                <div>
                  <p className={styles.panelEyebrow}>{t("exploreTrips")}</p>
                  <h3 className={styles.panelTitle}>{selectedCategory.title}</h3>
                  <p className={styles.panelSubtitle}>{selectedCategory.subtitle}</p>
                </div>
              </header>

              <div
                className={styles.tripCarousel}
                data-option-two-trip-carousel={isOptionTwo ? "" : undefined}
              >
                <div
                  className={styles.tripViewport}
                  data-option-two-trip-viewport={isOptionTwo ? "" : undefined}
                  onScroll={screen.syncTripNavigation}
                  ref={screen.tripViewportRef}
                >
                  <div
                    className={styles.tripGrid}
                    data-option-two-trip-grid={isOptionTwo ? "" : undefined}
                  >
                    {selectedCategory.trips.map((trip) => (
                      <Link
                        className={`card card--standard ${styles.tripCard}`}
                        data-option-two-trip-card={isOptionTwo ? "" : undefined}
                        data-v-5181d785=""
                        href={travelHref(trip.slug, selectedCategory.id, isOptionTwo)}
                        key={trip.id}
                      >
                        <div className="card__inner" data-v-5181d785="">
                          {/* biome-ignore lint/performance/noImgElement: the legacy card styles target a native image */}
                          <img
                            alt=""
                            className="card__image card__image--not-clickable"
                            data-v-5181d785=""
                            loading="eager"
                            src={trip.image}
                          />
                          <div className="card__content" data-v-5181d785="">
                            <div className="card__nights" data-v-5181d785="">
                              <div
                                className="text-sm-xs uppercase text-shadow strong"
                                data-v-5181d785=""
                              >
                                {trip.duration}
                              </div>
                            </div>
                            <div className="card__overlay" data-v-5181d785="">
                              <div
                                className="card__region uppercase text-xxs letter-spaced-smmd strong mb-xxs"
                                data-v-5181d785=""
                              >
                                {trip.region}
                              </div>
                              <h6
                                className={`card__title text-base-bg letter-spaced-l ${styles.tripTitle}`}
                                data-v-5181d785=""
                              >
                                {trip.title}
                              </h6>
                              <div className="card__excerpt mb-sm text-base-bg" data-v-5181d785="">
                                <div className="text-xs-lg italic mt-xs" data-v-5181d785="">
                                  {trip.price}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {!isOptionTwo && selectedCategory.trips.length > (screen.isMobile ? 1 : 3) ? (
                  <div className={styles.tripNavigation}>
                    <button
                      aria-label={t("previousTrips")}
                      className={styles.tripNavigationButton}
                      disabled={!screen.canScrollTripsBack}
                      onClick={() => screen.scrollTrips(-1)}
                      type="button"
                    >
                      <ChevronLeft aria-hidden="true" size={20} />
                    </button>
                    <button
                      aria-label={t("nextTrips")}
                      className={styles.tripNavigationButton}
                      disabled={!screen.canScrollTripsForward}
                      onClick={() => screen.scrollTrips(1)}
                      type="button"
                    >
                      <ChevronRight aria-hidden="true" size={20} />
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type MobileJourneyNavigationProps = {
  backLabel: string;
  breadcrumbLabel: string;
  categoryTitle: string;
  filterLabel: string;
  isActive: boolean;
  journeysLabel: string;
  onBack: () => void;
  onOpenCategories: () => void;
  onOpenFilter?: () => void;
};

function MobileJourneyNavigation({
  backLabel,
  breadcrumbLabel,
  categoryTitle,
  filterLabel,
  isActive,
  journeysLabel,
  onBack,
  onOpenCategories,
  onOpenFilter,
}: MobileJourneyNavigationProps) {
  const tabIndex = isActive ? 0 : -1;

  return (
    <nav aria-label={breadcrumbLabel} className={styles.mobileJourneyNavigation}>
      <button
        aria-label={backLabel}
        className={styles.mobileBackButton}
        onClick={onBack}
        tabIndex={tabIndex}
        type="button"
      >
        <ArrowLeft aria-hidden="true" size={24} strokeWidth={2.25} />
      </button>
      <ol className={styles.journeyBreadcrumb}>
        <li>
          <button onClick={onOpenCategories} tabIndex={tabIndex} type="button">
            {journeysLabel}
          </button>
        </li>
        <li>
          <ChevronRight aria-hidden="true" size={14} />
          <span aria-current="page">{categoryTitle}</span>
        </li>
      </ol>
      {onOpenFilter ? (
        <button
          aria-label={filterLabel}
          className={optionTwoStyles.mobileFilterButton}
          onClick={onOpenFilter}
          tabIndex={tabIndex}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={18} />
        </button>
      ) : null}
    </nav>
  );
}
