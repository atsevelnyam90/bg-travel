import { toEntryDto } from "@duke333/builder-backend/metadata";
import type {
  BuilderRuntimeTableAdapter,
  RuntimeEntryAudit,
  RuntimeEntryMutationResult,
} from "@duke333/builder-backend/runtime";
import type { builder as builderContract } from "@duke333/builder-contracts";
import type { Prisma } from "@/generated/prisma/client";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { changedFields } from "@/modules/audit/writeAudit";
import { optionalEnum, optionalText, requiredText } from "@/modules/builder/runtimeValues";

const USER_STATUS_VALUES = ["ACTIVE", "INVITED", "DISABLED"] as const;
const USER_ENTRY_SORTABLE = ["name", "email", "status", "createdAt", "updatedAt"] as const;
const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  status: true,
  roleId: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

type UserRuntimeRow = {
  id: string;
  email: string;
  name: string;
  status: string;
  roleId: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

function userEntry(viewId: string, row: UserRuntimeRow) {
  return toEntryDto({
    id: row.id,
    viewId,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    values: {
      id: row.id,
      email: row.email,
      name: row.name,
      status: row.status,
      roleId: row.roleId,
      createdAt: row.createdAt.toISOString(),
    },
  });
}

function userAuditValues(row: UserRuntimeRow) {
  return {
    email: row.email,
    name: row.name,
    status: row.status,
    roleId: row.roleId,
  };
}

async function assertRole(roleId: string | null) {
  if (!roleId) return;
  const role = await prisma.role.findUnique({ where: { id: roleId }, select: { id: true } });
  if (!role) throw badRequest("Role олдсонгүй");
}

async function listUserRuntimeEntries(
  viewId: string,
  query: builderContract.ListBuilderViewEntriesQuery,
): Promise<builderContract.ListBuilderViewEntriesResponse> {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const desc = query.sort?.startsWith("-") ?? true;
  const requestedSort = desc ? query.sort?.slice(1) : query.sort;
  const sortField = USER_ENTRY_SORTABLE.includes(
    requestedSort as (typeof USER_ENTRY_SORTABLE)[number],
  )
    ? (requestedSort as (typeof USER_ENTRY_SORTABLE)[number])
    : "createdAt";

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [sortField]: desc ? "desc" : "asc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: USER_SELECT,
    }),
  ]);

  return {
    items: rows.map((row) => userEntry(viewId, row)),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

async function updateUserRuntimeEntry(
  viewId: string,
  id: string,
  input: builderContract.UpdateBuilderViewEntryInput,
): Promise<RuntimeEntryMutationResult> {
  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: USER_SELECT,
  });
  if (!existing) throw notFound("Хэрэглэгч олдсонгүй");

  const email = requiredText(input.values, "email", "И-мэйл").toLowerCase();
  const clash = await prisma.user.findFirst({
    where: { email, deletedAt: null, NOT: { id } },
    select: { id: true },
  });
  if (clash) throw badRequest("Энэ и-мэйл аль хэдийн бүртгэлтэй байна");

  const roleId = optionalText(input.values, "roleId");
  await assertRole(roleId);

  const result = await prisma.user.updateMany({
    where: { id, deletedAt: null, version: input.version },
    data: {
      email,
      name: requiredText(input.values, "name", "Нэр"),
      status: optionalEnum(input.values, "status", USER_STATUS_VALUES, "INVITED"),
      roleId,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw conflict(
      "Энэ хэрэглэгчийг өөр хэрэглэгч зэрэг заслаа. Хуудсыг шинэчлээд дахин оролдоно уу.",
    );
  }

  const updated = await prisma.user.findFirstOrThrow({ where: { id }, select: USER_SELECT });
  return {
    entry: userEntry(viewId, updated),
    audit: {
      resource: "user",
      resourceId: updated.id,
      meta: {
        viewId,
        changes: changedFields(userAuditValues(existing), userAuditValues(updated)),
      },
    },
  };
}

async function deleteUserRuntimeEntry(id: string, viewId: string): Promise<RuntimeEntryAudit> {
  const { count } = await prisma.user.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), status: "DISABLED", version: { increment: 1 } },
  });
  if (count === 0) throw notFound("Хэрэглэгч олдсонгүй");
  return { resource: "user", resourceId: id, meta: { viewId } };
}

export const userBuilderRuntimeAdapter: BuilderRuntimeTableAdapter = {
  listEntries: ({ viewId, query }) => listUserRuntimeEntries(viewId, query),
  createEntry: async () => {
    throw badRequest(
      "Хэрэглэгчийг Builder runtime-аас шууд үүсгэхгүй. /users/invite урсгалаар урьж үүсгэнэ.",
    );
  },
  updateEntry: ({ viewId, id, input }) => updateUserRuntimeEntry(viewId, id, input),
  deleteEntry: ({ viewId, id }) => deleteUserRuntimeEntry(id, viewId),
};
