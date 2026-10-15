"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type JourneyCategoryId,
  useJourneyExplorerScreen,
} from "../hooks/useJourneyExplorerScreen";
import { BlackTomatoBookingBudgetSection } from "./BlackTomatoBookingBudgetSection";
import styles from "./journey.module.css";

type JourneyTrip = {
  duration: string;
  image: string;
  price: string;
  region: string;
  title: string;
};

type JourneyCategory = {
  id: JourneyCategoryId;
  image: string;
  subtitle: string;
  title: string;
  trips: JourneyTrip[];
};

const journeyCategories: JourneyCategory[] = [
  {
    id: "domestic",
    title: "Дотоод аялал",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2025/02/3OxkpiGQ-FeeKbyBI-freepik__upload__60443-resized.jpg",
    subtitle: "Монгол орны онцгой маршрутууд",
    trips: [
      {
        duration: "5 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2024/02/Atlas-mountains-morocco-landscape.jpg",
        price: "MNT 1,450,000",
        region: "Өмнөговь",
        title: "Gobi Desert Expedition",
      },
      {
        duration: "6 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2022/09/Northern-Lights-Iceland-scaled.jpg",
        price: "MNT 1,280,000",
        region: "Хөвсгөл",
        title: "Khuvsgul Blue Pearl",
      },
      {
        duration: "3 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2025/12/Sally-Lightfoot-crabs_-Ecuador.jpg",
        price: "MNT 890,000",
        region: "Тэрэлж",
        title: "Terelj Weekend Escape",
      },
    ],
  },
  {
    id: "international",
    title: "Гадаад аялал",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/02/Borana-Lodge-Location-Setting-Pride-Rock.jpg",
    subtitle: "Дэлхийн шилдэг чиглэлүүд",
    trips: [
      {
        duration: "10 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2019/09/Ninja-martial-arts-in-Tokyo.jpg",
        price: "MNT 10,400,000",
        region: "Japan",
        title: "Japan Ryokan & Culture",
      },
      {
        duration: "8 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/02/Borana-Lodge-Location-Setting-Pride-Rock.jpg",
        price: "MNT 11,800,000",
        region: "Kenya",
        title: "Kenya Private Safari",
      },
      {
        duration: "7 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2024/02/Atlas-mountains-morocco-landscape.jpg",
        price: "MNT 7,000,000",
        region: "Morocco",
        title: "Morocco Atlas Journey",
      },
    ],
  },
  {
    id: "wedding",
    title: "Хурим",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2026/01/Couple-Italy-couple-swimming.jpg",
    subtitle: "Хурим болон бал сарын аялал",
    trips: [
      {
        duration: "9 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2022/09/Highlights-of-Italy-scaled.jpg",
        price: "MNT 8,000,000",
        region: "Italy",
        title: "Italy Wedding Journey",
      },
      {
        duration: "11 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/01/Family-island-hopping-scaled.jpg",
        price: "MNT 9,800,000",
        region: "Greece",
        title: "Greek Island Honeymoon",
      },
      {
        duration: "8 өдөр",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2026/02/Lady-in-Forest-1-1.jpg",
        price: "MNT 12,800,000",
        region: "Brazil",
        title: "Rainforest Couple Retreat",
      },
    ],
  },
];

export function BlackTomatoJourneyBlocks() {
  const screen = useJourneyExplorerScreen();
  const selectedCategory =
    journeyCategories.find((category) => category.id === screen.selectedCategoryId) ?? null;

  return (
    <div className={styles.blocks}>
      <div className={styles.bookingColumn}>
        <BlackTomatoBookingBudgetSection variant="card" />
      </div>

      <div
        className={`${styles.explorer} ${screen.isCategoryOpen ? styles.explorerOpen : ""}`}
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
              <header className={styles.tripPanelHeader}>
                <button
                  aria-label="Ангиллууд руу буцах"
                  className={styles.backButton}
                  onClick={screen.closeCategory}
                  tabIndex={screen.isCategoryOpen ? 0 : -1}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={20} />
                </button>
                <div>
                  <p className={styles.panelEyebrow}>Explore our trips</p>
                  <h3 className={styles.panelTitle}>{selectedCategory.title}</h3>
                  <p className={styles.panelSubtitle}>{selectedCategory.subtitle}</p>
                </div>
              </header>

              <div className={styles.tripCarousel}>
                <div
                  className={styles.tripViewport}
                  onScroll={screen.syncTripNavigation}
                  ref={screen.tripViewportRef}
                >
                  <div className={styles.tripGrid}>
                    {selectedCategory.trips.map((trip) => (
                      <article
                        className={`card card--standard ${styles.tripCard}`}
                        data-v-5181d785=""
                        key={trip.title}
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
                      </article>
                    ))}
                  </div>
                </div>

                {selectedCategory.trips.length > (screen.isMobile ? 1 : 3) ? (
                  <div className={styles.tripNavigation}>
                    <button
                      aria-label="Өмнөх аяллууд"
                      className={styles.tripNavigationButton}
                      disabled={!screen.canScrollTripsBack}
                      onClick={() => screen.scrollTrips(-1)}
                      type="button"
                    >
                      <ChevronLeft aria-hidden="true" size={20} />
                    </button>
                    <button
                      aria-label="Дараагийн аяллууд"
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
