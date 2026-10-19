import { SYSTEM_ROLES } from "@winu/contracts";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/modules/auth/passwordService";
import { ORDER_CONFIRM_PAID_TRIGGER } from "../src/modules/orders/triggers";
import {
  PRODUCT_DISCOUNT_FIELD_TRIGGER,
  PRODUCT_SLUG_FIELD_TRIGGER,
} from "../src/modules/products/triggers";
import { USER_TEST_BEFORE_DELETE_TRIGGER } from "../src/modules/users/triggers";

// Байгууллага (ганц мөр), системийн role-ууд, owner хэрэглэгч.
// Дахин ажиллуулахад аюулгүй (upsert).

const ORG_SLUG = process.env.SEED_ORG_SLUG ?? "demo";
const ORG_NAME = process.env.SEED_ORG_NAME ?? "Demo ХХК";
const OWNER_EMAIL = (process.env.SEED_OWNER_EMAIL ?? "owner@example.mn").toLowerCase();
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe123!";

const DEFAULT_PASSWORD = "password1";

const PRODUCT_FORM_ID = "11111111-1111-4111-8111-111111111111";
const PRODUCT_LIST_ID = "11111111-1111-4111-8111-111111111112";
const PRODUCT_VIEW_ID = "11111111-1111-4111-8111-111111111113";
const USER_FORM_ID = "22222222-2222-4222-8222-222222222221";
const USER_LIST_ID = "22222222-2222-4222-8222-222222222222";
const USER_VIEW_ID = "22222222-2222-4222-8222-222222222223";
const ORDER_FORM_ID = "33333333-3333-4333-8333-333333333331";
const ORDER_LIST_ID = "33333333-3333-4333-8333-333333333332";
const ORDER_VIEW_ID = "33333333-3333-4333-8333-333333333333";

const userListTriggers = [
  {
    event: "beforeDelete",
    action: "callApi",
    enabled: true,
    blocking: true,
    config: { route: USER_TEST_BEFORE_DELETE_TRIGGER },
  },
];

const orderFormTriggers = [
  {
    event: "beforeCreate",
    action: "callApi",
    enabled: true,
    blocking: true,
    config: { route: ORDER_CONFIRM_PAID_TRIGGER },
  },
  {
    event: "beforeUpdate",
    action: "callApi",
    enabled: true,
    blocking: true,
    config: { route: ORDER_CONFIRM_PAID_TRIGGER },
  },
];

const productFormSchema = {
  presentation: "drawer",
  fields: [
    {
      key: "name",
      label: "Нэр",
      type: "text",
      required: true,
      triggers: [
        {
          event: "onChange",
          action: PRODUCT_SLUG_FIELD_TRIGGER,
          enabled: true,
          debounceMs: 300,
          config: {},
        },
      ],
    },
    { key: "slug", label: "Slug", type: "text", required: true },
    { key: "description", label: "Тайлбар", type: "textarea", required: false },
    {
      key: "priceMinor",
      label: "Үнэ",
      type: "money",
      required: true,
      triggers: [
        {
          event: "onChange",
          action: PRODUCT_DISCOUNT_FIELD_TRIGGER,
          enabled: true,
          debounceMs: 300,
          config: {},
        },
      ],
    },
    {
      key: "discountMinor",
      label: "10% хөнгөлөлт",
      type: "money",
      required: false,
      disabled: true,
    },
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
  layout: {
    groups: [
      {
        id: "main",
        title: "Үндсэн мэдээлэл",
        columns: 12,
        fields: [
          { key: "name", span: 6 },
          { key: "slug", span: 6 },
          { key: "description", span: 12 },
        ],
      },
      {
        id: "pricing",
        title: "Үнэ",
        columns: 12,
        fields: [
          { key: "priceMinor", span: 4 },
          { key: "discountMinor", span: 4 },
          { key: "status", span: 4 },
        ],
      },
      {
        id: "media",
        title: "Медиа",
        columns: 12,
        fields: [{ key: "imageUrl", span: 12 }],
      },
    ],
  },
};

const userFormSchema = {
  presentation: "drawer",
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
  layout: {
    groups: [
      {
        id: "main",
        title: "Үндсэн мэдээлэл",
        columns: 12,
        fields: [
          { key: "email", span: 6 },
          { key: "name", span: 6 },
          { key: "status", span: 6 },
          { key: "roleId", span: 6 },
        ],
      },
    ],
  },
};

const orderFormSchema = {
  presentation: "drawer",
  fields: [
    { key: "public_order_id", label: "Захиалгын дугаар", type: "text", required: true },
    { key: "first_name", label: "Нэр", type: "text", required: true },
    { key: "last_name", label: "Овог", type: "text", required: true },
    { key: "address", label: "Хаяг", type: "textarea", required: false },
    { key: "phone", label: "Утас", type: "text", required: true },
    { key: "email", label: "И-мэйл", type: "text", required: true },
    { key: "service_code", label: "Үйлчилгээний код", type: "text", required: true },
    {
      key: "transport_type",
      label: "Тээврийн төрөл",
      type: "select",
      required: false,
      options: [
        { label: "Газраар", value: "GROUND" },
        { label: "Шууд нислэг", value: "DIRECT_FLIGHT" },
      ],
    },
    { key: "travel_date", label: "Аяллын огноо", type: "date", required: true },
    { key: "traveler_count", label: "Зорчигчийн тоо", type: "number", required: true },
    { key: "service_name_snapshot", label: "Үйлчилгээний нэр", type: "text", required: true },
    { key: "transport_name_snapshot", label: "Тээврийн нэр", type: "text", required: false },
    { key: "unit_price_minor", label: "Нэгж үнэ", type: "money", required: true },
    { key: "total_price_minor", label: "Нийт үнэ", type: "money", required: true },
    {
      key: "status",
      label: "Төлөв",
      type: "select",
      required: true,
      options: [
        { label: "Баталгаажаагүй", value: "AWAITING_PAYMENT" },
        { label: "Баталгаажсан", value: "PAID" },
      ],
    },
    {
      key: "confirmed_by_user_id",
      label: "Баталгаажуулсан хэрэглэгч ID",
      type: "text",
      required: false,
      hidden: true,
      disabled: true,
    },
    {
      key: "confirmed_at",
      label: "Баталгаажуулсан огноо",
      type: "date",
      required: false,
      hidden: true,
      disabled: true,
    },
    { key: "idempotency_key", label: "Idempotency key", type: "text", required: true },
  ],
  layout: {
    groups: [
      {
        id: "customer",
        title: "Захиалагч",
        columns: 12,
        fields: [
          { key: "public_order_id", span: 4 },
          { key: "first_name", span: 4 },
          { key: "last_name", span: 4 },
          { key: "address", span: 12 },
          { key: "phone", span: 6 },
          { key: "email", span: 6 },
        ],
      },
      {
        id: "service",
        title: "Аялал",
        columns: 12,
        fields: [
          { key: "service_code", span: 4 },
          { key: "transport_type", span: 4 },
          { key: "travel_date", span: 4 },
          { key: "traveler_count", span: 4 },
          { key: "service_name_snapshot", span: 4 },
          { key: "transport_name_snapshot", span: 4 },
        ],
      },
      {
        id: "payment",
        title: "Төлбөр",
        columns: 12,
        fields: [
          { key: "unit_price_minor", span: 4 },
          { key: "total_price_minor", span: 4 },
          { key: "status", span: 4 },
          { key: "confirmed_by_user_id", span: 6 },
          { key: "confirmed_at", span: 6 },
          { key: "idempotency_key", span: 12 },
        ],
      },
    ],
  },
};

async function seedBuilderDefinitions() {
  await prisma.builderDefinition.upsert({
    where: { id: PRODUCT_FORM_ID },
    update: {
      source: { type: "dbTable", tableName: "products" },
      schema: productFormSchema,
      triggers: [],
    },
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
    update: { source: { type: "dbTable", tableName: "products" }, triggers: [] },
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
          { key: "discountMinor", label: "Хөнгөлөлт", sortable: true, align: "right" },
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
    update: {
      source: { type: "dbTable", tableName: "users" },
      schema: userFormSchema,
      triggers: [],
    },
    create: {
      id: USER_FORM_ID,
      type: "form",
      title: "User Form",
      description: "Хэрэглэгч нэмэх, засах form.",
      source: { type: "dbTable", tableName: "users" },
      triggers: [],
      schema: userFormSchema,
    },
  });

  await prisma.builderDefinition.upsert({
    where: { id: USER_LIST_ID },
    update: { source: { type: "dbTable", tableName: "users" }, triggers: userListTriggers },
    create: {
      id: USER_LIST_ID,
      type: "list",
      title: "User List",
      description: "Хэрэглэгчийн grid/list баганууд.",
      source: { type: "dbTable", tableName: "users" },
      triggers: userListTriggers,
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

  await prisma.builderDefinition.upsert({
    where: { id: ORDER_FORM_ID },
    update: {
      source: { type: "dbTable", tableName: "orders" },
      schema: orderFormSchema,
      triggers: orderFormTriggers,
    },
    create: {
      id: ORDER_FORM_ID,
      type: "form",
      title: "Order Form",
      description: "Захиалга нэмэх, засах form.",
      source: { type: "dbTable", tableName: "orders" },
      triggers: orderFormTriggers,
      schema: orderFormSchema,
    },
  });

  await prisma.builderDefinition.upsert({
    where: { id: ORDER_LIST_ID },
    update: {
      source: { type: "dbTable", tableName: "orders" },
      triggers: [],
      schema: {
        columns: [
          { key: "public_order_id", label: "Дугаар", sortable: true, align: "left" },
          { key: "first_name", label: "Нэр", sortable: true, align: "left" },
          { key: "last_name", label: "Овог", sortable: true, align: "left" },
          { key: "phone", label: "Утас", sortable: true, align: "left" },
          {
            key: "service_name_snapshot",
            label: "Аялал",
            sortable: true,
            align: "left",
          },
          { key: "transport_type", label: "Тээвэр", sortable: true, align: "left" },
          { key: "travel_date", label: "Аяллын огноо", sortable: true, align: "left" },
          { key: "traveler_count", label: "Зорчигч", sortable: true, align: "right" },
          { key: "total_price_minor", label: "Нийт үнэ", sortable: true, align: "right" },
          { key: "status", label: "Төлөв", sortable: true, align: "left" },
          { key: "created_at", label: "Үүссэн", sortable: true, align: "left" },
        ],
      },
    },
    create: {
      id: ORDER_LIST_ID,
      type: "list",
      title: "Order List",
      description: "Захиалгын grid/list баганууд.",
      source: { type: "dbTable", tableName: "orders" },
      triggers: [],
      schema: {
        columns: [
          { key: "public_order_id", label: "Дугаар", sortable: true, align: "left" },
          { key: "first_name", label: "Нэр", sortable: true, align: "left" },
          { key: "last_name", label: "Овог", sortable: true, align: "left" },
          { key: "phone", label: "Утас", sortable: true, align: "left" },
          {
            key: "service_name_snapshot",
            label: "Аялал",
            sortable: true,
            align: "left",
          },
          { key: "transport_type", label: "Тээвэр", sortable: true, align: "left" },
          { key: "travel_date", label: "Аяллын огноо", sortable: true, align: "left" },
          { key: "traveler_count", label: "Зорчигч", sortable: true, align: "right" },
          { key: "total_price_minor", label: "Нийт үнэ", sortable: true, align: "right" },
          { key: "status", label: "Төлөв", sortable: true, align: "left" },
          { key: "created_at", label: "Үүссэн", sortable: true, align: "left" },
        ],
      },
    },
  });

  await prisma.builderView.upsert({
    where: { id: ORDER_VIEW_ID },
    update: {
      title: "Захиалга",
      description: "Builder view-ээр дуудагдаж байгаа захиалгын CRUD.",
      formId: ORDER_FORM_ID,
      listId: ORDER_LIST_ID,
      permissionRead: "order:read",
      permissionWrite: "order:write",
      triggers: [],
    },
    create: {
      id: ORDER_VIEW_ID,
      title: "Захиалга",
      description: "Builder view-ээр дуудагдаж байгаа захиалгын CRUD.",
      formId: ORDER_FORM_ID,
      listId: ORDER_LIST_ID,
      permissionRead: "order:read",
      permissionWrite: "order:write",
      triggers: [],
    },
  });

  return { PRODUCT_VIEW_ID, USER_VIEW_ID, ORDER_VIEW_ID };
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
  console.log(`✓ Builder Order View: ${views.ORDER_VIEW_ID}`);
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
