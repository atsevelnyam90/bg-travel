import type { JourneyCategoryId } from "./hooks/useJourneyExplorerScreen";

export type JourneyTripId =
  | "gobi"
  | "khangai"
  | "tavanBogd"
  | "terelj"
  | "gobiKhangai"
  | "japan"
  | "kenya"
  | "morocco"
  | "italyWedding"
  | "greekHoneymoon"
  | "rainforest";

type JourneyTripMedia = {
  galleryImage?: string;
  id: JourneyTripId;
  image: string;
  itineraryDays?: readonly string[];
  price: string;
  videoId?: string;
};

type JourneyCategoryMedia = {
  id: JourneyCategoryId;
  image: string;
  trips: readonly JourneyTripMedia[];
};

export const journeyCatalog: readonly JourneyCategoryMedia[] = [
  {
    id: "domestic",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2025/02/3OxkpiGQ-FeeKbyBI-freepik__upload__60443-resized.jpg",
    trips: [
      {
        id: "gobi",
        image: "/images/trips/gobi-sunset.png",
        galleryImage: "/images/trips/gobi-dunes.png",
        videoId: "2b7s7Xy1MsU",
        itineraryDays: ["day01", "day02", "day03", "day04", "day05"],
        price: "MNT 1,450,000 · MOCK",
      },
      {
        id: "khangai",
        image: "/images/trips/khangai-lake.png",
        galleryImage: "/images/trips/khangai-river.png",
        videoId: "cHVbWaPBTEI",
        itineraryDays: ["day01", "day02", "day03", "day04", "day05", "day06"],
        price: "MNT 1,650,000 · MOCK",
      },
      {
        id: "tavanBogd",
        image: "/images/trips/tavan-bogd-glacier.png",
        galleryImage: "/images/trips/tavan-bogd-eagle.png",
        videoId: "AlUVC6Om7S8",
        itineraryDays: ["day01", "day02", "day03", "day04", "day05", "day06", "day07"],
        price: "MNT 2,500,000 · MOCK",
      },
      {
        id: "terelj",
        image: "/images/trips/terelj-valley.png",
        galleryImage: "/images/trips/terelj-turtle-rock.png",
        videoId: "v6p5rjNboXs",
        itineraryDays: ["day01", "day02", "day03"],
        price: "MNT 890,000 · MOCK",
      },
      {
        id: "gobiKhangai",
        image: "/images/trips/gobi-khangai.png",
        galleryImage: "/images/trips/khangai-river.png",
        videoId: "cHVbWaPBTEI",
        itineraryDays: ["day01", "day02", "day03", "day04", "day05", "day06", "day07", "day08"],
        price: "MNT 2,200,000 · MOCK",
      },
    ],
  },
  {
    id: "international",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/02/Borana-Lodge-Location-Setting-Pride-Rock.jpg",
    trips: [
      {
        id: "japan",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2019/09/Ninja-martial-arts-in-Tokyo.jpg",
        price: "MNT 10,400,000",
      },
      {
        id: "kenya",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/02/Borana-Lodge-Location-Setting-Pride-Rock.jpg",
        price: "MNT 11,800,000",
      },
      {
        id: "morocco",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2024/02/Atlas-mountains-morocco-landscape.jpg",
        price: "MNT 7,000,000",
      },
    ],
  },
  {
    id: "wedding",
    image:
      "https://media.blacktomato.com/cdn-cgi/image/width=978,height=1460,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2026/01/Couple-Italy-couple-swimming.jpg",
    trips: [
      {
        id: "italyWedding",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2022/09/Highlights-of-Italy-scaled.jpg",
        price: "MNT 8,000,000",
      },
      {
        id: "greekHoneymoon",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2023/01/Family-island-hopping-scaled.jpg",
        price: "MNT 9,800,000",
      },
      {
        id: "rainforest",
        image:
          "https://media.blacktomato.com/cdn-cgi/image/width=630,height=1100,fit=cover,quality=82,format=auto/https://media.blacktomato.com/2026/02/Lady-in-Forest-1-1.jpg",
        price: "MNT 12,800,000",
      },
    ],
  },
] as const;
