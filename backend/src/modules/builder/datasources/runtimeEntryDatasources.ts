import type {
  BuilderRuntimeAdapters,
  BuilderRuntimeTableAdapter,
  RuntimeEntryAudit,
  RuntimeEntryMutationResult,
} from "@winu/builder-backend/runtime";
import {
  createBuilderRuntimeAdapters,
  createGenericRuntimeAdapters,
} from "@winu/builder-backend/runtime";
import { type builder as builderContract, products as productsContract } from "@winu/contracts";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { changedFields } from "@/modules/audit/writeAudit";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "@/modules/products/productService";
import { genericRuntimeRepository } from "../repositories/genericRuntimeRepository";
import {
  builderBadRequest,
  builderConflict,
  builderErrors,
  builderNotFound,
} from "../shared/builderErrors";
import { toEntryDto } from "../shared/builderMapper";

const PRODUCT_STATUS_VALUES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
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

const genericRuntimeAdapters = createGenericRuntimeAdapters({
  repository: genericRuntimeRepository,
  errors: builderErrors,
});

function isBlank(value: unknown) {
  return value === null || value === undefined || value === "";
}

function optionalText(values: Record<string, unknown>, key: string) {
  const value = values[key];
  if (isBlank(value)) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function requiredText(values: Record<string, unknown>, key: string, label: string) {
  const value = optionalText(values, key);
  if (!value) throw builderBadRequest(`${label} талбар заавал бөглөгдөнө`);
  return value;
}

function requiredInteger(values: Record<string, unknown>, key: string, label: string) {
  const value = values[key];
  if (isBlank(value)) throw builderBadRequest(`${label} талбар заавал бөглөгдөнө`);
  const number = Number(value);
  if (!Number.isInteger(number)) throw builderBadRequest(`${label} талбар бүхэл тоо байх ёстой`);
  return number;
}

function optionalEnum<const T extends readonly string[]>(
  values: Record<string, unknown>,
  key: string,
  allowed: T,
  fallback: T[number],
): T[number] {
  const value = values[key];
  if (isBlank(value)) return fallback;
  const normalized = String(value);
  if (!(allowed as readonly string[]).includes(normalized)) {
    throw builderBadRequest(`${key} талбарын утга буруу байна`);
  }
  return normalized as T[number];
}

function productValues(values: Record<string, unknown>) {
  return productsContract.createProductSchema.parse({
    name: requiredText(values, "name", "Нэр"),
    slug: requiredText(values, "slug", "Slug"),
    description: optionalText(values, "description"),
    priceMinor: requiredInteger(values, "priceMinor", "Үнэ"),
    status: optionalEnum(values, "status", PRODUCT_STATUS_VALUES, "DRAFT"),
    imageUrl: optionalText(values, "imageUrl"),
  });
}

function productEntry(
  viewId: string,
  row: productsContract.Product & { updatedAt?: Date | string | null },
) {
  return toEntryDto({
    id: row.id,
    viewId,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? row.createdAt,
    values: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      priceMinor: row.priceMinor,
      currency: row.currency,
      status: row.status,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
    },
  });
}

function userEntry(
  viewId: string,
  row: {
    id: string;
    email: string;
    name: string;
    status: string;
    roleId: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  },
) {
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

function userAuditValues(row: Parameters<typeof userEntry>[1]) {
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
  if (!role) throw builderBadRequest("Role олдсонгүй");
}

export async function listProductRuntimeEntries(
  viewId: string,
  query: builderContract.ListBuilderViewEntriesQuery,
): Promise<builderContract.ListBuilderViewEntriesResponse> {
  const result = await listProducts(
    productsContract.listProductsQuerySchema.parse({
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
      search: query.search,
    }),
  );
  return {
    items: result.items.map((row) => productEntry(viewId, row)),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export async function createProductRuntimeEntry(
  viewId: string,
  values: Record<string, unknown>,
): Promise<RuntimeEntryMutationResult> {
  const created = await createProduct(productValues(values));
  return {
    entry: productEntry(viewId, created),
    audit: {
      resource: "product",
      resourceId: created.id,
      meta: { viewId, name: created.name, slug: created.slug },
    },
  };
}

export async function updateProductRuntimeEntry(
  viewId: string,
  id: string,
  input: builderContract.UpdateBuilderViewEntryInput,
): Promise<RuntimeEntryMutationResult> {
  const result = await updateProduct(id, {
    ...productValues(input.values),
    version: input.version,
  });
  return {
    entry: productEntry(viewId, result.product),
    audit: {
      resource: "product",
      resourceId: result.product.id,
      meta: {
        viewId,
        changes: changedFields({ ...result.before }, { ...result.product }),
      },
    },
  };
}

export async function deleteProductRuntimeEntry(
  id: string,
  viewId: string,
): Promise<RuntimeEntryAudit> {
  await deleteProduct(id);
  return { resource: "product", resourceId: id, meta: { viewId } };
}

export async function listUserRuntimeEntries(
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

export async function createUserRuntimeEntry(
  _viewId: string,
  _values: Record<string, unknown>,
): Promise<RuntimeEntryMutationResult> {
  throw builderBadRequest(
    "Хэрэглэгчийг Builder runtime-аас шууд үүсгэхгүй. /users/invite урсгалаар урьж үүсгэнэ.",
  );
}

export async function updateUserRuntimeEntry(
  viewId: string,
  id: string,
  input: builderContract.UpdateBuilderViewEntryInput,
): Promise<RuntimeEntryMutationResult> {
  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: USER_SELECT,
  });
  if (!existing) throw builderNotFound("Хэрэглэгч олдсонгүй");

  const values = input.values;
  const email = requiredText(values, "email", "И-мэйл").toLowerCase();
  const clash = await prisma.user.findFirst({
    where: { email, deletedAt: null, NOT: { id } },
    select: { id: true },
  });
  if (clash) throw builderBadRequest("Энэ и-мэйл аль хэдийн бүртгэлтэй байна");

  const roleId = optionalText(values, "roleId");
  await assertRole(roleId);

  const result = await prisma.user.updateMany({
    where: { id, deletedAt: null, version: input.version },
    data: {
      email,
      name: requiredText(values, "name", "Нэр"),
      status: optionalEnum(values, "status", USER_STATUS_VALUES, "INVITED"),
      roleId,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw builderConflict(
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

export async function deleteUserRuntimeEntry(
  id: string,
  viewId: string,
): Promise<RuntimeEntryAudit> {
  const { count } = await prisma.user.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), status: "DISABLED", version: { increment: 1 } },
  });
  if (count === 0) throw builderNotFound("Хэрэглэгч олдсонгүй");
  return { resource: "user", resourceId: id, meta: { viewId } };
}

const genericFallbackRuntimeAdapter: Pick<BuilderRuntimeAdapters, "createEntry" | "listEntries"> = {
  listEntries({ tableName, list, viewId, query }) {
    return genericRuntimeAdapters.listGenericRuntimeEntries(tableName, list, viewId, query);
  },

  createEntry({ tableName, form, viewId, values }) {
    return genericRuntimeAdapters.createGenericRuntimeEntry(tableName, form, viewId, values);
  },
};

const productRuntimeAdapter: BuilderRuntimeTableAdapter = {
  listEntries({ viewId, query }) {
    return listProductRuntimeEntries(viewId, query);
  },

  createEntry({ viewId, values }) {
    return createProductRuntimeEntry(viewId, values);
  },

  updateEntry({ viewId, id, input }) {
    return updateProductRuntimeEntry(viewId, id, input);
  },

  deleteEntry({ viewId, id }) {
    return deleteProductRuntimeEntry(id, viewId);
  },
};

const userRuntimeAdapter: BuilderRuntimeTableAdapter = {
  listEntries({ viewId, query }) {
    return listUserRuntimeEntries(viewId, query);
  },

  createEntry({ viewId, values }) {
    return createUserRuntimeEntry(viewId, values);
  },

  updateEntry({ viewId, id, input }) {
    return updateUserRuntimeEntry(viewId, id, input);
  },

  deleteEntry({ viewId, id }) {
    return deleteUserRuntimeEntry(id, viewId);
  },
};

export const starterBuilderRuntimeAdapters: BuilderRuntimeAdapters = createBuilderRuntimeAdapters({
  generic: genericFallbackRuntimeAdapter,
  errors: builderErrors,
  tables: {
    products: productRuntimeAdapter,
    users: userRuntimeAdapter,
  },
});
