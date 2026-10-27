import { describe, expect, it } from "vitest";
import { travels } from "@/api/generated/contracts";
import {
  hydrateSimilarTrips,
  type SimilarTripsLabels,
  selectSimilarTrips,
} from "./lostGenerationSimilarTrips";

const labels: SimilarTripsLabels = {
  durationDays: (count) => `${count} ӨДӨР`,
  exploreTrip: "АЯЛАЛТАЙ ТАНИЛЦАХ",
  nextSimilarTrips: "Дараагийн аяллууд",
  previousSimilarTrips: "Өмнөх аяллууд",
  similarTrips: "ТӨСТЭЙ АЯЛЛУУД",
  similarTripsSubtitle: "Энэ ангиллын бусад аяллууд",
};

function createTravel(
  publicId: string,
  slug: string,
  category: travels.PublicTravel["category"],
): travels.PublicTravel {
  return travels.publicTravelSchema.parse({
    publicId,
    slug,
    name: `${slug} аялал`,
    destinationLabel: "МОНГОЛ",
    tagline: null,
    description: null,
    category,
    coverImage: `/images/${slug}.jpg`,
    durationDays: 5,
    details: [],
    itinerarySections: [],
    slots: [],
  });
}

describe("similar trips", () => {
  const currentTravel = createTravel("6cc7df59-93bf-4499-a9d5-4c90834618eb", "current", "DOMESTIC");
  const sameCategory = createTravel(
    "a45350a1-4a49-490a-a307-f4b847f60c19",
    "same-category",
    "DOMESTIC",
  );
  const otherCategory = createTravel(
    "d29523a7-8baf-48ae-b42d-8924d2fef0f6",
    "other-category",
    "INTERNATIONAL",
  );

  it("selects only other trips from the current category", () => {
    expect(selectSimilarTrips(currentTravel, [currentTravel, sameCategory, otherCategory])).toEqual(
      [sameCategory],
    );
  });

  it("renders localized cards that navigate the top-level trip detail page", () => {
    const snapshot = document.implementation.createHTMLDocument("Snapshot");
    snapshot.body.innerHTML = "<main></main>";

    hydrateSimilarTrips(snapshot, [sameCategory], labels);

    const section = snapshot.querySelector("[data-bg-travel-similar-trips]");
    expect(section?.textContent).toContain("ТӨСТЭЙ АЯЛЛУУД");
    expect(section?.textContent).toContain("5 ӨДӨР");
    expect(section?.textContent).toContain("same-category аялал");
    expect(section?.textContent).toContain("АЯЛАЛТАЙ ТАНИЛЦАХ");
    expect(section?.querySelectorAll(".card")).toHaveLength(1);
    expect(section?.querySelector<HTMLAnchorElement>(".card__title a")?.target).toBe("_top");
    expect(section?.querySelector<HTMLAnchorElement>(".card__title a")?.getAttribute("href")).toBe(
      "/trip-detail?slug=same-category",
    );
  });
});
