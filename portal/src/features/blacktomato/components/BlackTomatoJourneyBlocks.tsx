"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plane,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePublicLocale } from "@/lib/i18n/PublicI18nProvider";
import { useJourneyExplorerScreen } from "../hooks/useJourneyExplorerScreen";
import { usePublicTravels } from "../hooks/usePublicTravels";
import { createJourneyCategories, type JourneyTrip } from "../journeyTravelMapper";
import { BlackTomatoBookingBudgetSection } from "./BlackTomatoBookingBudgetSection";
import styles from "./journey.module.css";

export function BlackTomatoJourneyBlocks() {
  const t = useTranslations("publicJourney.ui");
  const { locale } = usePublicLocale();
  const screen = useJourneyExplorerScreen();
  const travelsQuery = usePublicTravels();
  const journeyCategories = createJourneyCategories(locale, travelsQuery.data ?? []);
  const selectedCategory =
    journeyCategories.find((category) => category.id === screen.selectedCategoryId) ?? null;
  const selectedTrip =
    selectedCategory?.trips.find(
      (trip) => trip.id === (screen.selectedTripId ?? screen.closingTripId),
    ) ?? null;

  return (
    <div className={styles.blocks}>
      <div className={styles.bookingColumn} id="journey-booking">
        <BlackTomatoBookingBudgetSection initialTripId={selectedTrip?.id} variant="card" />
      </div>

      <div
        className={`${styles.explorer} ${screen.isCategoryOpen ? styles.explorerOpen : ""} ${screen.selectedTripId ? styles.explorerDetail : ""}`}
        data-journey-open={screen.isCategoryOpen ? "" : undefined}
        data-selected-category={selectedCategory?.id}
        id="journey-explorer"
      >
        <div className={styles.categoryCards} aria-hidden={screen.isCategoryOpen}>
          {journeyCategories.map((category) => (
            <div
              className={`col col--3 panel content__over post-layout-- ${styles.categoryCard} ${
                category.id === screen.selectedCategoryId ? styles.categoryCardSelected : ""
              }`}
              key={category.id}
              style={{ width: "100%" }}
            >
              <div
                className="panel__content panel__content--overlay panel__content--with-link"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <button
                  aria-expanded={screen.isCategoryOpen && category.id === screen.selectedCategoryId}
                  className={styles.categoryButton}
                  onClick={() => screen.openCategory(category.id, category.trips.length)}
                  tabIndex={screen.isCategoryOpen ? -1 : 0}
                  type="button"
                >
                  <h5 className="h6 strong">{category.title}</h5>
                  <div className="overlay" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          aria-hidden={!screen.isCategoryOpen}
          aria-live="polite"
          className={styles.tripPanel}
          id="trip-list"
        >
          {selectedCategory ? (
            <>
              <MobileJourneyNavigation
                backLabel={
                  screen.selectedTripId || screen.closingTripId
                    ? t("backToTrips")
                    : t("backToCategories")
                }
                breadcrumbLabel={t("breadcrumbLabel")}
                categoryTitle={selectedCategory.title}
                isActive={screen.isCategoryOpen}
                journeysLabel={t("journeys")}
                onBack={
                  screen.selectedTripId || screen.closingTripId
                    ? screen.closeTrip
                    : screen.closeCategory
                }
                onOpenCategories={screen.closeCategory}
                onOpenTrips={screen.closeTrip}
                tripTitle={selectedTrip?.title}
              />

              <header className={styles.tripPanelHeader}>
                <button
                  aria-label={
                    screen.selectedTripId || screen.closingTripId
                      ? t("backToTrips")
                      : t("backToCategories")
                  }
                  className={styles.backButton}
                  onClick={
                    screen.selectedTripId || screen.closingTripId
                      ? screen.closeTrip
                      : screen.closeCategory
                  }
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
                aria-hidden={screen.selectedTripId !== null}
                className={styles.tripCarousel}
                inert={screen.selectedTripId !== null}
              >
                <div
                  className={styles.tripViewport}
                  onScroll={screen.syncTripNavigation}
                  ref={screen.tripViewportRef}
                >
                  <div className={styles.tripGrid}>
                    {selectedCategory.trips.map((trip) => (
                      <button
                        aria-expanded={screen.selectedTripId === trip.id}
                        className={`card card--standard ${styles.tripCard}`}
                        data-v-5181d785=""
                        key={trip.id}
                        onClick={() => screen.openTrip(trip.id)}
                        type="button"
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
                      </button>
                    ))}
                  </div>
                </div>

                {selectedCategory.trips.length > (screen.isMobile ? 1 : 3) ? (
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

              {selectedTrip ? (
                <TripDetail isClosing={screen.isTripClosing} trip={selectedTrip} />
              ) : null}
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
  isActive: boolean;
  journeysLabel: string;
  onBack: () => void;
  onOpenCategories: () => void;
  onOpenTrips: () => void;
  tripTitle?: string;
};

function MobileJourneyNavigation({
  backLabel,
  breadcrumbLabel,
  categoryTitle,
  isActive,
  journeysLabel,
  onBack,
  onOpenCategories,
  onOpenTrips,
  tripTitle,
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
          {tripTitle ? (
            <button onClick={onOpenTrips} tabIndex={tabIndex} type="button">
              {categoryTitle}
            </button>
          ) : (
            <span aria-current="page">{categoryTitle}</span>
          )}
        </li>
        {tripTitle ? (
          <li>
            <ChevronRight aria-hidden="true" size={14} />
            <span aria-current="page">{tripTitle}</span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}

function TripDetail({ isClosing, trip }: { isClosing: boolean; trip: JourneyTrip }) {
  const t = useTranslations("publicJourney.ui");
  const bookingT = useTranslations("publicBooking");
  const highlights = Object.values(trip.highlights ?? { region: trip.region });

  return (
    <section
      aria-labelledby="trip-overview-title"
      className={`${styles.tripDetail} ${isClosing ? styles.tripDetailClosing : ""}`}
      id="trip-detail"
      tabIndex={-1}
    >
      <section
        aria-labelledby="trip-overview-title"
        className={styles.btOverview}
        id="trip-overview"
      >
        <div className={styles.btOverviewMedia}>
          <span className={styles.btOverviewRegion}>{trip.region}</span>
          <div className={styles.btOverviewContent}>
            <p className={styles.btEyebrow}>{t("journeyStartsHere")}</p>
            <h3 id="trip-overview-title">{trip.title}</h3>
            <p className={styles.btOverviewCopy}>
              {trip.intro || t("fallbackIntro", { region: trip.region })}
            </p>
          </div>
        </div>
        <section
          aria-label={t("factsLabel")}
          className={`${styles.btFacts} ${trip.transportTypes?.length ? styles.btFactsWithTransport : styles.btFactsBasic}`}
        >
          <div>
            <CalendarDays aria-hidden="true" className={styles.btFactIcon} size={18} />
            <span>{t("when")}</span>
            <strong>{trip.season || t("seasonComingSoon")}</strong>
          </div>
          <div>
            <Wallet aria-hidden="true" className={styles.btFactIcon} size={18} />
            <span>{t("price")}</span>
            <strong>{trip.price}</strong>
          </div>
          <div>
            <Clock3 aria-hidden="true" className={styles.btFactIcon} size={18} />
            <span>{t("duration")}</span>
            <strong>{trip.duration}</strong>
          </div>
          {trip.transportTypes?.length ? (
            <div>
              <Plane aria-hidden="true" className={styles.btFactIcon} size={18} />
              <span>{bookingT("transportType")}</span>
              <strong>
                {trip.transportTypes.map((type) => bookingT(`transport.${type}`)).join(" · ")}
              </strong>
            </div>
          ) : null}
        </section>
      </section>
      {trip.included?.length || trip.excluded?.length ? (
        <section aria-label="Аяллын зардлын мэдээлэл" className={styles.btInclusions}>
          {trip.included?.length ? (
            <div>
              <p className={styles.btEyebrow}>ҮНЭД БАГТСАН</p>
              <ul>
                {trip.included.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {trip.excluded?.length ? (
            <div>
              <p className={styles.btEyebrow}>ҮНЭД БАГТААГҮЙ</p>
              <ul>
                {trip.excluded.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
      <section aria-label={t("itineraryLabel")} className={styles.btRoute} id="trip-route">
        <div className={styles.btHighlights}>
          {highlights.map((highlight, index) => (
            <span key={highlight}>
              <small>0{index + 1}</small>
              {highlight}
            </span>
          ))}
        </div>
        <div className={styles.btDayList}>
          {trip.itinerary.map((stop, index) => {
            const images = trip.itineraryImages?.[index] ?? [trip.galleryImage ?? trip.image];
            return (
              <article className={styles.btDay} key={`${stop.day}-${stop.title}`}>
                <div className={styles.btDayMedia} id={index === 0 ? "trip-media" : undefined}>
                  {index === 0 && trip.videoId ? (
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      src={`https://www.youtube-nocookie.com/embed/${trip.videoId}`}
                      title={t("videoTitle", { title: trip.title })}
                    />
                  ) : (
                    <div className={styles.btDayPhotoGrid} data-count={images.length}>
                      {images.map((image, imageIndex) => (
                        <div className={styles.btDayPhoto} key={image}>
                          {/* biome-ignore lint/performance/noImgElement: local trip media follows the editorial reference layout */}
                          <img
                            alt={`${stop.title} · ${imageIndex + 1}`}
                            loading="lazy"
                            src={image}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {index === 0 ? <span>{trip.mediaCaption || trip.region}</span> : null}
                </div>
                <div className={styles.btDayCopy}>
                  <p className={styles.btEyebrow}>{t("day", { day: stop.day })}</p>
                  <h4>{stop.title}</h4>
                  {stop.points?.length ? (
                    <ul className={styles.btDayPoints}>
                      {stop.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : stop.description ? (
                    <p>{stop.description}</p>
                  ) : null}
                  {stop.meals || stop.hotel ? (
                    <div className={styles.btDayStay}>
                      {stop.meals ? (
                        <p>
                          <span>Хоол</span>
                          {stop.meals}
                        </p>
                      ) : null}
                      {stop.hotel ? (
                        <p>
                          <span>Буудал</span>
                          {stop.hotel}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
