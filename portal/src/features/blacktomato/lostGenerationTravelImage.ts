import type { travels } from "@/api/generated/contracts";

export const TRAVEL_IMAGE_PLACEHOLDER =
  "/wp-content/themes/blacktomato/dist/images/bg-swirl-dark.jpg";

export function resolveTravelImage(travel: travels.PublicTravel): {
  isPlaceholder: boolean;
  src: string;
} {
  const src =
    travel.coverImage ??
    travel.itinerarySections.find((section) => section.images.length > 0)?.images[0] ??
    travel.details.find((detail) => detail.images.length > 0)?.images[0] ??
    null;

  return src
    ? { isPlaceholder: false, src }
    : { isPlaceholder: true, src: TRAVEL_IMAGE_PLACEHOLDER };
}
