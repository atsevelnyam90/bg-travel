import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { api, bearer, createUser, login, PREFIX, resetDatabase, seedRoles } from "@/test/helpers";
import { setupTravelBuilder } from "./setupTravelBuilder";
import { TRAVEL_BUILDER_IDS as ids } from "./travelBuilderDefinitions";

const travelValues = {
  name: "Kenya Private Safari",
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
const root = `${PREFIX}/builder/runtime/views`;

describe("travel builder", () => {
  let token: string;
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
      email: "travel-viewer@example.com",
      password: "test-password-123",
      roleId: roles.viewer,
    });
    token = await login("travel-owner@example.com", "test-password-123");
    viewerToken = await login("travel-viewer@example.com", "test-password-123");
    await setupTravelBuilder();
  });

  it("links the simplified travel form/grid and departure subform", async () => {
    const view = await api().get(`${root}/${ids.travelView}`).set(bearer(token)).expect(200);
    expect(view.body.form.id).toBe(ids.travelForm);
    expect(view.body.list.id).toBe(ids.travelList);
    expect(view.body.form.schema.presentation).toBe("drawer");
    expect(view.body.form.schema.fields.map((field: { key: string }) => field.key)).toEqual([
      "name",
      "description",
    ]);
    expect(view.body.list.schema.columns.map((column: { key: string }) => column.key)).toEqual([
      "name",
    ]);
    expect(view.body.form.schema.subforms[0]).toMatchObject({
      viewId: ids.departureView,
      parentField: "id",
      childField: "travelId",
      presentation: "dialog",
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

  it("requires authentication and org:manage for both views and mutations", async () => {
    for (const id of [ids.travelView, ids.departureView]) {
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

  it("creates linked slots, preserves all edit values, and supports composite update/delete", async () => {
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
        },
      })
      .expect(201);
    const travelId = created.body.id as string;
    const rows = await prisma.travelDeparture.findMany({
      where: { travelId },
      orderBy: { transportType: "asc" },
    });
    expect(rows).toHaveLength(2);
    expect(rows[0].unitPriceMinor).toBe(890000000n);

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
    expect(await prisma.auditLog.count({ where: { resourceId: travelId } })).toBeGreaterThan(0);
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
