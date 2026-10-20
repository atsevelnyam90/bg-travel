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
      dayNumber: true,
      title: true,
      content: true,
      images: true,
    },
  });
  const detailsByTravelId = new Map<string, travelsContract.PublicTravelDetail[]>();
  for (const detail of details) {
    const rows = detailsByTravelId.get(detail.travelId) ?? [];
    rows.push({
      dayNumber: detail.dayNumber,
      title: detail.title,
      content: detail.content,
      images: detail.images,
    });
    detailsByTravelId.set(detail.travelId, rows);
  }

  return travels.map((travel) => ({
    publicId: travel.publicId,
    slug: travel.slug,
    name: travel.name,
    description: travel.description,
    category: travel.category,
    coverImage: travel.coverImage,
    durationDays: travel.durationDays,
    details: detailsByTravelId.get(travel.id) ?? [],
    slots: slotsByTravelId.get(travel.id) ?? [],
  }));
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
