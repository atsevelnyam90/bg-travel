import type { travels } from "@/api/generated/contracts";

type TravelCategory = travels.AdminTravelListItem["category"];
type TravelStatus = travels.AdminTravelListItem["status"];

export const travelCategoryLabels = {
  DOMESTIC: "Дотоод аялал",
  INTERNATIONAL: "Гадаад аялал",
  WEDDING: "Хуримын аялал",
} satisfies Record<TravelCategory, string>;

export const travelCategoryOptions = [
  { value: "DOMESTIC", label: travelCategoryLabels.DOMESTIC },
  { value: "INTERNATIONAL", label: travelCategoryLabels.INTERNATIONAL },
  { value: "WEDDING", label: travelCategoryLabels.WEDDING },
] satisfies Array<{ value: TravelCategory; label: string }>;

export const travelStatusLabels = {
  DRAFT: "Ноорог",
  PUBLISHED: "Нийтэлсэн",
  ARCHIVED: "Архивласан",
} satisfies Record<TravelStatus, string>;

export const travelStatusOptions = [
  { value: "DRAFT", label: travelStatusLabels.DRAFT },
  { value: "PUBLISHED", label: travelStatusLabels.PUBLISHED },
  { value: "ARCHIVED", label: travelStatusLabels.ARCHIVED },
] satisfies Array<{ value: TravelStatus; label: string }>;
