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
  galleryImage?: string;
  highlights?: string[];
  image: string;
  intro?: string;
  itinerary?: { day: string; description: string; title: string }[];
  mediaCaption?: string;
  season?: string;
  videoId?: string;
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
        image: "/images/trips/gobi-sunset.png",
        galleryImage: "/images/trips/gobi-dunes.png",
        videoId: "2b7s7Xy1MsU",
        mediaCaption: "Алтан элсэн манхан · Говь",
        intro: "Элсэн манхан, хадат хавцал, үлэг гүрвэлийн мөрөөр Өмнөговийн уудам орон зайг удаанаар туулах аялал.",
        highlights: ["Ёлын амны хавцал", "Хонгорын элс", "Баянзагийн улаан цав"],
        season: "5–9 сар",
        itinerary: [
          { day: "01", title: "Говийн зүг", description: "Улаанбаатараас Даланзадгад хүрч, замын турш тал нутгийн уудамтай танилцана." },
          { day: "02", title: "Ёлын ам", description: "Говь гурван сайханы уулсын хавцлаар алхаж, байгалийн тогтоц үзнэ." },
          { day: "03", title: "Хонгорын элс", description: "Элсэн манханд нар жаргахыг харж, хүсвэл тэмээн аялалд гарна." },
          { day: "04", title: "Баянзаг", description: "Улаан цавын хадат тогтоц, үлэг гүрвэлийн олдворын түүхтэй танилцана." },
          { day: "05", title: "Хот руу буцах", description: "Өглөөний говийн үзэмжийг үдэж, Улаанбаатар руу буцна." },
        ],
        price: "MNT 1,450,000 · MOCK",
        region: "Өмнөговь",
        title: "Говийн аялал",
      },
      {
        duration: "6 өдөр",
        image: "/images/trips/khangai-lake.png",
        galleryImage: "/images/trips/khangai-river.png",
        videoId: "cHVbWaPBTEI",
        mediaCaption: "Тэрхийн цагаан нуур · Хангай",
        intro: "Уулын цэнгэг агаар, нуурын нам гүм эрэг, нутгийн амьдралтай ойр танилцах Хангайн аялал.",
        highlights: ["Тэрхийн цагаан нуур", "Хоргын тогоо", "Хангайн ногоон хөндий"],
        season: "6–9 сар",
        itinerary: [
          { day: "01", title: "Хангайн зүг", description: "Архангай аймгийн зүг хөдөлж, замдаа хангайн хөндийд амарна." },
          { day: "02", title: "Хоргын тогоо", description: "Галт уулын тогоо, хүрмэн чулуун тогтоцтой танилцана." },
          { day: "03", title: "Тэрхийн цагаан нуур", description: "Нуурын эргээр алхаж, байгалийн амгалан өдрийг өнгөрүүлнэ." },
          { day: "04", title: "Нутгийн амьдрал", description: "Орон нутгийн айл, малчны ахуйтай танилцаж, нутгийн хоол амтална." },
          { day: "05", title: "Хангайн замаар", description: "Голын хөндий, уулын бэлээр аялан Өвөрхангайн зүг шилжинэ." },
          { day: "06", title: "Буцах зам", description: "Хангайн сүүлчийн зогсоолоо үзээд Улаанбаатар руу буцна." },
        ],
        price: "MNT 1,650,000 · MOCK",
        region: "Архангай · Өвөрхангай",
        title: "Хангайн аялал",
      },
      {
        duration: "7 өдөр",
        image: "/images/trips/tavan-bogd-glacier.png",
        galleryImage: "/images/trips/tavan-bogd-eagle.png",
        videoId: "AlUVC6Om7S8",
        mediaCaption: "Алтайн мөсөн гол · Таван богд",
        intro: "Монгол Алтайн өндөр уулс, мөсөн гол, казах түмний зочломтгой ахуйг нэг аяллаар мэдрэх адал явдал.",
        highlights: ["Алтай Таван Богдын уулс", "Потанины мөсөн гол", "Баян-Өлгийн казах соёл"],
        season: "7–9 сар",
        itinerary: [
          { day: "01", title: "Өлгий хот", description: "Баян-Өлгийд ирж, хөтөчтэй уулзан уулын аяллын бэлтгэлээ хангана." },
          { day: "02", title: "Алтайн хөндий", description: "Уулын бэл рүү хөдөлж, замдаа бүргэдчин айлын ахуйтай танилцана." },
          { day: "03", title: "Өндөрлөгийн зам", description: "Таван Богдын байгалийн цогцолборт газрын чиглэлд бартаат замаар аялна." },
          { day: "04", title: "Мөсөн голын үзэмж", description: "Хөтөчтэй алхалтаар Потанины мөсөн голын харах цэгт хүрнэ." },
          { day: "05", title: "Уулын өдөр", description: "Алтайн уулсын бэлд алхаж, байгальд амарч зураг авна." },
          { day: "06", title: "Өлгий рүү буцах", description: "Уулсаас бууж, нутгийн хоол болон хотын захтай танилцана." },
          { day: "07", title: "Аяллын төгсгөл", description: "Буцах нислэгт шилжиж, аяллаа өндөрлөнө." },
        ],
        price: "MNT 2,500,000 · MOCK",
        region: "Баян-Өлгий · Алтай Таван Богд",
        title: "Таван богд аялал",
      },
      {
        duration: "3 өдөр",
        image: "/images/trips/terelj-valley.png",
        galleryImage: "/images/trips/terelj-turtle-rock.png",
        videoId: "v6p5rjNboXs",
        mediaCaption: "Мэлхий хад · Тэрэлж",
        intro: "Хотын хэмнэлээс түр холдож, ой мод, хад асга, голын хөндийгөөр тайван амрах богино аялал.",
        highlights: ["Мэлхий хад", "Ариабалын хийд", "Тэрэлжийн голын хөндий"],
        season: "5–10 сар",
        itinerary: [
          { day: "01", title: "Тэрэлжид ирэх", description: "Улаанбаатараас хөдөлж, замдаа Мэлхий хаданд саатна." },
          { day: "02", title: "Хөндий ба хийд", description: "Ариабалын хийд хүртэл алхаж, Тэрэлжийн байгалийн замаар аялна." },
          { day: "03", title: "Өглөөний морин аялал", description: "Хүсвэл морин аялал хийж, үдээс хойш хот руу буцна." },
        ],
        price: "MNT 890,000 · MOCK",
        region: "Тэрэлж",
        title: "Тэрэлжийн аялал",
      },
      {
        duration: "8 өдөр",
        image: "/images/trips/gobi-khangai.png",
        galleryImage: "/images/trips/khangai-river.png",
        videoId: "cHVbWaPBTEI",
        mediaCaption: "Говийн уудам · Хангайн ногоон хөндий",
        intro: "Говийн улаан хад, алтан элснээс Хангайн ногоон хөндий хүртэл байгалийн хоёр өөр ертөнцөөр аялах урт маршрут.",
        highlights: ["Ёлын ам ба Баянзаг", "Хонгорын элс", "Хангайн нурууны хөндий"],
        season: "6–9 сар",
        itinerary: [
          { day: "01", title: "Өмнөговь руу", description: "Говийн чиглэлд аялж, замдаа нутгийн цэгүүдэд саатна." },
          { day: "02", title: "Ёлын ам", description: "Хавцлын сэрүүн жимээр алхаж, говийн уулсын тогтоц үзнэ." },
          { day: "03", title: "Хонгорын элс", description: "Манханд амарч, элсэн дунд нар жаргахыг харна." },
          { day: "04", title: "Баянзаг", description: "Улаан цав, галын дөл мэт өнгөт хадны дундуур аялна." },
          { day: "05", title: "Хангай руу шилжих", description: "Говийн бүсээс уул, голын хөндий рүү байгаль солигдохыг ажиглана." },
          { day: "06", title: "Хангайн хөндий", description: "Ногоон бэлчээр, голын эргээр аялж нутгийн амьдралтай танилцана." },
          { day: "07", title: "Уулын амралт", description: "Хангайн байгальд алхаж, амралт чөлөөт цаг гаргана." },
          { day: "08", title: "Улаанбаатар руу", description: "Хотоо зорин буцаж, аяллаа өндөрлөнө." },
        ],
        price: "MNT 2,200,000 · MOCK",
        region: "Өмнөговь · Архангай",
        title: "Говь хангай хосолсон аялал",
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
  const selectedTrip =
    selectedCategory?.trips.find((trip) => trip.title === screen.selectedTripTitle) ?? null;

  return (
    <div className={styles.blocks}>
      <div className={styles.bookingColumn} id="journey-booking">
        <BlackTomatoBookingBudgetSection variant="card" />
      </div>

      <div
        className={`${styles.explorer} ${screen.isCategoryOpen ? styles.explorerOpen : ""} ${selectedTrip ? styles.explorerDetail : ""}`}
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
                      <button
                        aria-expanded={screen.selectedTripTitle === trip.title}
                        className={`card card--standard ${styles.tripCard}`}
                        data-v-5181d785=""
                        key={trip.title}
                        onClick={() => screen.openTrip(trip.title)}
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

              {selectedTrip ? (
                <section aria-labelledby="trip-detail-title" className={styles.tripDetail} id="trip-detail" tabIndex={-1}>
                  <div className={styles.detailHeading}>
                    <div>
                      <p className={styles.detailEyebrow}>ТАНЫ АЯЛЛЫН ТҮҮХ</p>
                      <h2 id="trip-detail-title">{selectedTrip.title}</h2>
                      <p>{selectedTrip.intro ?? `${selectedTrip.region} чиглэлийн онцгой аялал. Өдөр бүрийн хөтөлбөр, байрлах газар болон үйлчилгээ нь одоогоор жишээ мэдээлэл болно.`}</p>
                    </div>
                    <button className={styles.detailClose} onClick={screen.closeTrip} type="button">Жагсаалт руу буцах</button>
                  </div>

                  <div className={styles.detailHero}>
                    {/* biome-ignore lint/performance/noImgElement: trip cards already use native images */}
                    <img alt="" src={selectedTrip.image} />
                    <div className={styles.detailHeroCaption}>
                      <span>{selectedTrip.region}</span>
                      <h3>{selectedTrip.title}</h3>
                      <p>{selectedTrip.duration} · {selectedTrip.season ?? "Улирлын мэдээлэл удахгүй"}</p>
                    </div>
                  </div>

                  {(selectedTrip.galleryImage || selectedTrip.videoId) ? (
                    <section aria-label={`${selectedTrip.title} зураг, видео`} className={styles.tripMedia}>
                      <div className={styles.mediaHeading}>
                        <div>
                          <p className={styles.detailEyebrow}>АЯЛЛЫН МӨЧҮҮД</p>
                          <h3>Эндээс аяллаа төсөөлөөрэй</h3>
                        </div>
                        <span>{selectedTrip.mediaCaption ?? selectedTrip.region}</span>
                      </div>
                      <div className={styles.mediaGrid}>
                        {selectedTrip.videoId ? (
                          <div className={styles.videoFrame}>
                            <iframe
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="strict-origin-when-cross-origin"
                              src={`https://www.youtube-nocookie.com/embed/${selectedTrip.videoId}`}
                              title={`${selectedTrip.title} аяллын видео`}
                            />
                            <span className={styles.videoLabel}>АЯЛЛЫН ВИДЕО</span>
                          </div>
                        ) : null}
                        {selectedTrip.galleryImage ? (
                          <a className={styles.galleryImage} href={selectedTrip.galleryImage} rel="noreferrer" target="_blank">
                            {/* biome-ignore lint/performance/noImgElement: local editorial trip gallery image */}
                            <img
                              alt={`${selectedTrip.mediaCaption ?? selectedTrip.region} аяллын байгалийн зураг`}
                              loading="lazy"
                              src={selectedTrip.galleryImage}
                            />
                            <span>Зургийг томоор үзэх <ChevronRight aria-hidden="true" size={16} /></span>
                          </a>
                        ) : null}
                      </div>
                    </section>
                  ) : null}

                  <div className={styles.detailMeta}>
                    <div><span>Хугацаа</span><strong>{selectedTrip.duration}</strong></div>
                    <div><span>Чиглэл</span><strong>{selectedTrip.region}</strong></div>
                    <div><span>Нэг хүний жишээ үнэ</span><strong>{selectedTrip.price}</strong></div>
                  </div>

                  <div className={styles.detailBody}>
                    <div className={styles.detailStory}>
                      <p className={styles.detailEyebrow}>ЭНЭ АЯЛЛААР</p>
                      <h3>Замаа яаралгүй мэдэр.</h3>
                      <p>{selectedTrip.intro ?? `${selectedTrip.region} нутагт байгалийн тогтоц, нутгийн амьдралтай танилцаж, өөрийн хэмнэлээр аялах маршрут.`}</p>
                      <div className={styles.highlightGrid}>
                        {(selectedTrip.highlights ?? [selectedTrip.region, "Нутгийн хөтөчтэй маршрут", "Байгалийн үзэсгэлэнт газрууд"]).map((highlight, index) => (
                          <div className={styles.highlight} key={highlight}>
                            <span>0{index + 1}</span><strong>{highlight}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailItinerary}>
                      <p className={styles.detailEyebrow}>ӨДӨР ӨДРИЙН ХӨТӨЛБӨР</p>
                      <h3>Аяллын хэмнэл</h3>
                      <div className={styles.itineraryList}>
                        {(selectedTrip.itinerary ?? [
                          { day: "01", title: "Аялал эхэлнэ", description: `${selectedTrip.region} чиглэлд хөдөлж, замын эхний цэгүүдээр зочилно.` },
                          { day: "02", title: "Байгальтай ойр", description: "Нутгийн хөтөчтэй аялж, байгалийн онцлог газруудаар танилцана." },
                          { day: selectedTrip.duration.split(" ")[0], title: "Буцах зам", description: "Сүүлийн өдрийн маршрутаа дуусгаж, хот руу буцна." },
                        ]).map((stop) => (
                          <details className={styles.itineraryDay} key={`${stop.day}-${stop.title}`}>
                            <summary><span>{stop.day}</span><strong>{stop.title}</strong><ChevronRight aria-hidden="true" size={18} /></summary>
                            <p>{stop.description}</p>
                          </details>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailFooter}>
                    <p><strong>Санамж</strong> · Хөтөлбөр, байрлах нөхцөл болон үнэ нь жишээ мэдээлэл; бодит мэдээллээр шинэчилнэ.</p>
                    <button onClick={() => document.getElementById("journey-booking")?.scrollIntoView({ behavior: "smooth", block: "center" })} type="button">
                      Захиалгын хэсэг рүү очих <ChevronRight aria-hidden="true" size={18} />
                    </button>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
