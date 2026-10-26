import { describe, expect, it } from "vitest";
import { travels } from "@/api/generated/contracts";
import { createJourneyCategories } from "./journeyTravelMapper";

describe("createJourneyCategories", () => {
  it("builds the journey detail from published Travel API data instead of static trip copy", () => {
    const travel = travels.publicTravelSchema.parse({
      publicId: "6cc7df59-93bf-4499-a9d5-4c90834618eb",
      slug: "gobi-tour",
      name: "Говийн аялал",
      destinationLabel: "МОНГОЛ",
      tagline: null,
      description: "Элсэн манхан, хадат хавцлаар аялна.",
      category: "DOMESTIC",
      coverImage: "https://cdn.example.com/gobi-cover.jpg",
      durationDays: 5,
      details: [
        {
          dayNumber: 1,
          title: "Ёлын ам",
          content: "Өглөө Улаанбаатараас хөдөлнө.",
          images: ["https://cdn.example.com/yolyn-am.jpg"],
        },
      ],
      itinerarySections: [],
      slots: [
        {
          publicId: "ab2c0b37-ed02-4a8d-96d9-864c59acc70b",
          departureDate: "2026-11-05",
          returnDate: "2026-11-09",
          transportType: "GROUND",
          unitPriceMinor: 145_000_000,
          capacity: 12,
          remainingSeats: 12,
        },
      ],
    });

    const categories = createJourneyCategories("mn", [travel]);
    const trip = categories.find((category) => category.id === "domestic")?.trips[0];

    expect(trip).toMatchObject({
      id: travel.publicId,
      image: travel.coverImage,
      galleryImage: "https://cdn.example.com/yolyn-am.jpg",
      duration: "5 өдөр",
      price: "1,450,000₮",
      title: "Говийн аялал",
      itinerary: [
        {
          day: "01",
          title: "Ёлын ам",
          description: "Өглөө Улаанбаатараас хөдөлнө.",
        },
      ],
    });
    expect(categories.find((category) => category.id === "international")?.trips).toEqual([]);
  });

  it("does not invent a day-one itinerary when TravelDetail is empty", () => {
    const travel = travels.publicTravelSchema.parse({
      publicId: "77e8e98f-3c2f-4fa6-bbbf-a1f19655dd59",
      slug: "empty-itinerary",
      name: "Хоосон хөтөлбөр",
      destinationLabel: null,
      tagline: null,
      description: "Тайлбар байна.",
      category: "WEDDING",
      coverImage: null,
      durationDays: 3,
      details: [],
      itinerarySections: [],
      slots: [],
    });

    const categories = createJourneyCategories("mn", [travel]);
    const trip = categories.find((category) => category.id === "wedding")?.trips[0];

    expect(trip?.itinerary).toEqual([]);
  });
});
