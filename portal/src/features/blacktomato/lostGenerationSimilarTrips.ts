import type { travels } from "@/api/generated/contracts";

const SIMILAR_TRIPS_SELECTOR = "[data-bg-travel-similar-trips]";
const SECTION_SCOPE_ATTRIBUTE = "data-v-5ea7fae5";
const CARD_SCOPE_ATTRIBUTE = "data-v-5181d785";
const BUTTON_SCOPE_ATTRIBUTE = "data-v-12d9a6bd";

export type SimilarTripsLabels = {
  durationDays: (count: number) => string;
  exploreTrip: string;
  nextSimilarTrips: string;
  previousSimilarTrips: string;
  similarTrips: string;
  similarTripsSubtitle: string;
};

export function selectSimilarTrips(
  currentTravel: travels.PublicTravel,
  allTravels: travels.PublicTravel[],
): travels.PublicTravel[] {
  return allTravels.filter(
    (travel) =>
      travel.category === currentTravel.category && travel.publicId !== currentTravel.publicId,
  );
}

function scopedElement<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tagName: K,
  className: string,
  scopeAttribute = SECTION_SCOPE_ATTRIBUTE,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  element.className = className;
  element.setAttribute(scopeAttribute, "");
  return element;
}

function appendIntro(
  document: Document,
  parent: HTMLElement,
  variant: "desktop" | "mobile",
  labels: SimilarTripsLabels,
): void {
  const intro = scopedElement(document, "div", `intro intro--${variant}`);
  const tile = scopedElement(document, "div", "tile");
  const text = scopedElement(document, "div", "intro__text");
  const body = scopedElement(document, "div", "intro__body");
  const heading = document.createElement("h2");
  heading.className = "mb-sm";
  heading.textContent = labels.similarTrips;
  const description = document.createElement("p");
  description.textContent = labels.similarTripsSubtitle;

  body.append(heading, description);
  text.append(body);
  tile.append(text);
  intro.append(tile);
  parent.append(intro);
}

function firstTravelImage(travel: travels.PublicTravel): string | null {
  return (
    travel.coverImage ??
    travel.itinerarySections.find((section) => section.images.length > 0)?.images[0] ??
    travel.details.find((detail) => detail.images.length > 0)?.images[0] ??
    null
  );
}

function appendCard(
  document: Document,
  grid: HTMLElement,
  travel: travels.PublicTravel,
  labels: SimilarTripsLabels,
): void {
  const item = scopedElement(document, "div", "item");
  const card = scopedElement(document, "div", "card card--standard", CARD_SCOPE_ATTRIBUTE);
  const inner = scopedElement(document, "div", "card__inner", CARD_SCOPE_ATTRIBUTE);
  const imageUrl = firstTravelImage(travel);
  if (imageUrl) {
    const image = scopedElement(
      document,
      "img",
      "card__image card__image--not-clickable",
      CARD_SCOPE_ATTRIBUTE,
    );
    image.alt = "";
    image.loading = "lazy";
    image.src = imageUrl;
    inner.append(image);
  }

  const content = scopedElement(document, "div", "card__content", CARD_SCOPE_ATTRIBUTE);
  const duration = scopedElement(document, "div", "card__nights", CARD_SCOPE_ATTRIBUTE);
  const durationText = scopedElement(
    document,
    "div",
    "text-sm-xs uppercase text-shadow strong",
    CARD_SCOPE_ATTRIBUTE,
  );
  durationText.textContent = labels.durationDays(travel.durationDays);
  duration.append(durationText);

  const overlay = scopedElement(document, "div", "card__overlay", CARD_SCOPE_ATTRIBUTE);
  if (travel.destinationLabel) {
    const region = scopedElement(
      document,
      "div",
      "card__region uppercase text-xxs letter-spaced-smmd strong mb-xxs",
      CARD_SCOPE_ATTRIBUTE,
    );
    region.textContent = travel.destinationLabel;
    overlay.append(region);
  }

  const href = `/trip-detail?${new URLSearchParams({ slug: travel.slug }).toString()}`;
  const title = scopedElement(
    document,
    "h6",
    "card__title text-base-bg letter-spaced-l",
    CARD_SCOPE_ATTRIBUTE,
  );
  const titleLink = scopedElement(document, "a", "", CARD_SCOPE_ATTRIBUTE);
  titleLink.href = href;
  titleLink.target = "_top";
  titleLink.textContent = travel.name;
  title.append(titleLink);

  const button = scopedElement(
    document,
    "a",
    "button button--ghost button--default",
    BUTTON_SCOPE_ATTRIBUTE,
  );
  button.setAttribute(CARD_SCOPE_ATTRIBUTE, "");
  button.href = href;
  button.target = "_top";
  button.textContent = labels.exploreTrip;

  overlay.append(title, button);
  content.append(duration, overlay);
  inner.append(content);
  card.append(inner);
  item.append(card);
  grid.append(item);
}

function bindCarousel(
  document: Document,
  wrap: HTMLElement,
  previousButton: HTMLButtonElement,
  nextButton: HTMLButtonElement,
): void {
  const syncButtons = () => {
    const maximumScroll = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
    const atStart = wrap.scrollLeft <= 1;
    const atEnd = maximumScroll === 0 || wrap.scrollLeft >= maximumScroll - 1;
    previousButton.disabled = atStart;
    nextButton.disabled = atEnd;
    previousButton.classList.toggle("disabled", atStart);
    nextButton.classList.toggle("disabled", atEnd);
  };
  const scroll = (direction: -1 | 1) => {
    const distance = Math.max(320, Math.round(wrap.clientWidth * 0.75));
    wrap.scrollTo({ behavior: "smooth", left: wrap.scrollLeft + direction * distance });
  };

  previousButton.addEventListener("click", () => scroll(-1));
  nextButton.addEventListener("click", () => scroll(1));
  wrap.addEventListener("scroll", syncButtons, { passive: true });
  const view = document.defaultView;
  if (view?.requestAnimationFrame) view.requestAnimationFrame(syncButtons);
  else syncButtons();
}

export function removeSimilarTrips(document: Document): void {
  document.querySelector(SIMILAR_TRIPS_SELECTOR)?.remove();
}

export function hydrateSimilarTrips(
  document: Document,
  similarTrips: travels.PublicTravel[],
  labels: SimilarTripsLabels,
): void {
  removeSimilarTrips(document);
  if (similarTrips.length === 0) return;

  const main = document.querySelector("main");
  if (!main) return;

  const section = scopedElement(
    document,
    "section",
    "section colour-scheme-light layout-carousel bg-travel-similar-trips",
  );
  section.dataset.bgTravelSimilarTrips = "";
  section.style.backgroundImage = "url('/wp-content/themes/blacktomato/dist/images/bg-swirl.png')";

  const patternHolder = scopedElement(document, "div", "pattern-holder");
  appendIntro(document, patternHolder, "mobile", labels);

  const wrap = scopedElement(document, "div", "wrap");
  const container = scopedElement(document, "div", "container");
  const scroller = scopedElement(document, "div", "scroller");
  const wrapper = scopedElement(document, "div", "wrapper");
  appendIntro(document, wrapper, "desktop", labels);

  const cards = scopedElement(document, "div", "cards");
  const grid = scopedElement(document, "div", "grid");
  similarTrips.forEach((travel) => {
    appendCard(document, grid, travel, labels);
  });
  cards.append(grid);
  wrapper.append(cards);

  const previousButton = scopedElement(
    document,
    "button",
    "scroller__arrow scroller__arrow--prev disabled",
  );
  previousButton.ariaLabel = labels.previousSimilarTrips;
  previousButton.disabled = true;
  previousButton.type = "button";
  const nextButton = scopedElement(document, "button", "scroller__arrow");
  nextButton.ariaLabel = labels.nextSimilarTrips;
  nextButton.type = "button";

  scroller.append(wrapper, previousButton, nextButton);
  container.append(scroller);
  wrap.append(container);
  patternHolder.append(wrap);
  section.append(patternHolder);
  main.append(section);

  bindCarousel(document, wrap, previousButton, nextButton);
}
