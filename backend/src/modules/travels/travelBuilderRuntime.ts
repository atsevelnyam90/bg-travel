import type {
  BuilderRuntimeAdapters,
  BuilderRuntimeTableAdapter,
} from "@duke333/builder-backend/runtime";
import { prisma } from "@/lib/prisma";

export function createTravelBuilderRuntimeAdapters(generic: BuilderRuntimeAdapters) {
  const travels: BuilderRuntimeTableAdapter = {
    async listEntries(args) {
      const result = await generic.listEntries(args);
      // Grid-д харагдахгүй тайлбарууд edit form нээхэд хоосорч, дарагдахаас сэргийлнэ.
      const rows = await prisma.travel.findMany({
        where: { id: { in: result.items.map((item) => item.id) } },
        select: {
          id: true,
          name: true,
          description: true,
          version: true,
        },
      });
      const byId = new Map(rows.map((row) => [row.id, row]));
      return {
        ...result,
        items: result.items.flatMap((item) => {
          const row = byId.get(item.id);
          if (!row) return [];
          const { id: _id, version, ...values } = row;
          return [{ ...item, version, values: { ...item.values, ...values } }];
        }),
      };
    },
  };
  const departures: BuilderRuntimeTableAdapter = {
    async listEntries(args) {
      const result = await generic.listEntries(args);
      const rows = await prisma.travelDeparture.findMany({
        where: { id: { in: result.items.map((item) => item.id) } },
      });
      const byId = new Map(rows.map((row) => [row.id, row]));
      return {
        ...result,
        items: result.items.flatMap((item) => {
          const row = byId.get(item.id);
          if (!row) return [];
          return [
            {
              ...item,
              version: row.version,
              values: {
                ...item.values,
                travelId: row.travelId,
                departureDate: row.departureDate.toISOString().slice(0, 10),
                returnDate: row.returnDate.toISOString().slice(0, 10),
                transportType: row.transportType,
                unitPriceMinor: Number(row.unitPriceMinor),
                capacity: row.capacity,
                isBookingOpen: row.isBookingOpen,
              },
            },
          ];
        }),
      };
    },
  };
  return { travels, travel_departures: departures };
}
