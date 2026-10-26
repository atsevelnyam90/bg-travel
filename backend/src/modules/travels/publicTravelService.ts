import type { travels as travelsContract } from "@winu/contracts";
import { notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

async function publicTravelRows(where?: {
  slug?: string;
}): Promise<travelsContract.PublicTravel[]> {
  const travels = await prisma.travel.findMany({
    where: { status: "PUBLISHED", ...where },
    orderBy: { name: "asc" },
    select: {
      id: true,
      publicId: true,
      slug: true,
      name: true,
      destinationLabel: true,
      tagline: true,
      description: true,
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
      content: true,
      images: true,
    },
  });
  const detailsByTravelId = new Map<string, travelsContract.PublicTravelDetail[]>();
  const detailsBySectionId = new Map<string, travelsContract.PublicTravelDetail[]>();
  const ungroupedDetailsByTravelId = new Map<string, travelsContract.PublicTravelDetail[]>();
  for (const detail of details) {
    const publicDetail = {
      dayNumber: detail.dayNumber,
      title: detail.title,
      content: detail.content,
      images: detail.images,
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
      description: true,
      mapImage: true,
      images: true,
    },
  });
  const sectionIds = new Set(sections.map((section) => section.id));
  for (const detail of details) {
    if (!detail.sectionId || sectionIds.has(detail.sectionId)) continue;
    const publicDetail = {
      dayNumber: detail.dayNumber,
      title: detail.title,
      content: detail.content,
      images: detail.images,
    };
    const rows = ungroupedDetailsByTravelId.get(detail.travelId) ?? [];
    rows.push(publicDetail);
    ungroupedDetailsByTravelId.set(detail.travelId, rows);
  }
  const sectionsByTravelId = new Map<string, travelsContract.PublicTravelItinerarySection[]>();
  for (const section of sections) {
    const rows = sectionsByTravelId.get(section.travelId) ?? [];
    rows.push({
      title: section.title,
      description: section.description,
      mapImage: section.mapImage,
      images: section.images,
      details: detailsBySectionId.get(section.id) ?? [],
    });
    sectionsByTravelId.set(section.travelId, rows);
  }

  return travels.map((travel) => {
    const itinerarySections = [...(sectionsByTravelId.get(travel.id) ?? [])];
    const ungroupedDetails = ungroupedDetailsByTravelId.get(travel.id) ?? [];
    if (ungroupedDetails.length > 0) {
      itinerarySections.push({
        title: "Аяллын хөтөлбөр",
        description: null,
        mapImage: null,
        images: [],
        details: ungroupedDetails.sort((a, b) => a.dayNumber - b.dayNumber),
      });
    }

    return {
      publicId: travel.publicId,
      slug: travel.slug,
      name: travel.name,
      destinationLabel: travel.destinationLabel,
      tagline: travel.tagline,
      description: travel.description,
      category: travel.category,
      coverImage: travel.coverImage,
      durationDays: travel.durationDays,
      details: detailsByTravelId.get(travel.id) ?? [],
      itinerarySections,
      slots: slotsByTravelId.get(travel.id) ?? [],
    };
  });
}

export async function listPublicTravels(): Promise<travelsContract.ListPublicTravelsResponse> {
  const travels = await publicTravelRows();
  return travels.filter((travel) => travel.slots.length > 0);
}

export async function getPublicTravel(
  slug: string,
): Promise<travelsContract.GetPublicTravelResponse> {
  const travel = (await publicTravelRows({ slug }))[0];
  if (!travel) throw notFound("Аялал олдсонгүй");
  return travel;
}
