import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { api, bearer, createUser, login, PREFIX, resetDatabase, seedRoles } from "@/test/helpers";
import { setupTravelBuilder } from "./setupTravelBuilder";
import { TRAVEL_BUILDER_IDS as ids } from "./travelBuilderDefinitions";

const travelValues = {
  name: "Kenya Private Safari",
  slug: "kenya-private-safari",
  destinationLabel: "КЕНИ",
  tagline: "ЗЭРЛЭГ БАЙГАЛИЙГ ОЙРООС",
  category: "INTERNATIONAL",
  status: "PUBLISHED",
  coverImage: "https://cdn.example.com/kenya.jpg",
  durationDays: 8,
  description: "Аяллын тайлбар",
};
const departureValues = {
  departureDate: "2026-11-05",
  returnDate: "2026-11-12",
  transportType: "GROUND",
  unitPriceMinor: 890000000,
  capacity: 12,
  isBookingOpen: true,
};
const detailValues = {
  dayNumber: 1,
  title: "Найроби — Маасай Мара",
  content: "Өглөө Найробигоос хөдөлнө.",
  images: ["https://cdn.example.com/kenya-day-1.jpg"],
};
const root = `${PREFIX}/builder/runtime/views`;

describe("travel builder", () => {
  let token: string;
  let adminToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    await resetDatabase();
    const roles = await seedRoles();
    await createUser({
      email: "travel-owner@example.com",
      password: "test-password-123",
      roleId: roles.owner,
    });
    await createUser({
      email: "travel-admin@example.com",
      password: "test-password-123",
      roleId: roles.admin,
    });
    await createUser({
      email: "travel-viewer@example.com",
      password: "test-password-123",
      roleId: roles.viewer,
    });
    token = await login("travel-owner@example.com", "test-password-123");
    adminToken = await login("travel-admin@example.com", "test-password-123");
    viewerToken = await login("travel-viewer@example.com", "test-password-123");
    await setupTravelBuilder();
  });

  it("links travel metadata, departure, and itinerary-detail subforms", async () => {
    const view = await api().get(`${root}/${ids.travelView}`).set(bearer(token)).expect(200);
    expect(view.body.form.id).toBe(ids.travelForm);
    expect(view.body.list.id).toBe(ids.travelList);
    expect(view.body.form.schema.presentation).toBe("drawer");
    expect(view.body.form.schema.layout).toMatchObject({
      presentation: "tabs",
      groups: [
        { id: "general", title: "Үндсэн" },
        { id: "content", title: "Монгол" },
        { id: "english", title: "English" },
        { id: "chinese", title: "中文" },
        { id: "korean", title: "한국어" },
        { id: "related", title: "Гаралт ба хөтөлбөр" },
      ],
    });
    expect(view.body.form.schema.fields.map((field: { key: string }) => field.key)).toEqual([
      "name",
      "slug",
      "destinationLabel",
      "tagline",
      "category",
      "status",
      "coverImage",
      "durationDays",
      "description",
      "nameEn",
      "destinationLabelEn",
      "taglineEn",
      "descriptionEn",
      "nameZh",
      "destinationLabelZh",
      "taglineZh",
      "descriptionZh",
      "nameKo",
      "destinationLabelKo",
      "taglineKo",
      "descriptionKo",
    ]);
    expect(view.body.list.schema.columns.map((column: { key: string }) => column.key)).toEqual([
      "name",
      "category",
      "status",
      "durationDays",
    ]);
    expect(view.body.form.schema.subforms[0]).toMatchObject({
      viewId: ids.departureView,
      parentField: "id",
      childField: "travelId",
      presentation: "dialog",
    });
    expect(view.body.form.schema.subforms[1]).toMatchObject({
      viewId: ids.sectionView,
      parentField: "id",
      childField: "travelId",
      presentation: "dialog",
    });
    expect(view.body.form.schema.subforms[2]).toMatchObject({
      viewId: ids.detailView,
      parentField: "id",
      childField: "travelId",
      presentation: "dialog",
    });
    const detailView = await api().get(`${root}/${ids.detailView}`).set(bearer(token)).expect(200);
    const sectionView = await api()
      .get(`${root}/${ids.sectionView}`)
      .set(bearer(token))
      .expect(200);
    expect(
      sectionView.body.form.schema.fields.find((field: { key: string }) => field.key === "images"),
    ).toMatchObject({ type: "file", multiple: true });
    expect(sectionView.body.form.schema.layout).toMatchObject({ presentation: "tabs" });
    expect(
      sectionView.body.form.schema.fields.find(
        (field: { key: string }) => field.key === "mapImage",
      ),
    ).toMatchObject({
      label: "Маршрутын map зураг · 2:3 босоо",
      description: expect.stringContaining("800×1200 px"),
      type: "file",
    });
    expect(detailView.body.form.schema.fields.map((field: { key: string }) => field.key)).toEqual([
      "travelId",
      "sectionId",
      "dayNumber",
      "title",
      "content",
      "titleEn",
      "contentEn",
      "titleZh",
      "contentZh",
      "titleKo",
      "contentKo",
      "images",
    ]);
    expect(detailView.body.form.schema.layout).toMatchObject({ presentation: "tabs" });
    expect(
      detailView.body.form.schema.fields.find((field: { key: string }) => field.key === "content"),
    ).toMatchObject({ type: "richtext" });
    expect(
      detailView.body.form.schema.fields.find(
        (field: { key: string }) => field.key === "sectionId",
      ),
    ).toMatchObject({
      type: "select",
      optionsSource: {
        tableName: "travel_itinerary_sections",
        filterBy: { field: "travelId", valueFromField: "travelId" },
      },
    });
    await prisma.builderDefinition.update({
      where: { id: ids.travelForm },
      data: { title: "Custom title" },
    });
    expect((await setupTravelBuilder()).updated).toEqual([ids.travelForm]);
    expect(
      (await prisma.builderDefinition.findUniqueOrThrow({ where: { id: ids.travelForm } })).title,
    ).toBe("Аялал — form");
  });

  it("allows admins to read and write trips with org:manage", async () => {
    const admin = await prisma.role.findUniqueOrThrow({ where: { name: "admin" } });
    expect(admin.permissions).toContain("org:manage");

    for (const id of [ids.travelView, ids.departureView, ids.sectionView, ids.detailView]) {
      await api().get(`${root}/${id}`).set(bearer(adminToken)).expect(200);
    }
    await api()
      .post(`${root}/${ids.travelView}/composite-entries`)
      .set(bearer(adminToken))
      .send({ data: { travels: travelValues, travel_departures: [departureValues] } })
      .expect(201);
  });

  it("requires authentication and org:manage for views and mutations", async () => {
    for (const id of [ids.travelView, ids.departureView, ids.sectionView, ids.detailView]) {
      await api().get(`${root}/${id}`).expect(401);
      await api().get(`${root}/${id}`).set(bearer(viewerToken)).expect(403);
      await api()
        .post(`${root}/${id}/entries`)
        .set(bearer(viewerToken))
        .send({ values: {} })
        .expect(403);
    }
    await api()
      .post(`${root}/${ids.travelView}/composite-entries`)
      .set(bearer(viewerToken))
      .send({ data: { travels: travelValues, travel_departures: [departureValues] } })
      .expect(403);
  });

  it("creates linked slots and itinerary details, then supports composite update/delete", async () => {
    const created = await api()
      .post(`${root}/${ids.travelView}/composite-entries`)
      .set(bearer(token))
      .send({
        data: {
          travels: travelValues,
          travel_departures: [
            { ...departureValues, travelId: "client-cannot-override-parent" },
            { ...departureValues, transportType: "DIRECT_FLIGHT", unitPriceMinor: 1180000000 },
          ],
          travel_details: [
            { ...detailValues, travelId: "client-cannot-override-parent" },
            { dayNumber: 2, title: "Маасай Мара", content: "Сафари өдөр" },
          ],
        },
      })
      .expect(201);
    const travelId = created.body.id as string;
    const section = await api()
      .post(`${root}/${ids.sectionView}/entries`)
      .set(bearer(token))
      .send({
        values: {
          travelId,
          title: "МААСАЙ МАРА",
          description: "Сафари өдрүүд",
          sortOrder: 1,
        },
      })
      .expect(201);
    const rows = await prisma.travelDeparture.findMany({
      where: { travelId },
      orderBy: { transportType: "asc" },
    });
    expect(rows).toHaveLength(2);
    expect(rows[0].unitPriceMinor).toBe(890000000n);
    const details = await prisma.travelDetail.findMany({
      where: { travelId },
      orderBy: { dayNumber: "asc" },
    });
    expect(details).toHaveLength(2);
    expect(details[0]).toMatchObject({ travelId, ...detailValues });

    const listed = await api()
      .get(`${root}/${ids.travelView}/entries`)
      .set(bearer(token))
      .expect(200);
    expect(listed.body.items[0].values).toMatchObject(travelValues);
    const slots = await api()
      .get(`${root}/${ids.departureView}/entries`)
      .query({ filterField: "travelId", filterValue: travelId })
      .set(bearer(token))
      .expect(200);
    expect(slots.body.items).toHaveLength(2);
    expect(slots.body.items[0].values).toMatchObject({
      travelId,
      departureDate: "2026-11-05",
      returnDate: "2026-11-12",
    });
    const itinerary = await api()
      .get(`${root}/${ids.detailView}/entries`)
      .query({ filterField: "travelId", filterValue: travelId })
      .set(bearer(token))
      .expect(200);
    expect(itinerary.body.items).toHaveLength(2);
    expect(itinerary.body.items[0].values).toMatchObject({
      travelId,
      dayNumber: 1,
      title: detailValues.title,
    });

    await api()
      .patch(`${root}/${ids.travelView}/composite-entries/${travelId}`)
      .set(bearer(token))
      .send({
        data: {
          travels: {
            ...listed.body.items[0].values,
            id: travelId,
            version: 0,
            name: "Updated safari",
          },
          travel_departures: [
            { ...departureValues, id: rows[0].id, version: 0, capacity: 14 },
            { id: rows[1].id, version: 0, _delete: true },
          ],
          travel_details: [
            {
              ...detailValues,
              id: details[0].id,
              version: 0,
              sectionId: section.body.id,
              title: "Шинэчилсэн эхний өдөр",
            },
            { id: details[1].id, version: 0, _delete: true },
          ],
        },
      })
      .expect(200);
    const updated = await prisma.travel.findUniqueOrThrow({ where: { id: travelId } });
    expect(updated.name).toBe("Updated safari");
    expect(updated.description).toBe(travelValues.description);
    expect(updated.version).toBe(1);
    expect(await prisma.travelDeparture.count({ where: { travelId } })).toBe(1);
    expect((await prisma.travelDeparture.findFirstOrThrow({ where: { travelId } })).capacity).toBe(
      14,
    );
    expect(await prisma.travelDetail.count({ where: { travelId } })).toBe(1);
    const updatedDetail = await prisma.travelDetail.findFirstOrThrow({ where: { travelId } });
    expect(updatedDetail.title).toBe("Шинэчилсэн эхний өдөр");
    expect(updatedDetail.sectionId).toBe(section.body.id);
    expect(await prisma.auditLog.count({ where: { resourceId: travelId } })).toBeGreaterThan(0);

    await api()
      .delete(`${root}/${ids.travelView}/entries/${travelId}`)
      .set(bearer(token))
      .expect(204);

    expect(await prisma.travel.findFirst({ where: { id: travelId } })).toBeNull();
    expect(
      await prisma.auditLog.findFirst({
        where: { action: "delete", resource: "builder:travels", resourceId: travelId },
      }),
    ).not.toBeNull();
  });

  it("saves multiple server-uploaded images through the parent composite update", async () => {
    const detailValuesWithoutImages = {
      dayNumber: 1,
      title: "BLEH222",
      content: "ingene tegne",
    };
    const firstUpload = await api()
      .post(`${root}/${ids.detailView}/fields/images/files/upload`)
      .set(bearer(token))
      .set("Content-Type", "image/png")
      .send(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
      .expect(201);
    const secondUpload = await api()
      .post(`${root}/${ids.detailView}/fields/images/files/upload`)
      .set(bearer(token))
      .set("Content-Type", "image/png")
      .send(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]))
      .expect(201);

    const created = await api()
      .post(`${root}/${ids.travelView}/composite-entries`)
      .set(bearer(token))
      .send({
        data: {
          travels: travelValues,
          travel_details: [detailValuesWithoutImages],
        },
      })
      .expect(201);
    const travelId = created.body.id as string;
    const detail = await prisma.travelDetail.findFirstOrThrow({ where: { travelId } });

    await api()
      .patch(`${root}/${ids.travelView}/composite-entries/${travelId}`)
      .set(bearer(token))
      .send({
        data: {
          travels: { ...travelValues, id: travelId, version: 0 },
          travel_details: [
            {
              ...detailValuesWithoutImages,
              id: detail.id,
              version: detail.version,
              images: [firstUpload.body.url, secondUpload.body.url],
            },
          ],
        },
      })
      .expect(200);
    expect(
      (await prisma.travelDetail.findUniqueOrThrow({ where: { id: detail.id } })).images,
    ).toEqual([firstUpload.body.url, secondUpload.body.url]);
  });

  it("rolls back the parent if a slot has invalid dates", async () => {
    const response = await api()
      .post(`${root}/${ids.travelView}/composite-entries`)
      .set(bearer(token))
      .send({
        data: {
          travels: travelValues,
          travel_departures: [{ ...departureValues, returnDate: "2026-11-01" }],
        },
      });
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(await prisma.travel.count()).toBe(0);
    expect(await prisma.travelDeparture.count()).toBe(0);
  });
});
