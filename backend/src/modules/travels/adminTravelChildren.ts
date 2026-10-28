import type { travels as travelsContract } from "@winu/contracts";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

type TravelTransaction = Pick<
  typeof prisma,
  "travel" | "travelDeparture" | "travelItinerarySection" | "travelDetail"
>;

type DepartureInput = travelsContract.UpdateAdminTravelInput["departures"][number];
type SectionInput = travelsContract.UpdateAdminTravelInput["sections"][number];
type DetailInput = travelsContract.UpdateAdminTravelInput["details"][number];

type DepartureRow = {
  id: string;
  departureDate: Date;
  returnDate: Date;
  transportType: DepartureInput["transportType"];
  unitPriceMinor: bigint;
  capacity: number;
  isBookingOpen: boolean;
};

type SectionRow = {
  id: string;
  title: string;
  description: string | null;
  titleEn: string | null;
  descriptionEn: string | null;
  titleZh: string | null;
  descriptionZh: string | null;
  titleKo: string | null;
  descriptionKo: string | null;
  mapImage: string | null;
  images: string[];
  sortOrder: number;
};

type DetailRow = {
  id: string;
  sectionId: string | null;
  dayNumber: number;
  title: string;
  content: string | null;
  titleEn: string | null;
  contentEn: string | null;
  titleZh: string | null;
  contentZh: string | null;
  titleKo: string | null;
  contentKo: string | null;
  images: string[];
};

type TravelChildRows = {
  departures: DepartureRow[];
  sections: SectionRow[];
  details: DetailRow[];
};

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dateValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function assertDates(departureDate: string, returnDate: string) {
  if (returnDate < departureDate) throw badRequest("Буцах огноо гарах огнооноос хойш байна");
}

function detailData(detail: travelsContract.CreateAdminTravelInput["details"][number]) {
  return {
    sectionId: detail.sectionId ?? null,
    dayNumber: detail.dayNumber,
    title: detail.title,
    content: detail.content,
    titleEn: detail.titleEn,
    contentEn: detail.contentEn,
    titleZh: detail.titleZh,
    contentZh: detail.contentZh,
    titleKo: detail.titleKo,
    contentKo: detail.contentKo,
    images: detail.images,
  };
}

function sectionData(section: travelsContract.CreateAdminTravelInput["sections"][number]) {
  return {
    title: section.title,
    description: section.description,
    titleEn: section.titleEn,
    descriptionEn: section.descriptionEn,
    titleZh: section.titleZh,
    descriptionZh: section.descriptionZh,
    titleKo: section.titleKo,
    descriptionKo: section.descriptionKo,
    mapImage: section.mapImage,
    images: section.images,
    sortOrder: section.sortOrder,
  };
}

function sameStrings(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function departureUnchanged(row: DepartureRow, input: DepartureInput) {
  return (
    dateOnly(row.departureDate) === input.departureDate &&
    dateOnly(row.returnDate) === input.returnDate &&
    row.transportType === input.transportType &&
    row.unitPriceMinor === BigInt(input.unitPriceMinor) &&
    row.capacity === input.capacity &&
    row.isBookingOpen === input.isBookingOpen
  );
}

function sectionUnchanged(row: SectionRow, input: SectionInput) {
  return (
    row.title === input.title &&
    row.description === input.description &&
    row.titleEn === input.titleEn &&
    row.descriptionEn === input.descriptionEn &&
    row.titleZh === input.titleZh &&
    row.descriptionZh === input.descriptionZh &&
    row.titleKo === input.titleKo &&
    row.descriptionKo === input.descriptionKo &&
    row.mapImage === input.mapImage &&
    sameStrings(row.images, input.images) &&
    row.sortOrder === input.sortOrder
  );
}

function detailUnchanged(row: DetailRow, input: DetailInput) {
  return (
    row.sectionId === (input.sectionId ?? null) &&
    row.dayNumber === input.dayNumber &&
    row.title === input.title &&
    row.content === input.content &&
    row.titleEn === input.titleEn &&
    row.contentEn === input.contentEn &&
    row.titleZh === input.titleZh &&
    row.contentZh === input.contentZh &&
    row.titleKo === input.titleKo &&
    row.contentKo === input.contentKo &&
    sameStrings(row.images, input.images)
  );
}

export async function createTravelChildren(
  tx: TravelTransaction,
  travelId: string,
  input: travelsContract.CreateAdminTravelInput,
) {
  const departures = input.departures.filter((departure) => !departure._delete);
  for (const departure of departures) {
    assertDates(departure.departureDate, departure.returnDate);
  }
  if (departures.length > 0) {
    await tx.travelDeparture.createMany({
      data: departures.map((departure) => ({
        travelId,
        departureDate: dateValue(departure.departureDate),
        returnDate: dateValue(departure.returnDate),
        transportType: departure.transportType,
        unitPriceMinor: BigInt(departure.unitPriceMinor),
        capacity: departure.capacity,
        isBookingOpen: departure.isBookingOpen,
      })),
    });
  }

  const sections = input.sections.filter((section) => !section._delete);
  const sectionIds = new Set(sections.flatMap((section) => (section.id ? [section.id] : [])));
  if (sections.length > 0) {
    await tx.travelItinerarySection.createMany({
      data: sections.map((section) => ({
        ...(section.id ? { id: section.id } : {}),
        travelId,
        ...sectionData(section),
      })),
    });
  }

  const details = input.details.filter((detail) => !detail._delete);
  for (const detail of details) {
    if (detail.sectionId && !sectionIds.has(detail.sectionId)) {
      throw badRequest("Сонгосон хөтөлбөрийн бүлэг энэ аялалд харьяалагдахгүй байна");
    }
  }
  if (details.length > 0) {
    await tx.travelDetail.createMany({
      data: details.map((detail) => ({ travelId, ...detailData(detail) })),
    });
  }
}

export async function loadTravelChildrenForUpdate(travelId: string): Promise<TravelChildRows> {
  const [departures, sections, details] = await Promise.all([
    prisma.travelDeparture.findMany({
      where: { travelId },
      select: {
        id: true,
        departureDate: true,
        returnDate: true,
        transportType: true,
        unitPriceMinor: true,
        capacity: true,
        isBookingOpen: true,
      },
    }),
    prisma.travelItinerarySection.findMany({
      where: { travelId },
      select: {
        id: true,
        title: true,
        description: true,
        titleEn: true,
        descriptionEn: true,
        titleZh: true,
        descriptionZh: true,
        titleKo: true,
        descriptionKo: true,
        mapImage: true,
        images: true,
        sortOrder: true,
      },
    }),
    prisma.travelDetail.findMany({
      where: { travelId },
      select: {
        id: true,
        sectionId: true,
        dayNumber: true,
        title: true,
        content: true,
        titleEn: true,
        contentEn: true,
        titleZh: true,
        contentZh: true,
        titleKo: true,
        contentKo: true,
        images: true,
      },
    }),
  ]);
  return { departures, sections, details };
}

export async function updateTravelChildren(
  tx: TravelTransaction,
  travelId: string,
  input: travelsContract.UpdateAdminTravelInput,
  rows: TravelChildRows,
) {
  const departureById = new Map(rows.departures.map((row) => [row.id, row]));
  const sectionById = new Map(rows.sections.map((row) => [row.id, row]));
  const detailById = new Map(rows.details.map((row) => [row.id, row]));
  const activeSectionIds = new Set(sectionById.keys());

  for (const departure of input.departures) {
    if (!departure._delete) assertDates(departure.departureDate, departure.returnDate);
    if (!departure.id) {
      if (!departure._delete) {
        await tx.travelDeparture.create({
          data: {
            travelId,
            departureDate: dateValue(departure.departureDate),
            returnDate: dateValue(departure.returnDate),
            transportType: departure.transportType,
            unitPriceMinor: BigInt(departure.unitPriceMinor),
            capacity: departure.capacity,
            isBookingOpen: departure.isBookingOpen,
          },
        });
      }
      continue;
    }
    const existing = departureById.get(departure.id);
    if (!existing) throw notFound("Аяллын гаралт олдсонгүй");
    if (!departure._delete && departureUnchanged(existing, departure)) continue;
    const result = await tx.travelDeparture.updateMany({
      where: { id: departure.id, travelId, version: departure.version },
      data: departure._delete
        ? { deletedAt: new Date(), version: { increment: 1 } }
        : {
            departureDate: dateValue(departure.departureDate),
            returnDate: dateValue(departure.returnDate),
            transportType: departure.transportType,
            unitPriceMinor: BigInt(departure.unitPriceMinor),
            capacity: departure.capacity,
            isBookingOpen: departure.isBookingOpen,
            version: { increment: 1 },
          },
    });
    if (result.count === 0) throw conflict("Аяллын гаралт зэрэг өөрчлөгдсөн байна");
  }

  for (const section of input.sections) {
    if (section._new || !section.id) {
      if (!section._delete) {
        const created = await tx.travelItinerarySection.create({
          data: {
            ...(section.id ? { id: section.id } : {}),
            travelId,
            ...sectionData(section),
          },
          select: { id: true },
        });
        activeSectionIds.add(created.id);
      }
      continue;
    }
    const existing = sectionById.get(section.id);
    if (!existing) throw notFound("Хөтөлбөрийн бүлэг олдсонгүй");
    if (!section._delete && sectionUnchanged(existing, section)) continue;
    const result = await tx.travelItinerarySection.updateMany({
      where: { id: section.id, travelId, version: section.version },
      data: section._delete
        ? { deletedAt: new Date(), version: { increment: 1 } }
        : { ...sectionData(section), version: { increment: 1 } },
    });
    if (result.count === 0) throw conflict("Хөтөлбөрийн бүлэг зэрэг өөрчлөгдсөн байна");
    if (section._delete) activeSectionIds.delete(section.id);
  }

  for (const detail of input.details) {
    if (!detail._delete && detail.sectionId && !activeSectionIds.has(detail.sectionId)) {
      throw badRequest("Сонгосон хөтөлбөрийн бүлэг энэ аялалд харьяалагдахгүй байна");
    }
    if (!detail.id) {
      if (!detail._delete) {
        await tx.travelDetail.create({ data: { travelId, ...detailData(detail) } });
      }
      continue;
    }
    const existing = detailById.get(detail.id);
    if (!existing) throw notFound("Өдрийн хөтөлбөр олдсонгүй");
    if (!detail._delete && detailUnchanged(existing, detail)) continue;
    const result = await tx.travelDetail.updateMany({
      where: { id: detail.id, travelId, version: detail.version },
      data: detail._delete
        ? { deletedAt: new Date(), version: { increment: 1 } }
        : { ...detailData(detail), version: { increment: 1 } },
    });
    if (result.count === 0) throw conflict("Өдрийн хөтөлбөр зэрэг өөрчлөгдсөн байна");
  }
}
