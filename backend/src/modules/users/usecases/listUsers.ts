import type { users as usersContract } from "@winu/contracts";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Query = usersContract.ListUsersQuery;
type Result = usersContract.ListUsersResponse;

// Аль баганаар эрэмбэлэхийг ил зөвшөөрнө — клиентээс ирсэн мөрийг Prisma-д
// шууд дамжуулбал дурын талбараар эрэмбэлэх/мэдээлэл тандах эрсдэлтэй.
const SORTABLE = {
  name: "name",
  email: "email",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

function buildOrderBy(sort?: string): Prisma.UserOrderByWithRelationInput {
  if (!sort) return { createdAt: "desc" };

  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  const column = SORTABLE[field as keyof typeof SORTABLE];

  if (!column) return { createdAt: "desc" };
  return { [column]: desc ? "desc" : "asc" };
}

export async function listUsers(query: Query): Promise<Result> {
  const where: Prisma.UserWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  // Тоолол болон хуудсыг зэрэг — хоёр дараалсан query хүлээхгүй.
  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
      },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      status: row.status,
      roleId: row.roleId,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}
