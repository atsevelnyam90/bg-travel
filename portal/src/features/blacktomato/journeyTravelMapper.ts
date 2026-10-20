import type { travels } from "@/api/generated/contracts";
import { formatMinor } from "@/api/generated/contracts/money";
import { publicMessages } from "@/lib/i18n/config";
import type { JourneyCategoryId } from "./hooks/useJourneyExplorerScreen";
import { journeyCatalog } from "./journeyCatalog";

export type JourneyTrip = {
  duration: string;
  excluded?: readonly string[];
  galleryImage?: string;
  highlights: Record<string, string>;
  id: string;
  image: string;
  included?: readonly string[];
  intro: string;
  itinerary: Array<{
    day: string;
    description: string;
    hotel?: string;
    meals?: string;
    points?: readonly string[];
    title: string;
  }>;
  itineraryImages: readonly (readonly string[])[];
  mediaCaption: string;
  price: string;
  region: string;
  season: string;
  title: string;
  transportTypes: readonly ("GROUND" | "DIRECT_FLIGHT")[];
  videoId?: string;
};

export type JourneyCategory = {
  id: JourneyCategoryId;
  image: string;
  subtitle: string;
  title: string;
  trips: JourneyTrip[];
};

const categoryByTravelCategory: Record<travels.PublicTravel["category"], JourneyCategoryId> = {
  DOMESTIC: "domestic",
  INTERNATIONAL: "international",
  WEDDING: "wedding",
};

function lowestPrice(slots: travels.PublicTravelSlot[]): string {
  const lowest = slots.reduce<number | null>(
    (current, slot) =>
      current === null || slot.unitPriceMinor < current ? slot.unitPriceMinor : current,
    null,
  );
  return lowest === null ? "Үнэ удахгүй" : formatMinor(lowest);
}

function toJourneyTrip(travel: travels.PublicTravel, category: JourneyCategory): JourneyTrip {
  const firstImage = travel.details.find((detail) => detail.images.length > 0)?.images[0];
  const itinerary = travel.details.map((detail) => ({
    day: String(detail.dayNumber).padStart(2, "0"),
    description: detail.content ?? "",
    title: detail.title,
  }));
  const fallbackImage = firstImage ?? travel.coverImage ?? category.image;
  const highlights = Object.fromEntries(
    travel.details.slice(0, 3).map((detail, index) => [`item${index + 1}`, detail.title]),
  );

  return {
    duration: `${travel.durationDays} өдөр`,
    galleryImage: firstImage ?? travel.coverImage ?? undefined,
    highlights: Object.keys(highlights).length > 0 ? highlights : { category: category.title },
    id: travel.publicId,
    image: travel.coverImage ?? category.image,
    intro: travel.description ?? "",
    itinerary,
    itineraryImages: travel.details.map((detail) =>
      detail.images.length > 0 ? detail.images : [fallbackImage],
    ),
    mediaCaption: travel.name,
    price: lowestPrice(travel.slots),
    region: category.title,
    season: "",
    title: travel.name,
    transportTypes: [...new Set(travel.slots.map((slot) => slot.transportType))],
  };
}

export function createJourneyCategories(
  locale: keyof typeof publicMessages,
  travels: travels.PublicTravel[],
): JourneyCategory[] {
  const copy = publicMessages[locale].publicJourney as {
    categories: Record<string, { subtitle: string; title: string }>;
  };

  return journeyCatalog.map((catalogCategory) => {
    const category = {
      id: catalogCategory.id,
      image: catalogCategory.image,
      subtitle: copy.categories[catalogCategory.id].subtitle,
      title: copy.categories[catalogCategory.id].title,
      trips: [] as JourneyTrip[],
    } satisfies JourneyCategory;
    category.trips = travels
      .filter((travel) => categoryByTravelCategory[travel.category] === category.id)
      .map((travel) => toJourneyTrip(travel, category));
    return category;
  });
}
