import { SYSTEM_ROLES } from "@winu/contracts";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/modules/auth/passwordService";

// Байгууллага (ганц мөр), системийн role-ууд, owner хэрэглэгч.
// Дахин ажиллуулахад аюулгүй (upsert).

const ORG_SLUG = process.env.SEED_ORG_SLUG ?? "demo";
const ORG_NAME = process.env.SEED_ORG_NAME ?? "Demo ХХК";
const OWNER_EMAIL = (process.env.SEED_OWNER_EMAIL ?? "owner@example.mn").toLowerCase();
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe123!";

const DEFAULT_PASSWORD = "ChangeMe123!";

const PRODUCT_FORM_ID = "11111111-1111-4111-8111-111111111111";
const PRODUCT_LIST_ID = "11111111-1111-4111-8111-111111111112";
const PRODUCT_VIEW_ID = "11111111-1111-4111-8111-111111111113";
const USER_FORM_ID = "22222222-2222-4222-8222-222222222221";
const USER_LIST_ID = "22222222-2222-4222-8222-222222222222";
const USER_VIEW_ID = "22222222-2222-4222-8222-222222222223";

const productFormSchema = {
  fields: [
    {
      key: "name",
      label: "Нэр",
      type: "text",
      required: true,
      triggers: [
        {
          event: "onChange",
          action: "/api/v1/builder-triggers/product-slug",
          enabled: true,
          debounceMs: 300,
          config: {},
        },
      ],
    },
    { key: "slug", label: "Slug", type: "text", required: true },
    { key: "description", label: "Тайлбар", type: "textarea", required: false },
    { key: "priceMinor", label: "Үнэ", type: "money", required: true },
    {
      key: "status",
      label: "Төлөв",
      type: "select",
      required: true,
      options: [
        { label: "Ноорог", value: "DRAFT" },
        { label: "Нийтэлсэн", value: "PUBLISHED" },
        { label: "Архив", value: "ARCHIVED" },
      ],
    },
    { key: "imageUrl", label: "Зургийн URL", type: "text", required: false },
  ],
};

async function seedBuilderDefinitions() {
  await prisma.builderDefinition.upsert({
    where: { id: PRODUCT_FORM_ID },
    update: { schema: productFormSchema, triggers: [] },
    create: {
      id: PRODUCT_FORM_ID,
      type: "form",
      title: "Product Form",
      description: "Бараа нэмэх, засах form.",
      source: { type: "dbTable", tableName: "products" },
      triggers: [],
      schema: productFormSchema,
    },
  });

  await prisma.builderDefinition.upsert({
    where: { id: PRODUCT_LIST_ID },
    update: { triggers: [] },
    create: {
      id: PRODUCT_LIST_ID,
      type: "list",
      title: "Product List",
      description: "Барааны grid/list баганууд.",
      source: { type: "dbTable", tableName: "products" },
      triggers: [],
      schema: {
        columns: [
          { key: "name", label: "Нэр", sortable: true, align: "left" },
          { key: "slug", label: "Slug", sortable: true, align: "left" },
          { key: "priceMinor", label: "Үнэ", sortable: true, align: "right" },
          { key: "status", label: "Төлөв", sortable: true, align: "left" },
        ],
      },
    },
  });

  await prisma.builderView.upsert({
    where: { id: PRODUCT_VIEW_ID },
    update: {},
    create: {
      id: PRODUCT_VIEW_ID,
      title: "Бараа",
      description: "Builder view-ээр дуудагдаж байгаа барааны CRUD.",
      formId: PRODUCT_FORM_ID,
      listId: PRODUCT_LIST_ID,
      permissionRead: "product:read",
      permissionWrite: "product:write",
      triggers: [],
    },
  });

  await prisma.builderDefinition.upsert({
    where: { id: USER_FORM_ID },
    update: { triggers: [] },
    create: {
      id: USER_FORM_ID,
      type: "form",
      title: "User Form",
      description: "Хэрэглэгч нэмэх, засах form.",
      source: { type: "dbTable", tableName: "users" },
      triggers: [],
      schema: {
        fields: [
          { key: "email", label: "И-мэйл", type: "text", required: true },
          { key: "name", label: "Нэр", type: "text", required: true },
          {
            key: "status",
            label: "Төлөв",
            type: "select",
            required: true,
            options: [
              { label: "Идэвхтэй", value: "ACTIVE" },
              { label: "Уригдсан", value: "INVITED" },
              { label: "Идэвхгүй", value: "DISABLED" },
            ],
          },
          { key: "roleId", label: "Role ID", type: "text", required: false },
        ],
      },
    },
  });

  await prisma.builderDefinition.upsert({
    where: { id: USER_LIST_ID },
    update: { triggers: [] },
    create: {
      id: USER_LIST_ID,
      type: "list",
      title: "User List",
      description: "Хэрэглэгчийн grid/list баганууд.",
      source: { type: "dbTable", tableName: "users" },
      triggers: [],
      schema: {
        columns: [
          { key: "name", label: "Нэр", sortable: true, align: "left" },
          { key: "email", label: "И-мэйл", sortable: true, align: "left" },
          { key: "status", label: "Төлөв", sortable: true, align: "left" },
        ],
      },
    },
  });

  await prisma.builderView.upsert({
    where: { id: USER_VIEW_ID },
    update: {},
    create: {
      id: USER_VIEW_ID,
      title: "Хэрэглэгч",
      description: "Builder view-ээр дуудагдаж байгаа хэрэглэгчийн жагсаалт.",
      formId: USER_FORM_ID,
      listId: USER_LIST_ID,
      permissionRead: "user:read",
      permissionWrite: "user:update",
      triggers: [],
    },
  });

  return { PRODUCT_VIEW_ID, USER_VIEW_ID };
}

async function main() {
  // Production-д default нууц үг ашиглахыг зөвшөөрөхгүй — seed нь ихэвчлэн
  // deploy pipeline-д ажилладаг тул энэ хамгаалалт заавал хэрэгтэй.
  if (process.env.NODE_ENV === "production" && OWNER_PASSWORD === DEFAULT_PASSWORD) {
    throw new Error(
      "Production-д SEED_OWNER_PASSWORD заавал өгнө үү (default нууц үг зөвшөөрөгдөхгүй).",
    );
  }

  const organization = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    update: {},
    create: { slug: ORG_SLUG, name: ORG_NAME },
  });

  // Системийн role-ууд — устгагдахгүй, эрхийн жагсаалт нь contracts-аас.
  // ⚠️ PERMISSIONS-д эрх нэмсний дараа энэ seed-ыг ДАХИН ажиллуулна,
  // эс тэгвэл DB дэх role хуучин жагсаалттай үлдэнэ.
  const roles: Record<string, string> = {};
  for (const [name, permissions] of Object.entries(SYSTEM_ROLES)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { permissions: [...permissions] },
      create: { name, permissions: [...permissions], isSystem: true },
    });
    roles[name] = role.id;
  }

  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { roleId: roles.owner },
    create: {
      email: OWNER_EMAIL,
      name: "Owner",
      passwordHash: await hashPassword(OWNER_PASSWORD),
      status: "ACTIVE",
      roleId: roles.owner,
    },
  });

  const views = await seedBuilderDefinitions();

  console.log(`✓ Байгууллага: ${organization.name} (${organization.slug})`);
  console.log(`✓ Role: ${Object.keys(roles).join(", ")}`);
  console.log(`✓ Owner: ${owner.email}`);
  console.log(`✓ Builder Product View: ${views.PRODUCT_VIEW_ID}`);
  console.log(`✓ Builder User View: ${views.USER_VIEW_ID}`);
  if (OWNER_PASSWORD === DEFAULT_PASSWORD) {
    console.log(`⚠️  Нууц үг default (${DEFAULT_PASSWORD}) — заавал соль.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
