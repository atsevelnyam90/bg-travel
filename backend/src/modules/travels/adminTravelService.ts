import type { travels as travelsContract } from "@winu/contracts";
import type { Prisma } from "@/generated/prisma/client";
import { conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { normalizeLegacyTravelFileUrl } from "@/modules/files/legacyTravelFiles";
import {
  createTravelChildren,
  loadTravelChildrenForUpdate,
  updateTravelChildren,
} from "./adminTravelChildren";

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

function safeMoney(value: bigint) {
  const number = Number(value);
  if (!Number.isSafeInteger(number))
    throw conflict("Мөнгөн дүн боловсруулах хэмжээнээс хэтэрсэн байна");
  return number;
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

export async function createAdminTravel(input: travelsContract.CreateAdminTravelInput) {
  const id = await prisma.$transaction(async (tx) => {
    const travel = await tx.travel.create({ data: travelData(input), select: { id: true } });
    await createTravelChildren(tx, travel.id, input);
    return travel.id;
  });
  return getAdminTravel(id);
}

export async function updateAdminTravel(id: string, input: travelsContract.UpdateAdminTravelInput) {
  const [before, children] = await Promise.all([
    getAdminTravel(id),
    loadTravelChildrenForUpdate(id),
  ]);
  await prisma.$transaction(async (tx) => {
    const result = await tx.travel.updateMany({
      where: { id, version: input.version },
      data: { ...travelData(input), version: { increment: 1 } },
    });
    if (result.count === 0)
      throw conflict("Аялал зэрэг өөрчлөгдсөн байна. Жагсаалтаа шинэчилнэ үү.");
    await updateTravelChildren(tx, id, input, children);
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
