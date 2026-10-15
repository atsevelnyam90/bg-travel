import type { travels as travelsContract } from "@winu/contracts";
import { prisma } from "@/lib/prisma";

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export async function listPublicTravels(): Promise<travelsContract.ListPublicTravelsResponse> {
  const travels = await prisma.travel.findMany({
    orderBy: { name: "asc" },
    select: { id: true, publicId: true, name: true, description: true },
  });
  if (travels.length === 0) return [];

  const departures = await prisma.travelDeparture.findMany({
    where: {
      travelId: { in: travels.map((travel) => travel.id) },
      isBookingOpen: true,
    },
    orderBy: [{ departureDate: "asc" }, { transportType: "asc" }],
    select: {
      publicId: true,
      travelId: true,
      departureDate: true,
      returnDate: true,
      transportType: true,
      unitPriceMinor: true,
      capacity: true,
    },
  });

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
    });
    slotsByTravelId.set(departure.travelId, slots);
  }

  return travels.flatMap((travel) => {
    const slots = slotsByTravelId.get(travel.id) ?? [];
    return slots.length > 0
      ? [{ publicId: travel.publicId, name: travel.name, description: travel.description, slots }]
      : [];
  });
}
