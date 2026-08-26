import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  api,
  bearer,
  createUser,
  login,
  PREFIX,
  resetDatabase,
  seedOrganization,
  seedRoles,
} from "@/test/helpers";

const PRODUCT_FORM_ID = "33333333-3333-4333-8333-333333333331";
const PRODUCT_LIST_ID = "33333333-3333-4333-8333-333333333332";
const PRODUCT_VIEW_ID = "33333333-3333-4333-8333-333333333333";

async function seedProductBuilderView() {
  await prisma.builderDefinition.createMany({
    data: [
      {
        id: PRODUCT_FORM_ID,
        type: "form",
        title: "Product Form",
        source: { type: "dbTable", tableName: "products" },
        schema: {
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
            { key: "priceMinor", label: "Үнэ", type: "money", required: true },
            {
              key: "status",
              label: "Төлөв",
              type: "select",
              required: true,
              options: [{ label: "Нийтэлсэн", value: "PUBLISHED" }],
            },
          ],
        },
      },
      {
        id: PRODUCT_LIST_ID,
        type: "list",
        title: "Product List",
        source: { type: "dbTable", tableName: "products" },
        schema: {
          columns: [
            { key: "name", label: "Нэр", sortable: true, align: "left" },
            { key: "priceMinor", label: "Үнэ", sortable: true, align: "right" },
          ],
        },
      },
    ],
  });

  await prisma.builderView.create({
    data: {
      id: PRODUCT_VIEW_ID,
      title: "Бараа",
      formId: PRODUCT_FORM_ID,
      listId: PRODUCT_LIST_ID,
      permissionRead: "product:read",
      permissionWrite: "product:write",
      triggers: [],
    },
  });
}

describe("builder runtime view", () => {
  let token: string;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    const roles = await seedRoles();
    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: roles.owner });
    token = await login("owner@test.mn", "Test1234!");
    await seedProductBuilderView();
  });

  it("viewId-аар Product Form + List metadata болон product rows уншина", async () => {
    await prisma.product.create({
      data: { name: "Keyboard", slug: "keyboard", priceMinor: 320000, status: "PUBLISHED" },
    });

    const view = await api()
      .get(`${PREFIX}/builder/runtime/views/${PRODUCT_VIEW_ID}`)
      .set(bearer(token))
      .expect(200);
    expect(view.body.form.id).toBe(PRODUCT_FORM_ID);
    expect(view.body.list.id).toBe(PRODUCT_LIST_ID);

    const entries = await api()
      .get(`${PREFIX}/builder/runtime/views/${PRODUCT_VIEW_ID}/entries`)
      .set(bearer(token))
      .expect(200);
    expect(entries.body.total).toBe(1);
    expect(entries.body.items[0].values.slug).toBe("keyboard");
  });

  it("DataForm values-ээр product үүсгээд засаж болно", async () => {
    const created = await api()
      .post(`${PREFIX}/builder/runtime/views/${PRODUCT_VIEW_ID}/entries`)
      .set(bearer(token))
      .send({
        values: {
          name: "Mouse",
          slug: "mouse",
          priceMinor: 89000,
          status: "PUBLISHED",
        },
      })
      .expect(201);

    expect(created.body.values.name).toBe("Mouse");

    const updated = await api()
      .patch(`${PREFIX}/builder/runtime/views/${PRODUCT_VIEW_ID}/entries/${created.body.id}`)
      .set(bearer(token))
      .send({
        version: created.body.version,
        values: {
          name: "Wireless Mouse",
          slug: "wireless-mouse",
          priceMinor: 99000,
          status: "PUBLISHED",
        },
      })
      .expect(200);

    expect(updated.body.values.slug).toBe("wireless-mouse");
    expect(updated.body.version).toBe(created.body.version + 1);

    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { action: "update", resource: "product", resourceId: created.body.id },
    });
    expect(audit.meta).toMatchObject({
      viewId: PRODUCT_VIEW_ID,
      changes: { priceMinor: { from: 89000, to: 99000 } },
    });
  });

  it("form/list id-аар lifecycle trigger-гүй үед standalone runtime data ажиллана", async () => {
    const created = await api()
      .post(`${PREFIX}/builder/runtime/forms/${PRODUCT_FORM_ID}/entries`)
      .set(bearer(token))
      .send({
        values: {
          name: "Standalone",
          slug: "standalone",
          priceMinor: 123000,
          status: "PUBLISHED",
        },
      })
      .expect(201);

    expect(created.body.viewId).toBe(PRODUCT_FORM_ID);
    expect(created.body.values.name).toBe("Standalone");

    const entries = await api()
      .get(`${PREFIX}/builder/runtime/lists/${PRODUCT_LIST_ID}/entries`)
      .set(bearer(token))
      .expect(200);

    expect(entries.body.total).toBe(1);
    expect(entries.body.items[0].viewId).toBe(PRODUCT_LIST_ID);
    expect(entries.body.items[0].values.slug).toBe("standalone");
  });

  it("field trigger нь form values-ээр slug бодож patch буцаана", async () => {
    const result = await api()
      .post(`${PREFIX}/builder/runtime/views/${PRODUCT_VIEW_ID}/fields/name/triggers/onChange`)
      .set(bearer(token))
      .send({
        value: "iPhone XR 1",
        values: {
          name: "iPhone XR 1",
          slug: "",
          priceMinor: 1000,
          status: "PUBLISHED",
        },
      })
      .expect(200);

    expect(result.body).toMatchObject({
      schema: [{ field: "slug", value: "iphone-xr-1" }],
      fieldErrors: {},
    });
  });

  it("permission тохируулаагүй runtime view нээлттэй үлдэхгүй", async () => {
    await prisma.builderView.update({
      where: { id: PRODUCT_VIEW_ID },
      data: { permissionRead: null, permissionWrite: null },
    });

    await api()
      .get(`${PREFIX}/builder/runtime/views/${PRODUCT_VIEW_ID}`)
      .set(bearer(token))
      .expect(403);
  });

  it("form beforeCreate validate trigger ажиллаж хадгалалтыг зогсооно", async () => {
    await prisma.builderDefinition.update({
      where: { id: PRODUCT_FORM_ID },
      data: {
        triggers: [
          {
            event: "beforeCreate",
            action: "validate",
            enabled: true,
            blocking: true,
            config: { required: ["slug"] },
          },
        ],
      },
    });

    await api()
      .post(`${PREFIX}/builder/runtime/views/${PRODUCT_VIEW_ID}/entries`)
      .set(bearer(token))
      .send({
        values: {
          name: "Missing slug",
          priceMinor: 1000,
          status: "PUBLISHED",
        },
      })
      .expect(400);

    const count = await prisma.product.count({ where: { name: "Missing slug" } });
    expect(count).toBe(0);
  });
});
