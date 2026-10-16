import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ORDER_CONFIRM_PAID_TRIGGER } from "@/modules/orders/triggers";
import {
  PRODUCT_DISCOUNT_FIELD_TRIGGER,
  PRODUCT_SLUG_FIELD_TRIGGER,
} from "@/modules/products/triggers";
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
const WEBSITE_PAGE_FORM_ID = "44444444-4444-4444-8444-444444444441";
const WEBSITE_PAGE_LIST_ID = "44444444-4444-4444-8444-444444444442";
const WEBSITE_PAGE_VIEW_ID = "44444444-4444-4444-8444-444444444443";
const WEBSITE_SECTION_FORM_ID = "44444444-4444-4444-8444-444444444451";
const WEBSITE_SECTION_LIST_ID = "44444444-4444-4444-8444-444444444452";
const WEBSITE_SECTION_VIEW_ID = "44444444-4444-4444-8444-444444444453";
const ORDER_FORM_ID = "55555555-5555-4555-8555-555555555551";
const ORDER_LIST_ID = "55555555-5555-4555-8555-555555555552";
const ORDER_VIEW_ID = "55555555-5555-4555-8555-555555555553";

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
                  action: PRODUCT_SLUG_FIELD_TRIGGER,
                  enabled: true,
                  debounceMs: 300,
                  config: {},
                },
              ],
            },
            { key: "slug", label: "Slug", type: "text", required: true },
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

async function seedWebsitePageBuilderView() {
  await prisma.builderDefinition.createMany({
    data: [
      {
        id: WEBSITE_PAGE_FORM_ID,
        type: "form",
        title: "Website Page Form",
        source: { type: "dbTable", tableName: "website_pages" },
        schema: {
          fields: [
            {
              key: "type",
              label: "Type",
              type: "select",
              required: true,
              options: [
                { label: "Нүүр хуудас", value: "home" },
                { label: "Зээл", value: "loan" },
                { label: "Итгэлцэл", value: "trust" },
                { label: "Мөнгөн гуйвуулга", value: "send-money" },
                { label: "Валют арилжаа", value: "exchange" },
                { label: "Бидний тухай", value: "about" },
              ],
            },
            { key: "status", label: "Status", type: "text", required: true },
            { key: "sortOrder", label: "Sort Order", type: "number", required: false },
          ],
          subforms: [
            {
              key: "sections",
              label: "Sections",
              viewId: WEBSITE_SECTION_VIEW_ID,
              parentField: "id",
              childField: "pageId",
              buttonLabel: "Section нэмэх",
              icon: "plus",
            },
          ],
        },
      },
      {
        id: WEBSITE_PAGE_LIST_ID,
        type: "list",
        title: "Website Page List",
        source: { type: "dbTable", tableName: "website_pages" },
        schema: {
          columns: [
            { key: "type", label: "Type", sortable: true, align: "left" },
            { key: "status", label: "Status", sortable: true, align: "left" },
            { key: "sortOrder", label: "Sort Order", sortable: true, align: "right" },
          ],
        },
      },
      {
        id: WEBSITE_SECTION_FORM_ID,
        type: "form",
        title: "Website Section Form",
        source: { type: "dbTable", tableName: "website_sections" },
        schema: {
          fields: [
            { key: "pageId", label: "Page ID", type: "text", required: true, hidden: true },
            {
              key: "type",
              label: "Section",
              type: "select",
              required: true,
              options: [
                { label: "Hero", value: "hero" },
                { label: "About", value: "about" },
                { label: "Gallery", value: "gallery" },
              ],
            },
            { key: "title", label: "Title", type: "text", required: true },
            { key: "description", label: "Description", type: "textarea", required: false },
            { key: "sortOrder", label: "Sort Order", type: "number", required: false },
            { key: "isActive", label: "Active", type: "checkbox", required: false },
          ],
        },
      },
      {
        id: WEBSITE_SECTION_LIST_ID,
        type: "list",
        title: "Website Section List",
        source: { type: "dbTable", tableName: "website_sections" },
        schema: {
          columns: [
            { key: "type", label: "Section", sortable: true, align: "left" },
            { key: "title", label: "Title", sortable: true, align: "left" },
            { key: "sortOrder", label: "Sort Order", sortable: true, align: "right" },
          ],
        },
      },
    ],
  });

  await prisma.builderView.createMany({
    data: [
      {
        id: WEBSITE_PAGE_VIEW_ID,
        title: "Website Pages",
        formId: WEBSITE_PAGE_FORM_ID,
        listId: WEBSITE_PAGE_LIST_ID,
        permissionRead: "org:manage",
        permissionWrite: "org:manage",
        triggers: [],
      },
      {
        id: WEBSITE_SECTION_VIEW_ID,
        title: "Website Sections",
        formId: WEBSITE_SECTION_FORM_ID,
        listId: WEBSITE_SECTION_LIST_ID,
        permissionRead: "org:manage",
        permissionWrite: "org:manage",
        triggers: [],
      },
    ],
  });
}

async function seedOrderBuilderView() {
  await prisma.builderDefinition.createMany({
    data: [
      {
        id: ORDER_FORM_ID,
        type: "form",
        title: "Order Form",
        source: { type: "dbTable", tableName: "orders" },
        triggers: [
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
        ],
        schema: {
          fields: [
            { key: "public_order_id", label: "Дугаар", type: "text", required: true },
            { key: "first_name", label: "Нэр", type: "text", required: true },
            { key: "last_name", label: "Овог", type: "text", required: true },
            { key: "address", label: "Хаяг", type: "textarea", required: false },
            { key: "phone", label: "Утас", type: "text", required: true },
            { key: "email", label: "И-мэйл", type: "text", required: true },
            { key: "service_code", label: "Үйлчилгээ", type: "text", required: true },
            {
              key: "transport_type",
              label: "Тээвэр",
              type: "select",
              required: false,
              options: [{ label: "Газраар", value: "GROUND" }],
            },
            { key: "travel_date", label: "Огноо", type: "date", required: true },
            { key: "traveler_count", label: "Зорчигч", type: "number", required: true },
            {
              key: "service_name_snapshot",
              label: "Үйлчилгээний нэр",
              type: "text",
              required: true,
            },
            {
              key: "transport_name_snapshot",
              label: "Тээврийн нэр",
              type: "text",
              required: false,
            },
            { key: "unit_price_minor", label: "Нэгж үнэ", type: "money", required: true },
            { key: "total_price_minor", label: "Нийт үнэ", type: "money", required: true },
            {
              key: "status",
              label: "Төлөв",
              type: "select",
              required: true,
              options: [
                { label: "Төлбөр хүлээгдэж байна", value: "AWAITING_PAYMENT" },
                { label: "Төлсөн", value: "PAID" },
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
        },
      },
      {
        id: ORDER_LIST_ID,
        type: "list",
        title: "Order List",
        source: { type: "dbTable", tableName: "orders" },
        schema: {
          columns: [
            { key: "public_order_id", label: "Дугаар", sortable: true, align: "left" },
            { key: "status", label: "Төлөв", sortable: true, align: "left" },
          ],
        },
      },
    ],
  });

  await prisma.builderView.create({
    data: {
      id: ORDER_VIEW_ID,
      title: "Захиалга",
      formId: ORDER_FORM_ID,
      listId: ORDER_LIST_ID,
      permissionRead: "order:read",
      permissionWrite: "order:write",
      triggers: [],
    },
  });
}

describe("builder runtime view", () => {
  let token: string;
  let ownerId: string;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    const roles = await seedRoles();
    const owner = await createUser({
      email: "owner@test.mn",
      password: "Test1234!",
      roleId: roles.owner,
    });
    ownerId = owner.id;
    token = await login("owner@test.mn", "Test1234!");
    await seedProductBuilderView();
  });

  it("admin form detail нь datasource-тойгоо буцна", async () => {
    const response = await api()
      .get(`${PREFIX}/builder/forms/${PRODUCT_FORM_ID}`)
      .set(bearer(token))
      .expect(200);

    expect(response.body.source).toEqual({ type: "dbTable", tableName: "products" });
    expect(response.body.schema.fields[0].key).toBe("name");
  });

  it("admin list detail нь datasource-тойгоо буцна", async () => {
    const response = await api()
      .get(`${PREFIX}/builder/lists/${PRODUCT_LIST_ID}`)
      .set(bearer(token))
      .expect(200);

    expect(response.body.source).toEqual({ type: "dbTable", tableName: "products" });
    expect(response.body.schema.columns[0].key).toBe("name");
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
          discountMinor: 8900,
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
          discountMinor: 9900,
          priceMinor: 99000,
          status: "PUBLISHED",
        },
      })
      .expect(200);

    expect(updated.body.values.slug).toBe("wireless-mouse");
    expect(updated.body.values.discountMinor).toBe(9900);
    expect(updated.body.version).toBe(created.body.version + 1);

    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { action: "update", resource: "product", resourceId: created.body.id },
    });
    expect(audit.meta).toMatchObject({
      viewId: PRODUCT_VIEW_ID,
      changes: { priceMinor: { from: 89000, to: 99000 } },
    });
  });

  it("generic dbTable runtime нь website page үүсгээд засаж чадна", async () => {
    await seedWebsitePageBuilderView();

    const created = await api()
      .post(`${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/entries`)
      .set(bearer(token))
      .send({
        values: {
          type: "home",
          status: "draft",
          sortOrder: 0,
        },
      })
      .expect(201);

    expect(created.body.values.type).toBe("home");
    expect(created.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );

    const updated = await api()
      .patch(`${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/entries/${created.body.id}`)
      .set(bearer(token))
      .send({
        version: created.body.version,
        values: {
          type: "home",
          status: "published",
          sortOrder: 1,
        },
      })
      .expect(200);

    expect(updated.body.values.type).toBe("home");
    expect(updated.body.values.sortOrder).toBe(1);
    expect(updated.body.version).toBe(created.body.version + 1);

    const section = await api()
      .post(`${PREFIX}/builder/runtime/views/${WEBSITE_SECTION_VIEW_ID}/entries`)
      .set(bearer(token))
      .send({
        values: {
          pageId: created.body.id,
          type: "hero",
          title: "Hero",
          description: "",
          sortOrder: "",
          isActive: true,
        },
      })
      .expect(201);

    expect(section.body.values.pageId).toBe(created.body.id);
    expect(section.body.values.sortOrder).toBe(0);
  });

  it("order PAID болох үед баталгаажуулсан хэрэглэгчийг trigger автоматаар бөглөнө", async () => {
    await seedOrderBuilderView();

    const created = await api()
      .post(`${PREFIX}/builder/runtime/views/${ORDER_VIEW_ID}/entries`)
      .set(bearer(token))
      .send({
        values: {
          public_order_id: "ORD-TRIGGER-1",
          first_name: "Bold",
          last_name: "Tester",
          address: "Test address",
          phone: "99999999",
          email: "order@example.mn",
          service_code: "tour-1",
          transport_type: "GROUND",
          travel_date: "2026-10-14",
          traveler_count: 2,
          service_name_snapshot: "Test tour",
          transport_name_snapshot: "Газраар",
          unit_price_minor: 1000,
          total_price_minor: 2000,
          status: "PAID",
          idempotency_key: "order-trigger-test",
        },
      })
      .expect(201);

    expect(created.body.values.confirmed_by_user_id).toBe(ownerId);
    expect(created.body.values.confirmed_at).toBeTruthy();
    expect(created.body.values.address).toBe("Test address");

    const listed = await api()
      .get(`${PREFIX}/builder/runtime/views/${ORDER_VIEW_ID}/entries`)
      .set(bearer(token))
      .expect(200);
    expect(listed.body.items[0].values).toMatchObject({
      address: "Test address",
      confirmed_by_user_id: ownerId,
    });
    expect(listed.body.items[0].values.confirmed_at).toBeTruthy();

    const order = await prisma.order.findUniqueOrThrow({ where: { id: created.body.id } });
    expect(order.confirmedByUserId).toBe(ownerId);
    expect(order.confirmedAt).toBeInstanceOf(Date);
  });

  it("composite runtime нь parent page болон child sections-г хамт үүсгэнэ", async () => {
    await seedWebsitePageBuilderView();

    const created = await api()
      .post(`${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/composite-entries`)
      .set(bearer(token))
      .send({
        data: {
          website_pages: {
            type: "home",
            status: "draft",
            sortOrder: 0,
          },
          website_sections: [
            {
              pageId: "client-must-not-win",
              type: "hero",
              title: "Hero",
              description: "Hero copy",
              sortOrder: 1,
              isActive: true,
            },
            {
              type: "about",
              title: "About",
              description: "About copy",
              sortOrder: 2,
              isActive: true,
            },
          ],
        },
      })
      .expect(201);

    expect(created.body.values.type).toBe("home");

    const sections = await prisma.websiteSection.findMany({
      where: { pageId: created.body.id },
      orderBy: { sortOrder: "asc" },
    });
    expect(sections).toHaveLength(2);
    expect(sections[0]?.pageId).toBe(created.body.id);
    expect(sections[0]?.title).toBe("Hero");
    expect(sections[1]?.title).toBe("About");
  });

  it("composite runtime нь parent page болон child sections-г хамт засна", async () => {
    await seedWebsitePageBuilderView();

    const created = await api()
      .post(`${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/composite-entries`)
      .set(bearer(token))
      .send({
        data: {
          website_pages: {
            type: "home",
            status: "draft",
            sortOrder: 0,
          },
          website_sections: [
            {
              type: "hero",
              title: "Hero",
              description: "Hero copy",
              sortOrder: 1,
              isActive: true,
            },
            {
              type: "about",
              title: "About",
              description: "About copy",
              sortOrder: 2,
              isActive: true,
            },
          ],
        },
      })
      .expect(201);

    const existingSections = await prisma.websiteSection.findMany({
      where: { pageId: created.body.id },
      orderBy: { sortOrder: "asc" },
    });

    await api()
      .patch(
        `${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/composite-entries/${created.body.id}`,
      )
      .set(bearer(token))
      .send({
        data: {
          website_pages: {
            id: created.body.id,
            version: created.body.version,
            type: "home",
            status: "published",
            sortOrder: 5,
          },
          website_sections: [
            {
              id: existingSections[0]?.id,
              version: existingSections[0]?.version,
              pageId: "client-must-not-win",
              type: "hero",
              title: "Hero updated",
              description: "Hero copy updated",
              sortOrder: 1,
              isActive: true,
            },
            {
              id: existingSections[1]?.id,
              version: existingSections[1]?.version,
              _delete: true,
            },
            {
              type: "gallery",
              title: "Gallery",
              description: "Gallery copy",
              sortOrder: 3,
              isActive: true,
            },
          ],
        },
      })
      .expect(200);

    const page = await prisma.websitePage.findUniqueOrThrow({
      where: { id: created.body.id },
    });
    expect(page.status).toBe("published");
    expect(page.sortOrder).toBe(5);

    const sections = await prisma.websiteSection.findMany({
      where: { pageId: created.body.id },
      orderBy: { sortOrder: "asc" },
    });
    expect(sections).toHaveLength(2);
    expect(sections[0]?.id).toBe(existingSections[0]?.id);
    expect(sections[0]?.pageId).toBe(created.body.id);
    expect(sections[0]?.title).toBe("Hero updated");
    expect(sections[1]?.title).toBe("Gallery");
  });

  it("composite update stale parent version үед child mutation хийхгүй", async () => {
    await seedWebsitePageBuilderView();

    const created = await api()
      .post(`${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/composite-entries`)
      .set(bearer(token))
      .send({
        data: {
          website_pages: {
            type: "home",
            status: "draft",
            sortOrder: 0,
          },
          website_sections: [
            {
              type: "hero",
              title: "Hero",
              description: "Hero copy",
              sortOrder: 1,
              isActive: true,
            },
          ],
        },
      })
      .expect(201);

    const section = await prisma.websiteSection.findFirstOrThrow({
      where: { pageId: created.body.id },
    });

    const staleParentResponse = await api()
      .patch(
        `${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/composite-entries/${created.body.id}`,
      )
      .set(bearer(token))
      .send({
        data: {
          website_pages: {
            id: created.body.id,
            version: created.body.version + 1,
            type: "home",
            status: "published",
            sortOrder: 5,
          },
          website_sections: [
            {
              id: section.id,
              version: section.version,
              type: "hero",
              title: "Hero should not update",
              description: "Hero copy updated",
              sortOrder: 2,
              isActive: false,
            },
          ],
        },
      });

    expect(staleParentResponse.status, JSON.stringify(staleParentResponse.body)).toBe(409);

    const page = await prisma.websitePage.findUniqueOrThrow({ where: { id: created.body.id } });
    const unchangedSection = await prisma.websiteSection.findUniqueOrThrow({
      where: { id: section.id },
    });

    expect(page.status).toBe("draft");
    expect(page.sortOrder).toBe(0);
    expect(unchangedSection.title).toBe("Hero");
    expect(unchangedSection.sortOrder).toBe(1);
  });

  it("composite update stale child version үед parent update rollback хийнэ", async () => {
    await seedWebsitePageBuilderView();

    const created = await api()
      .post(`${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/composite-entries`)
      .set(bearer(token))
      .send({
        data: {
          website_pages: {
            type: "home",
            status: "draft",
            sortOrder: 0,
          },
          website_sections: [
            {
              type: "hero",
              title: "Hero",
              description: "Hero copy",
              sortOrder: 1,
              isActive: true,
            },
          ],
        },
      })
      .expect(201);

    const section = await prisma.websiteSection.findFirstOrThrow({
      where: { pageId: created.body.id },
    });

    const staleChildResponse = await api()
      .patch(
        `${PREFIX}/builder/runtime/views/${WEBSITE_PAGE_VIEW_ID}/composite-entries/${created.body.id}`,
      )
      .set(bearer(token))
      .send({
        data: {
          website_pages: {
            id: created.body.id,
            version: created.body.version,
            type: "home",
            status: "published",
            sortOrder: 5,
          },
          website_sections: [
            {
              id: section.id,
              version: section.version + 1,
              type: "hero",
              title: "Hero should not update",
              description: "Hero copy updated",
              sortOrder: 2,
              isActive: false,
            },
          ],
        },
      });

    expect(staleChildResponse.status, JSON.stringify(staleChildResponse.body)).toBe(409);

    const page = await prisma.websitePage.findUniqueOrThrow({ where: { id: created.body.id } });
    const unchangedSection = await prisma.websiteSection.findUniqueOrThrow({
      where: { id: section.id },
    });

    expect(page.status).toBe("draft");
    expect(page.sortOrder).toBe(0);
    expect(page.version).toBe(created.body.version);
    expect(unchangedSection.title).toBe("Hero");
    expect(unchangedSection.version).toBe(section.version);
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

  it("field trigger нь priceMinor-оос discountMinor бодож patch буцаана", async () => {
    const result = await api()
      .post(
        `${PREFIX}/builder/runtime/views/${PRODUCT_VIEW_ID}/fields/priceMinor/triggers/onChange`,
      )
      .set(bearer(token))
      .send({
        value: 250000,
        values: {
          name: "Keyboard",
          slug: "keyboard",
          priceMinor: 250000,
          discountMinor: 0,
          status: "PUBLISHED",
        },
      })
      .expect(200);

    expect(result.body).toMatchObject({
      schema: [{ field: "discountMinor", value: 25000 }],
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
