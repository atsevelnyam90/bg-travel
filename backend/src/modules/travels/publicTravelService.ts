import type { travels as travelsContract } from "@winu/contracts";
import { notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { normalizeLegacyTravelFileUrl } from "@/modules/files/legacyTravelFiles";

type PublicTravelLocale = travelsContract.PublicTravelLocale;

type LocalizedText = {
  mn: string | null;
  en: string | null;
  zh: string | null;
  ko: string | null;
};

function localizedText(locale: PublicTravelLocale, text: LocalizedText): string | null {
  const selected = text[locale];
  return selected?.trim() ? selected : text.mn;
}

const fallbackItineraryTitle: Record<PublicTravelLocale, string> = {
  mn: "Аяллын хөтөлбөр",
  en: "Itinerary",
  zh: "旅行行程",
  ko: "여행 일정",
};

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

async function publicTravelRows(
  where?: {
    slug?: string;
  },
  locale: PublicTravelLocale = "mn",
): Promise<travelsContract.PublicTravel[]> {
  const travels = await prisma.travel.findMany({
    where: { status: "PUBLISHED", ...where },
    orderBy: { name: "asc" },
    select: {
      id: true,
      publicId: true,
      slug: true,
      name: true,
      nameEn: true,
      nameZh: true,
      nameKo: true,
      destinationLabel: true,
      destinationLabelEn: true,
      destinationLabelZh: true,
      destinationLabelKo: true,
      tagline: true,
      taglineEn: true,
      taglineZh: true,
      taglineKo: true,
      description: true,
      descriptionEn: true,
      descriptionZh: true,
      descriptionKo: true,
      category: true,
      coverImage: true,
      durationDays: true,
    },
  });
  if (travels.length === 0) return [];

  const departures = await prisma.travelDeparture.findMany({
    where: {
      travelId: { in: travels.map((travel) => travel.id) },
      isBookingOpen: true,
    },
    orderBy: [{ departureDate: "asc" }, { transportType: "asc" }],
    select: {
      id: true,
      publicId: true,
      travelId: true,
      departureDate: true,
      returnDate: true,
      transportType: true,
      unitPriceMinor: true,
      capacity: true,
    },
  });

  const confirmedOrders = await prisma.order.findMany({
    where: {
      status: "PAID",
      travelDepartureId: { in: departures.map((departure) => departure.id) },
    },
    select: { travelDepartureId: true, travelerCount: true },
  });
  const confirmedSeatsByDepartureId = new Map<string, number>();
  for (const order of confirmedOrders) {
    if (!order.travelDepartureId) continue;
    confirmedSeatsByDepartureId.set(
      order.travelDepartureId,
      (confirmedSeatsByDepartureId.get(order.travelDepartureId) ?? 0) + order.travelerCount,
    );
  }

  const slotsByTravelId = new Map<string, travelsContract.PublicTravelSlot[]>();
  for (const departure of departures) {
    const slots = slotsByTravelId.get(departure.travelId) ?? [];
    slots.push({
      publicId: departure.publicId,
      departureDate: dateOnly(departure.departureDate),
      returnDate: dateOnly(departure.returnDate),
      transportType: departure.transportType,
      unitPriceMinor: Number(departure.unitPriceMinor),
      capacity: departure.capacity,
      remainingSeats: Math.max(
        departure.capacity - (confirmedSeatsByDepartureId.get(departure.id) ?? 0),
        0,
      ),
    });
    slotsByTravelId.set(departure.travelId, slots);
  }

  const details = await prisma.travelDetail.findMany({
    where: { travelId: { in: travels.map((travel) => travel.id) } },
    orderBy: [{ travelId: "asc" }, { dayNumber: "asc" }],
    select: {
      travelId: true,
      sectionId: true,
      dayNumber: true,
      title: true,
      titleEn: true,
      titleZh: true,
      titleKo: true,
      content: true,
      contentEn: true,
      contentZh: true,
      contentKo: true,
      images: true,
    },
  });
  const detailsByTravelId = new Map<string, travelsContract.PublicTravelDetail[]>();
  const detailsBySectionId = new Map<string, travelsContract.PublicTravelDetail[]>();
  const ungroupedDetailsByTravelId = new Map<string, travelsContract.PublicTravelDetail[]>();
  for (const detail of details) {
    const publicDetail = {
      dayNumber: detail.dayNumber,
      title:
        localizedText(locale, {
          mn: detail.title,
          en: detail.titleEn,
          zh: detail.titleZh,
          ko: detail.titleKo,
        }) ?? detail.title,
      content: localizedText(locale, {
        mn: detail.content,
        en: detail.contentEn,
        zh: detail.contentZh,
        ko: detail.contentKo,
      }),
      images: detail.images.map((image) => normalizeLegacyTravelFileUrl(image) ?? image),
    };
    const rows = detailsByTravelId.get(detail.travelId) ?? [];
    rows.push(publicDetail);
    detailsByTravelId.set(detail.travelId, rows);

    if (detail.sectionId) {
      const sectionRows = detailsBySectionId.get(detail.sectionId) ?? [];
      sectionRows.push(publicDetail);
      detailsBySectionId.set(detail.sectionId, sectionRows);
    } else {
      const ungroupedRows = ungroupedDetailsByTravelId.get(detail.travelId) ?? [];
      ungroupedRows.push(publicDetail);
      ungroupedDetailsByTravelId.set(detail.travelId, ungroupedRows);
    }
  }

  const sections = await prisma.travelItinerarySection.findMany({
    where: { travelId: { in: travels.map((travel) => travel.id) } },
    orderBy: [{ travelId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      travelId: true,
      title: true,
      titleEn: true,
      titleZh: true,
      titleKo: true,
      description: true,
      descriptionEn: true,
      descriptionZh: true,
      descriptionKo: true,
      mapImage: true,
      images: true,
    },
  });
  const sectionIds = new Set(sections.map((section) => section.id));
  for (const detail of details) {
    if (!detail.sectionId || sectionIds.has(detail.sectionId)) continue;
    const publicDetail = {
      dayNumber: detail.dayNumber,
      title:
        localizedText(locale, {
          mn: detail.title,
          en: detail.titleEn,
          zh: detail.titleZh,
          ko: detail.titleKo,
        }) ?? detail.title,
      content: localizedText(locale, {
        mn: detail.content,
        en: detail.contentEn,
        zh: detail.contentZh,
        ko: detail.contentKo,
      }),
      images: detail.images.map((image) => normalizeLegacyTravelFileUrl(image) ?? image),
    };
    const rows = ungroupedDetailsByTravelId.get(detail.travelId) ?? [];
    rows.push(publicDetail);
    ungroupedDetailsByTravelId.set(detail.travelId, rows);
  }
  const sectionsByTravelId = new Map<string, travelsContract.PublicTravelItinerarySection[]>();
  for (const section of sections) {
    const rows = sectionsByTravelId.get(section.travelId) ?? [];
    rows.push({
      title:
        localizedText(locale, {
          mn: section.title,
          en: section.titleEn,
          zh: section.titleZh,
          ko: section.titleKo,
        }) ?? section.title,
      description: localizedText(locale, {
        mn: section.description,
        en: section.descriptionEn,
        zh: section.descriptionZh,
        ko: section.descriptionKo,
      }),
      mapImage: normalizeLegacyTravelFileUrl(section.mapImage),
      images: section.images.map((image) => normalizeLegacyTravelFileUrl(image) ?? image),
      details: detailsBySectionId.get(section.id) ?? [],
    });
    sectionsByTravelId.set(section.travelId, rows);
  }

  return travels.map((travel) => {
    const itinerarySections = [...(sectionsByTravelId.get(travel.id) ?? [])];
    const ungroupedDetails = ungroupedDetailsByTravelId.get(travel.id) ?? [];
    if (ungroupedDetails.length > 0) {
      itinerarySections.push({
        title: fallbackItineraryTitle[locale],
        description: null,
        mapImage: null,
        images: [],
        details: ungroupedDetails.sort((a, b) => a.dayNumber - b.dayNumber),
      });
    }

    return {
      publicId: travel.publicId,
      slug: travel.slug,
      name:
        localizedText(locale, {
          mn: travel.name,
          en: travel.nameEn,
          zh: travel.nameZh,
          ko: travel.nameKo,
        }) ?? travel.name,
      destinationLabel: localizedText(locale, {
        mn: travel.destinationLabel,
        en: travel.destinationLabelEn,
        zh: travel.destinationLabelZh,
        ko: travel.destinationLabelKo,
      }),
      tagline: localizedText(locale, {
        mn: travel.tagline,
        en: travel.taglineEn,
        zh: travel.taglineZh,
        ko: travel.taglineKo,
      }),
      description: localizedText(locale, {
        mn: travel.description,
        en: travel.descriptionEn,
        zh: travel.descriptionZh,
        ko: travel.descriptionKo,
      }),
      category: travel.category,
      coverImage: normalizeLegacyTravelFileUrl(travel.coverImage),
      durationDays: travel.durationDays,
      details: detailsByTravelId.get(travel.id) ?? [],
      itinerarySections,
      slots: slotsByTravelId.get(travel.id) ?? [],
    };
  });
}

export async function listPublicTravels(
  locale: PublicTravelLocale = "mn",
): Promise<travelsContract.ListPublicTravelsResponse> {
  const travels = await publicTravelRows(undefined, locale);
  return travels.filter((travel) => travel.slots.length > 0);
}

export async function getPublicTravel(
  slug: string,
  locale: PublicTravelLocale = "mn",
): Promise<travelsContract.GetPublicTravelResponse> {
  const travel = (await publicTravelRows({ slug }, locale))[0];
  if (!travel) throw notFound("Аялал олдсонгүй");
  return travel;
}
