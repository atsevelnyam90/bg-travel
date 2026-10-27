import type { travels } from "@/api/generated/contracts";
import { formatMinor } from "@/api/generated/contracts/money";
import { hydrateSnapshotGallery } from "./lostGenerationSnapshotCarousel";

type RichTextNode = {
  attrs?: {
    level?: unknown;
  };
  content?: RichTextNode[];
  marks?: Array<{
    type?: string;
  }>;
  text?: string;
  type?: string;
};

function parsedRichText(value: string): RichTextNode | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? (parsed as RichTextNode) : null;
  } catch {
    return null;
  }
}

function appendRichNode(document: Document, parent: Node, node: RichTextNode): void {
  if (node.type === "text") {
    let content: Node = document.createTextNode(node.text ?? "");
    const tagByMarkType: Record<string, keyof HTMLElementTagNameMap> = {
      bold: "strong",
      italic: "em",
      strike: "s",
    };

    for (const mark of node.marks ?? []) {
      const tag = mark.type ? tagByMarkType[mark.type] : undefined;
      if (!tag) continue;
      const wrapper = document.createElement(tag);
      wrapper.append(content);
      content = wrapper;
    }

    parent.appendChild(content);
    return;
  }

  const tagByType: Record<string, keyof HTMLElementTagNameMap> = {
    blockquote: "blockquote",
    bulletList: "ul",
    hardBreak: "br",
    listItem: "li",
    orderedList: "ol",
    paragraph: "p",
  };
  const tag =
    node.type === "heading"
      ? node.attrs?.level === 3
        ? "h3"
        : "h2"
      : node.type
        ? tagByType[node.type]
        : undefined;
  const nextParent = tag ? document.createElement(tag) : parent;
  if (tag) parent.appendChild(nextParent);
  node.content?.forEach((child) => {
    appendRichNode(document, nextParent, child);
  });
}

function replaceEditorialContent(element: Element | null, value: string | null): void {
  if (!element) return;
  element.replaceChildren();
  if (!value) return;

  const parsed = parsedRichText(value);
  if (parsed?.type === "doc") {
    parsed.content?.forEach((node) => {
      appendRichNode(element.ownerDocument, element, node);
    });
    return;
  }

  const paragraph = element.ownerDocument.createElement("p");
  paragraph.textContent = value;
  element.append(paragraph);
}

function setText(element: Element | null, value: string): void {
  if (element) element.textContent = value;
}

function sectionDayLabel(details: travels.PublicTravelDetail[]): string {
  if (details.length === 0) return "";
  const dayNumbers = details.map((detail) => detail.dayNumber);
  const first = Math.min(...dayNumbers);
  const last = Math.max(...dayNumbers);
  return first === last ? `Day ${first}` : `Days ${first}-${last}`;
}

function lowestPrice(slots: travels.PublicTravelSlot[]): string {
  const lowest = slots.reduce<number | null>(
    (current, slot) =>
      current === null || slot.unitPriceMinor < current ? slot.unitPriceMinor : current,
    null,
  );
  return lowest === null ? "Үнэ удахгүй" : `From ${formatMinor(lowest)}`;
}

function travelMonths(slots: travels.PublicTravelSlot[]): string {
  const months = [
    ...new Set(
      slots.map((slot) =>
        new Intl.DateTimeFormat("mn-MN", { month: "long", timeZone: "UTC" }).format(
          new Date(`${slot.departureDate}T00:00:00.000Z`),
        ),
      ),
    ),
  ];
  return months.length > 0 ? months.join(" · ") : "Гаралт удахгүй";
}

function hydrateHero(document: Document, travel: travels.PublicTravel): void {
  const hero = document.querySelector(".section--hero-banner");
  if (!hero) return;

  const labels = hero.querySelectorAll(":scope .container--absolute > .h7");
  setText(labels[0] ?? null, travel.destinationLabel ?? "");
  setText(hero.querySelector(":scope .container--absolute > h1"), travel.name);
  setText(labels[1] ?? null, travel.tagline ?? "");
  labels[0]?.toggleAttribute("hidden", !travel.destinationLabel);
  labels[1]?.toggleAttribute("hidden", !travel.tagline);

  if (travel.coverImage) {
    hero.querySelectorAll<HTMLElement>(".banner__image").forEach((image) => {
      image.style.backgroundImage = `url("${travel.coverImage}")`;
    });
  }
}

function hydrateNavigation(document: Document, travel: travels.PublicTravel): void {
  const list = document.querySelector(".section--subnav ul");
  if (!list) return;
  list.replaceChildren();

  const links = [
    { href: "#overview", label: "Overview" },
    ...travel.itinerarySections.map((section, index) => ({
      href: `#trip-section-${index}`,
      label: section.title,
    })),
  ];

  links.forEach(({ href, label }) => {
    const item = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.className = "anchor-offset text-headings";
    anchor.href = href;
    anchor.textContent = label;
    item.append(anchor);
    list.append(item);
  });
}

function hydrateOverview(document: Document, travel: travels.PublicTravel): void {
  const overview = document.querySelector(".section--content .content__read-more");
  if (overview) {
    setText(overview.querySelector("h6"), travel.destinationLabel ?? "");
    setText(overview.querySelector("h3"), travel.name);
    let copy = overview.querySelector<HTMLElement>(":scope > [data-travel-description]");
    if (!copy) {
      overview
        .querySelectorAll(":scope > p, :scope > ul, :scope > ol, :scope > blockquote")
        .forEach((node) => {
          node.remove();
        });
      copy = document.createElement("div");
      copy.dataset.travelDescription = "";
      overview.append(copy);
    }
    replaceEditorialContent(copy, travel.description);
  }

  const facts = document.querySelectorAll(".section--experience-facts .experience__facts .col");
  const values = [
    { label: "Хэзээ", value: travelMonths(travel.slots) },
    { label: "Үнэ", value: lowestPrice(travel.slots) },
    { label: "Хугацаа", value: `${travel.durationDays} өдөр` },
  ];
  facts.forEach((fact, index) => {
    const value = values[index];
    if (!value) return;
    setText(fact.querySelector("h3"), value.label);
    const valueNode = fact.querySelector("h3 + div");
    if (valueNode) valueNode.textContent = value.value;
    fact.querySelectorAll("h3 + div ~ div").forEach((node) => {
      node.remove();
    });
  });
}

function hydrateDayMedia(media: HTMLElement | null, detail: travels.PublicTravelDetail): void {
  if (!media) return;
  media.replaceChildren();
  const image = detail.images[0];
  media.hidden = !image;
  if (!image) return;

  const imageElement = media.ownerDocument.createElement("img");
  imageElement.alt = detail.title;
  imageElement.loading = "lazy";
  imageElement.src = image;
  imageElement.style.height = "100%";
  imageElement.style.objectFit = "cover";
  imageElement.style.width = "100%";
  media.append(imageElement);
}

function hydrateDayCard(
  card: HTMLElement,
  detail: travels.PublicTravelDetail,
  index: number,
): void {
  card.classList.toggle("experience-slide--reverse", index % 2 === 0);
  const content = card.querySelector(".experience-slide__content");
  setText(content?.querySelector(":scope > .uppercase") ?? null, `Day ${detail.dayNumber}`);
  setText(content?.querySelector(":scope > .text-base") ?? null, detail.title);
  replaceEditorialContent(content?.querySelector(":scope > .text-grey") ?? null, detail.content);
  hydrateDayMedia(card.querySelector<HTMLElement>(".experience-slide__media"), detail);
}

function hydrateMap(map: HTMLElement | null, mapImage: string | null): void {
  if (!map) return;
  map.hidden = !mapImage;
  map.style.display = mapImage ? "" : "none";
  if (!mapImage) return;

  const holder = map.ownerDocument.createElement("div");
  holder.style.backgroundImage = `url("${mapImage}")`;
  holder.style.backgroundPosition = "center";
  holder.style.backgroundRepeat = "no-repeat";
  holder.style.backgroundSize = "cover";
  holder.style.height = "100%";
  holder.style.minHeight = "500px";
  holder.style.width = "100%";
  map.replaceChildren(holder);
}

function hydrateDestination(
  destination: HTMLElement,
  carousel: HTMLElement | null,
  section: travels.PublicTravelItinerarySection,
  sectionIndex: number,
): void {
  destination.id = `trip-section-${sectionIndex}`;
  hydrateMap(
    destination.querySelector<HTMLElement>(".section--destination__map"),
    section.mapImage,
  );

  const heading = destination.querySelector(".section--destination__heading");
  setText(heading?.querySelector("h2") ?? null, section.title);
  replaceEditorialContent(
    heading?.querySelector(".mb-lg.max-width-lg") ?? null,
    section.description,
  );
  heading?.querySelectorAll(":scope > .text-blue").forEach((label) => {
    label.textContent = sectionDayLabel(section.details);
  });

  const wrapper = destination.querySelector(".section--destination__wrapper > div");
  if (!wrapper) return;
  const cards = Array.from(wrapper.querySelectorAll<HTMLElement>(":scope > .experience-slide"));
  const template = cards[0];
  if (template) {
    while (cards.length < section.details.length) {
      const clone = template.cloneNode(true) as HTMLElement;
      wrapper.append(clone);
      cards.push(clone);
    }
  }
  cards.forEach((card, index) => {
    const detail = section.details[index];
    if (!detail) {
      card.remove();
      return;
    }
    hydrateDayCard(card, detail, index);
  });

  hydrateSnapshotGallery(carousel, section.images, section.title);
}

function hydrateDestinations(document: Document, travel: travels.PublicTravel): void {
  const groups = Array.from(
    document.querySelectorAll<HTMLElement>("section.section--destination.bg-light"),
  ).map((destination) => ({
    carousel: destination.nextElementSibling?.matches(".section--destination-carousel")
      ? (destination.nextElementSibling as HTMLElement)
      : null,
    destination,
  }));
  const template = groups[0];
  const parent = template?.destination.parentElement;
  if (!template || !parent) return;

  while (groups.length < travel.itinerarySections.length) {
    const previous = groups.at(-1);
    const destination = template.destination.cloneNode(true) as HTMLElement;
    const carousel = template.carousel?.cloneNode(true) as HTMLElement | undefined;
    const insertionPoint =
      previous?.carousel?.nextSibling ?? previous?.destination.nextSibling ?? null;
    parent.insertBefore(destination, insertionPoint);
    if (carousel) parent.insertBefore(carousel, insertionPoint);
    groups.push({ carousel: carousel ?? null, destination });
  }

  groups.forEach(({ carousel, destination }, index) => {
    const section = travel.itinerarySections[index];
    if (!section) {
      const anchor = destination.previousElementSibling;
      if (anchor?.matches("a.anchor-offset")) anchor.remove();
      carousel?.remove();
      destination.remove();
      return;
    }
    hydrateDestination(destination, carousel, section, index);
  });
}

export function prepareLostGenerationSnapshot(document: Document): void {
  document.querySelectorAll("body > header.header").forEach((header) => {
    header.remove();
  });

  const readyHeading = Array.from(document.querySelectorAll("main h3")).find(
    (heading) => heading.textContent?.trim().toLowerCase() === "so, ready to start?",
  );
  readyHeading?.closest("section")?.remove();

  document
    .querySelectorAll(
      'main ~ .bar.bar--black.bar--logos, [data-element="footer-newsletter"], footer#bottom-footer',
    )
    .forEach((element) => {
      element.remove();
    });
}

export function hydrateLostGenerationSnapshot(
  document: Document,
  travel: travels.PublicTravel,
): void {
  prepareLostGenerationSnapshot(document);
  document.title = `${travel.name} | BG Travel`;
  hydrateHero(document, travel);
  hydrateNavigation(document, travel);
  hydrateOverview(document, travel);
  hydrateDestinations(document, travel);
}
