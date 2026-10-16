import { toEntryDto } from "@duke333/builder-backend/metadata";
import type {
  BuilderRuntimeTableAdapter,
  RuntimeEntryAudit,
  RuntimeEntryMutationResult,
} from "@duke333/builder-backend/runtime";
import type { builder as builderContract } from "@duke333/builder-contracts";
import { products as productsContract } from "@winu/contracts";
import { changedFields } from "@/modules/audit/writeAudit";
import {
  optionalEnum,
  optionalInteger,
  optionalText,
  requiredInteger,
  requiredText,
} from "@/modules/builder/runtimeValues";
import { createProduct, deleteProduct, listProducts, updateProduct } from "./productService";

const PRODUCT_STATUS_VALUES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function productValues(values: Record<string, unknown>) {
  return productsContract.createProductSchema.parse({
    name: requiredText(values, "name", "Нэр"),
    slug: requiredText(values, "slug", "Slug"),
    description: optionalText(values, "description"),
    priceMinor: requiredInteger(values, "priceMinor", "Үнэ"),
    discountMinor: optionalInteger(values, "discountMinor", "Хөнгөлөлт"),
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
      discountMinor: row.discountMinor,
      currency: row.currency,
      status: row.status,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
    },
  });
}

async function listProductRuntimeEntries(
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

async function createProductRuntimeEntry(
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

async function updateProductRuntimeEntry(
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

async function deleteProductRuntimeEntry(id: string, viewId: string): Promise<RuntimeEntryAudit> {
  await deleteProduct(id);
  return { resource: "product", resourceId: id, meta: { viewId } };
}

export const productBuilderRuntimeAdapter: BuilderRuntimeTableAdapter = {
  listEntries: ({ viewId, query }) => listProductRuntimeEntries(viewId, query),
  createEntry: ({ viewId, values }) => createProductRuntimeEntry(viewId, values),
  updateEntry: ({ viewId, id, input }) => updateProductRuntimeEntry(viewId, id, input),
  deleteEntry: ({ viewId, id }) => deleteProductRuntimeEntry(id, viewId),
};
