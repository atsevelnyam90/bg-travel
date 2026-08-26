import type { products as productsContract } from "@winu/contracts";
import type { Prisma } from "@/generated/prisma/client";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const SORTABLE = { name: "name", priceMinor: "priceMinor", createdAt: "createdAt" } as const;

function buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
  if (!sort) return { createdAt: "desc" };
  const desc = sort.startsWith("-");
  const column = SORTABLE[(desc ? sort.slice(1) : sort) as keyof typeof SORTABLE];
  return column ? { [column]: desc ? "desc" : "asc" } : { createdAt: "desc" };
}

const toDto = (row: {
  id: string;
  version: number;
  slug: string;
  name: string;
  description: string | null;
  priceMinor: number;
  currency: string;
  status: productsContract.ProductStatus;
  imageUrl: string | null;
  createdAt: Date;
}): productsContract.Product => ({ ...row, createdAt: row.createdAt.toISOString() });

const SELECT = {
  id: true,
  version: true,
  slug: true,
  name: true,
  description: true,
  priceMinor: true,
  currency: true,
  status: true,
  imageUrl: true,
  createdAt: true,
} as const;

export async function listProducts(
  query: productsContract.ListProductsQuery,
): Promise<productsContract.ListProductsResponse> {
  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: SELECT,
    }),
  ]);

  return { items: rows.map(toDto), total, page: query.page, pageSize: query.pageSize };
}

export async function createProduct(
  input: productsContract.CreateProductInput,
): Promise<productsContract.Product> {
  const existing = await prisma.product.findFirst({
    where: { slug: input.slug, deletedAt: null },
    select: { id: true },
  });
  if (existing) throw badRequest("Энэ slug аль хэдийн ашиглагдсан байна");

  const created = await prisma.product.create({
    data: {
      ...input,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
    },
    select: SELECT,
  });
  return toDto(created);
}

export async function updateProduct(
  id: string,
  input: productsContract.UpdateProductInput,
): Promise<{ product: productsContract.Product; before: productsContract.Product }> {
  const existing = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    select: SELECT,
  });
  if (!existing) throw notFound("Бараа олдсонгүй");

  const clash = await prisma.product.findFirst({
    where: { slug: input.slug, deletedAt: null, NOT: { id } },
    select: { id: true },
  });
  if (clash) throw badRequest("Энэ slug аль хэдийн ашиглагдсан байна");

  // Optimistic locking: клиентийн уншсан хувилбар DB-тэй таарч байж л бичнэ.
  // Хоёр хүн нэг мөрийг зэрэг заслаа гэхэд сүүлд бичсэн нь нөгөөг ЧИМЭЭГҮЙ
  // дарахгүй — 409 буцаана.
  const { version, ...rest } = input;
  const result = await prisma.product.updateMany({
    where: { id, deletedAt: null, version },
    data: {
      ...rest,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw conflict("Энэ барааг өөр хэрэглэгч зэрэг заслаа. Хуудсыг шинэчлээд дахин оролдоно уу.");
  }

  const updated = await prisma.product.findFirstOrThrow({ where: { id }, select: SELECT });
  return { product: toDto(updated), before: toDto(existing) };
}

export async function deleteProduct(id: string): Promise<void> {
  // Зөөлөн устгал — захиалгын түүх барааны нэрийг заасаар байх ёстой.
  const { count } = await prisma.product.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
  if (count === 0) throw notFound("Бараа олдсонгүй");
}

// ─── Public ─────────────────────────────────────────────────────────────────
// Нэвтрэлт шаардахгүй. ЗӨВХӨН PUBLISHED, зөвхөн public талбарууд.

export async function listPublicProducts(
  query: productsContract.ListProductsQuery,
): Promise<productsContract.ListPublicProductsResponse> {
  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    status: "PUBLISHED",
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      // status, createdAt-ыг public талд гаргахгүй.
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        priceMinor: true,
        currency: true,
        imageUrl: true,
      },
    }),
  ]);

  return { items: rows, total, page: query.page, pageSize: query.pageSize };
}

export async function getPublicProduct(slug: string): Promise<productsContract.PublicProduct> {
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      priceMinor: true,
      currency: true,
      imageUrl: true,
    },
  });
  if (!product) throw notFound("Бараа олдсонгүй");
  return product;
}
