import type { travels } from "@/api/generated/contracts";

export type TravelFormValues = travels.CreateAdminTravelInput & { version?: number };
export type DepartureFormValue = TravelFormValues["departures"][number];
export type SectionFormValue = TravelFormValues["sections"][number];
export type DetailFormValue = TravelFormValues["details"][number];

export const emptyDeparture = (): DepartureFormValue => ({
  departureDate: "",
  returnDate: "",
  transportType: "GROUND",
  unitPriceMinor: 0,
  capacity: 1,
  isBookingOpen: true,
});

export const emptySection = (): SectionFormValue => ({
  title: "",
  description: null,
  titleEn: null,
  descriptionEn: null,
  titleZh: null,
  descriptionZh: null,
  titleKo: null,
  descriptionKo: null,
  mapImage: null,
  images: [],
  sortOrder: 0,
});

export const emptyDetail = (): DetailFormValue => ({
  sectionId: null,
  dayNumber: 1,
  title: "",
  content: null,
  titleEn: null,
  contentEn: null,
  titleZh: null,
  contentZh: null,
  titleKo: null,
  contentKo: null,
  images: [],
});

export const emptyTravel = (): TravelFormValues => ({
  name: "",
  slug: "",
  destinationLabel: null,
  tagline: null,
  nameEn: null,
  destinationLabelEn: null,
  taglineEn: null,
  descriptionEn: null,
  nameZh: null,
  destinationLabelZh: null,
  taglineZh: null,
  descriptionZh: null,
  nameKo: null,
  destinationLabelKo: null,
  taglineKo: null,
  descriptionKo: null,
  category: "DOMESTIC",
  status: "PUBLISHED",
  coverImage: null,
  durationDays: 1,
  description: null,
  departures: [],
  sections: [],
  details: [],
});

export function travelToForm(travel: travels.AdminTravel): TravelFormValues {
  return {
    ...travel,
    departures: travel.departures.map((row) => ({ ...row })),
    sections: travel.sections.map((row) => ({ ...row })),
    details: travel.details.map((row) => ({ ...row })),
  };
}

const blankToNull = (value: string | null | undefined) => value?.trim() || null;

export function normalizeTravelForm(values: TravelFormValues): TravelFormValues {
  return {
    ...values,
    destinationLabel: blankToNull(values.destinationLabel),
    tagline: blankToNull(values.tagline),
    nameEn: blankToNull(values.nameEn),
    destinationLabelEn: blankToNull(values.destinationLabelEn),
    taglineEn: blankToNull(values.taglineEn),
    descriptionEn: blankToNull(values.descriptionEn),
    nameZh: blankToNull(values.nameZh),
    destinationLabelZh: blankToNull(values.destinationLabelZh),
    taglineZh: blankToNull(values.taglineZh),
    descriptionZh: blankToNull(values.descriptionZh),
    nameKo: blankToNull(values.nameKo),
    destinationLabelKo: blankToNull(values.destinationLabelKo),
    taglineKo: blankToNull(values.taglineKo),
    descriptionKo: blankToNull(values.descriptionKo),
    coverImage: blankToNull(values.coverImage),
    description: blankToNull(values.description),
    sections: values.sections.map((row) => ({
      ...row,
      description: blankToNull(row.description),
      titleEn: blankToNull(row.titleEn),
      descriptionEn: blankToNull(row.descriptionEn),
      titleZh: blankToNull(row.titleZh),
      descriptionZh: blankToNull(row.descriptionZh),
      titleKo: blankToNull(row.titleKo),
      descriptionKo: blankToNull(row.descriptionKo),
      mapImage: blankToNull(row.mapImage),
    })),
    details: values.details.map((row) => ({
      ...row,
      sectionId: blankToNull(row.sectionId),
      content: blankToNull(row.content),
      titleEn: blankToNull(row.titleEn),
      contentEn: blankToNull(row.contentEn),
      titleZh: blankToNull(row.titleZh),
      contentZh: blankToNull(row.contentZh),
      titleKo: blankToNull(row.titleKo),
      contentKo: blankToNull(row.contentKo),
    })),
  };
}
