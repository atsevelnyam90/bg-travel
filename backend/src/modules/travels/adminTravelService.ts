import type { travels as travelsContract } from "@winu/contracts";
import type { Prisma } from "@/generated/prisma/client";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { normalizeLegacyTravelFileUrl } from "@/modules/files/legacyTravelFiles";

type TravelTransaction = Pick<
  typeof prisma,
  "travel" | "travelDeparture" | "travelItinerarySection" | "travelDetail"
>;

const TRAVEL_LIST_SELECT = {
  id: true,
  name: true,
  slug: true,
  category: true,
  status: true,
  durationDays: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

const TRAVEL_SELECT = {
  ...TRAVEL_LIST_SELECT,
  destinationLabel: true,
  tagline: true,
  nameEn: true,
  destinationLabelEn: true,
  taglineEn: true,
  descriptionEn: true,
  nameZh: true,
  destinationLabelZh: true,
  taglineZh: true,
  descriptionZh: true,
  nameKo: true,
  destinationLabelKo: true,
  taglineKo: true,
  descriptionKo: true,
  coverImage: true,
  description: true,
} as const;

const SORTABLE = {
  name: "name",
  category: "category",
  status: "status",
  durationDays: "durationDays",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

function orderBy(sort?: string): Prisma.TravelOrderByWithRelationInput {
  const desc = sort?.startsWith("-") ?? true;
  const key = desc ? sort?.slice(1) : sort;
  const column = SORTABLE[key as keyof typeof SORTABLE] ?? "createdAt";
  return { [column]: desc ? "desc" : "asc" };
}

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dateValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function safeMoney(value: bigint) {
  const number = Number(value);
  if (!Number.isSafeInteger(number))
    throw conflict("Мөнгөн дүн боловсруулах хэмжээнээс хэтэрсэн байна");
  return number;
}

function assertDates(departureDate: string, returnDate: string) {
  if (returnDate < departureDate) throw badRequest("Буцах огноо гарах огнооноос хойш байна");
}

function travelData(
  input: travelsContract.CreateAdminTravelInput | travelsContract.UpdateAdminTravelInput,
) {
  return {
    name: input.name,
    slug: input.slug,
    destinationLabel: input.destinationLabel,
    tagline: input.tagline,
    nameEn: input.nameEn,
    destinationLabelEn: input.destinationLabelEn,
    taglineEn: input.taglineEn,
    descriptionEn: input.descriptionEn,
    nameZh: input.nameZh,
    destinationLabelZh: input.destinationLabelZh,
    taglineZh: input.taglineZh,
    descriptionZh: input.descriptionZh,
    nameKo: input.nameKo,
    destinationLabelKo: input.destinationLabelKo,
    taglineKo: input.taglineKo,
    descriptionKo: input.descriptionKo,
    category: input.category,
    status: input.status,
    coverImage: input.coverImage,
    durationDays: input.durationDays,
    description: input.description,
  };
}

export async function listAdminTravels(
  query: travelsContract.ListAdminTravelsQuery,
): Promise<travelsContract.ListAdminTravelsResponse> {
  const where: Prisma.TravelWhereInput = {
    ...(query.category ? { category: query.category } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { slug: { contains: query.search, mode: "insensitive" } },
            { destinationLabel: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.travel.count({ where }),
    prisma.travel.findMany({
      where,
      orderBy: orderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: TRAVEL_LIST_SELECT,
    }),
  ]);
  return {
    items: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getAdminTravel(id: string): Promise<travelsContract.AdminTravel> {
  const [travel, departures, sections, details] = await Promise.all([
    prisma.travel.findFirst({ where: { id }, select: TRAVEL_SELECT }),
    prisma.travelDeparture.findMany({ where: { travelId: id }, orderBy: { departureDate: "asc" } }),
    prisma.travelItinerarySection.findMany({
      where: { travelId: id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.travelDetail.findMany({ where: { travelId: id }, orderBy: { dayNumber: "asc" } }),
  ]);
  if (!travel) throw notFound("Аялал олдсонгүй");
  return {
    ...travel,
    createdAt: travel.createdAt.toISOString(),
    updatedAt: travel.updatedAt.toISOString(),
    departures: departures.map((row) => ({
      id: row.id,
      departureDate: dateOnly(row.departureDate),
      returnDate: dateOnly(row.returnDate),
      transportType: row.transportType,
      unitPriceMinor: safeMoney(row.unitPriceMinor),
      capacity: row.capacity,
      isBookingOpen: row.isBookingOpen,
      version: row.version,
    })),
    sections: sections.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      titleEn: row.titleEn,
      descriptionEn: row.descriptionEn,
      titleZh: row.titleZh,
      descriptionZh: row.descriptionZh,
      titleKo: row.titleKo,
      descriptionKo: row.descriptionKo,
      mapImage: normalizeLegacyTravelFileUrl(row.mapImage),
      images: row.images.map((image) => normalizeLegacyTravelFileUrl(image) ?? image),
      sortOrder: row.sortOrder,
      version: row.version,
    })),
    details: details.map((row) => ({
      id: row.id,
      sectionId: row.sectionId,
      dayNumber: row.dayNumber,
      title: row.title,
      content: row.content,
      titleEn: row.titleEn,
      contentEn: row.contentEn,
      titleZh: row.titleZh,
      contentZh: row.contentZh,
      titleKo: row.titleKo,
      contentKo: row.contentKo,
      images: row.images.map((image) => normalizeLegacyTravelFileUrl(image) ?? image),
      version: row.version,
    })),
  };
}

async function createChildren(
  tx: TravelTransaction,
  travelId: string,
  input: travelsContract.CreateAdminTravelInput,
) {
  for (const departure of input.departures) {
    if (departure._delete) continue;
    assertDates(departure.departureDate, departure.returnDate);
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
  for (const section of input.sections) {
    if (section._delete) continue;
    await tx.travelItinerarySection.create({
      data: {
        travelId,
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
      },
    });
  }
  for (const detail of input.details) {
    if (detail._delete) continue;
    if (detail.sectionId)
      throw badRequest("Шинэ аялал үүсгэхдээ хөтөлбөрийн бүлгийг дараа нь сонгоно уу");
    await tx.travelDetail.create({ data: { travelId, ...detailData(detail) } });
  }
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

export async function createAdminTravel(input: travelsContract.CreateAdminTravelInput) {
  const id = await prisma.$transaction(async (tx) => {
    const travel = await tx.travel.create({ data: travelData(input), select: { id: true } });
    await createChildren(tx, travel.id, input);
    return travel.id;
  });
  return getAdminTravel(id);
}

async function updateChildren(
  tx: TravelTransaction,
  travelId: string,
  input: travelsContract.UpdateAdminTravelInput,
  activeDepartureIds: Set<string>,
  activeSectionIds: Set<string>,
  activeDetailIds: Set<string>,
) {
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
    if (!activeDepartureIds.has(departure.id)) throw notFound("Аяллын гаралт олдсонгүй");
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
    if (!section.id) {
      if (!section._delete) {
        const created = await tx.travelItinerarySection.create({
          data: { travelId, ...sectionData(section) },
          select: { id: true },
        });
        activeSectionIds.add(created.id);
      }
      continue;
    }
    if (!activeSectionIds.has(section.id)) throw notFound("Хөтөлбөрийн бүлэг олдсонгүй");
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
      if (!detail._delete)
        await tx.travelDetail.create({ data: { travelId, ...detailData(detail) } });
      continue;
    }
    if (!activeDetailIds.has(detail.id)) throw notFound("Өдрийн хөтөлбөр олдсонгүй");
    const result = await tx.travelDetail.updateMany({
      where: { id: detail.id, travelId, version: detail.version },
      data: detail._delete
        ? { deletedAt: new Date(), version: { increment: 1 } }
        : { ...detailData(detail), version: { increment: 1 } },
    });
    if (result.count === 0) throw conflict("Өдрийн хөтөлбөр зэрэг өөрчлөгдсөн байна");
  }
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

export async function updateAdminTravel(id: string, input: travelsContract.UpdateAdminTravelInput) {
  const [before, departures, sections, details] = await Promise.all([
    getAdminTravel(id),
    prisma.travelDeparture.findMany({ where: { travelId: id }, select: { id: true } }),
    prisma.travelItinerarySection.findMany({ where: { travelId: id }, select: { id: true } }),
    prisma.travelDetail.findMany({ where: { travelId: id }, select: { id: true } }),
  ]);
  await prisma.$transaction(async (tx) => {
    const result = await tx.travel.updateMany({
      where: { id, version: input.version },
      data: { ...travelData(input), version: { increment: 1 } },
    });
    if (result.count === 0)
      throw conflict("Аялал зэрэг өөрчлөгдсөн байна. Жагсаалтаа шинэчилнэ үү.");
    await updateChildren(
      tx,
      id,
      input,
      new Set(departures.map((departure) => departure.id)),
      new Set(sections.map((section) => section.id)),
      new Set(details.map((detail) => detail.id)),
    );
  });
  return { travel: await getAdminTravel(id), before };
}

export async function deleteAdminTravel(id: string) {
  const existing = await prisma.travel.findFirst({ where: { id }, select: { id: true } });
  if (!existing) throw notFound("Аялал олдсонгүй");
  await prisma.travel.update({
    where: { id },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  });
}
