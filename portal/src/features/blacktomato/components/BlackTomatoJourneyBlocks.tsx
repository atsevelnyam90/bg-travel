"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { publicMessages } from "@/lib/i18n/config";
import { usePublicLocale } from "@/lib/i18n/PublicI18nProvider";
import { useJourneyExplorerScreen } from "../hooks/useJourneyExplorerScreen";
import { type JourneyTripId, journeyCatalog } from "../journeyCatalog";
import { BlackTomatoBookingBudgetSection } from "./BlackTomatoBookingBudgetSection";
import styles from "./journey.module.css";

type LocalizedTrip = {
  duration: string;
  highlights?: Record<string, string>;
  intro: string;
  itinerary?: Record<string, { description: string; title: string }>;
  mediaCaption: string;
  region: string;
  season: string;
  title: string;
};

type LocalizedJourney = {
  categories: Record<string, { subtitle: string; title: string }>;
  trips: Record<JourneyTripId, LocalizedTrip>;
};

type JourneyTrip = Omit<LocalizedTrip, "itinerary"> & {
  galleryImage?: string;
  id: JourneyTripId;
  image: string;
  itinerary: Array<{ day: string; description: string; title: string }>;
  price: string;
  videoId?: string;
};

function createJourneyCategories(locale: keyof typeof publicMessages) {
  const copy = publicMessages[locale].publicJourney as LocalizedJourney;

  return journeyCatalog.map((category) => ({
    ...category,
    ...copy.categories[category.id],
    trips: category.trips.map((trip): JourneyTrip => {
      const localizedTrip = copy.trips[trip.id];
      return {
        ...trip,
        ...localizedTrip,
        highlights: localizedTrip.highlights,
        itinerary: (trip.itineraryDays ?? []).map((dayKey) => ({
          day: dayKey.slice(-2),
          description: localizedTrip.itinerary?.[dayKey]?.description ?? "",
          title: localizedTrip.itinerary?.[dayKey]?.title ?? "",
        })),
      };
    }),
  }));
}

export function BlackTomatoJourneyBlocks() {
  const t = useTranslations("publicJourney.ui");
  const { locale } = usePublicLocale();
  const screen = useJourneyExplorerScreen();
  const journeyCategories = createJourneyCategories(locale);
  const selectedCategory =
    journeyCategories.find((category) => category.id === screen.selectedCategoryId) ?? null;
  const selectedTrip =
    selectedCategory?.trips.find(
      (trip) => trip.id === (screen.selectedTripId ?? screen.closingTripId),
    ) ?? null;

  return (
    <div className={styles.blocks}>
      <div className={styles.bookingColumn} id="journey-booking">
        <BlackTomatoBookingBudgetSection variant="card" />
      </div>

      <div
        className={`${styles.explorer} ${screen.isCategoryOpen ? styles.explorerOpen : ""} ${screen.selectedTripId ? styles.explorerDetail : ""}`}
        data-selected-category={selectedCategory?.id}
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

        <div aria-hidden={!screen.isCategoryOpen} aria-live="polite" className={styles.tripPanel}>
          {selectedCategory ? (
            <>
              <header className={styles.tripPanelHeader} id="trip-list">
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
                  tabIndex={screen.isCategoryOpen ? 0 : -1}
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

function TripDetail({ isClosing, trip }: { isClosing: boolean; trip: JourneyTrip }) {
  const t = useTranslations("publicJourney.ui");
  const highlights = Object.values(trip.highlights ?? { region: trip.region });
  const scrollToBooking = () =>
    document
      .getElementById("journey-booking")
      ?.scrollIntoView({ behavior: "instant", block: "start" });

  return (
    <section
      aria-labelledby="trip-overview-title"
      className={`${styles.tripDetail} ${isClosing ? styles.tripDetailClosing : ""}`}
      id="trip-detail"
      tabIndex={-1}
    >
      <nav aria-label={t("detailNavigation")} className={styles.btDetailNav}>
        <a href="#trip-overview">{t("overview")}</a>
        <a href="#trip-route">{t("itinerary")}</a>
        <a href="#trip-media">{t("media")}</a>
        <button onClick={scrollToBooking} type="button">
          {t("book")} <ChevronRight aria-hidden="true" size={15} />
        </button>
      </nav>
      <section
        aria-labelledby="trip-overview-title"
        className={styles.btOverview}
        id="trip-overview"
      >
        <p className={styles.btEyebrow}>{trip.region}</p>
        <h3 id="trip-overview-title">{trip.title}</h3>
        <p>{trip.intro || t("fallbackIntro", { region: trip.region })}</p>
      </section>
      <section aria-label={t("factsLabel")} className={styles.btFacts}>
        <div>
          <span>{t("when")}</span>
          <strong>{trip.season || t("seasonComingSoon")}</strong>
        </div>
        <div>
          <span>{t("price")}</span>
          <strong>{trip.price}</strong>
        </div>
        <div>
          <span>{t("duration")}</span>
          <strong>{trip.duration}</strong>
        </div>
      </section>
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
            const reverse = index % 2 === 1;
            const image = index % 2 === 0 ? (trip.galleryImage ?? trip.image) : trip.image;
            return (
              <article
                className={`${styles.btDay} ${reverse ? styles.btDayReverse : ""}`}
                key={`${stop.day}-${stop.title}`}
              >
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
                    // biome-ignore lint/performance/noImgElement: local trip media follows the editorial reference layout
                    <img alt={trip.mediaCaption || trip.region} loading="lazy" src={image} />
                  )}
                  {index === 0 ? <span>{trip.mediaCaption || trip.region}</span> : null}
                </div>
                <div className={styles.btDayCopy}>
                  <p className={styles.btEyebrow}>{t("day", { day: stop.day })}</p>
                  <h4>{stop.title}</h4>
                  <p>{stop.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      {trip.galleryImage ? (
        <section aria-label={t("galleryLabel")} className={styles.btGallery}>
          {/* biome-ignore lint/performance/noImgElement: local trip gallery image follows the editorial reference layout */}
          <img alt={trip.mediaCaption || trip.region} loading="lazy" src={trip.galleryImage} />
          <div>
            <p className={styles.btEyebrow}>{t("travelNotes")}</p>
            <h3>{trip.mediaCaption || trip.region}</h3>
          </div>
        </section>
      ) : null}
      <footer className={styles.btDetailFooter}>
        <div>
          <p className={styles.btEyebrow}>{t("journeyStartsHere")}</p>
          <h3>{trip.title}</h3>
        </div>
        <button onClick={scrollToBooking} type="button">
          {t("goToBooking")} <ChevronRight aria-hidden="true" size={18} />
        </button>
      </footer>
    </section>
  );
}
