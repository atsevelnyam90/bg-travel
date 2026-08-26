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

describe("Audit + optimistic locking (integration)", () => {
  let token: string;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    const roles = await seedRoles();
    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: roles.owner });
    token = await login("owner@test.mn", "Test1234!");
  });

  it("нэвтрэхэд аудит бичигдэнэ", async () => {
    const entries = await prisma.auditLog.findMany({ where: { action: "login" } });
    expect(entries).toHaveLength(1);
    expect(entries[0].ip).toBeTruthy();
  });

  it("бараа үүсгэхэд аудит бичигдэнэ", async () => {
    const created = await api()
      .post(`${PREFIX}/products`)
      .set(bearer(token))
      .send({ name: "Тест", slug: "test", priceMinor: 100, status: "DRAFT" })
      .expect(201);

    const entry = await prisma.auditLog.findFirstOrThrow({
      where: { action: "create", resource: "product" },
    });
    expect(entry.resourceId).toBe(created.body.id);
    expect(entry.actorId).toBeTruthy();
  });

  it("засварт зөвхөн ӨӨРЧЛӨГДСӨН талбар тэмдэглэгдэнэ", async () => {
    const created = await api()
      .post(`${PREFIX}/products`)
      .set(bearer(token))
      .send({ name: "Хуучин", slug: "test", priceMinor: 100, status: "DRAFT" })
      .expect(201);

    await api()
      .patch(`${PREFIX}/products/${created.body.id}`)
      .set(bearer(token))
      .send({ name: "Шинэ", slug: "test", priceMinor: 100, status: "DRAFT", version: 0 })
      .expect(200);

    const entry = await prisma.auditLog.findFirstOrThrow({
      where: { action: "update", resource: "product" },
    });
    const changes = (entry.meta as { changes: Record<string, unknown> }).changes;

    expect(Object.keys(changes)).toEqual(["name"]);
    expect(changes.name).toEqual({ from: "Хуучин", to: "Шинэ" });
  });

  it("аудит харах эрхгүй бол 403", async () => {
    const roles = await prisma.role.findMany();
    const viewerId = roles.find((r) => r.name === "viewer")?.id;
    await createUser({ email: "viewer@test.mn", password: "Test1234!", roleId: viewerId });
    const viewerToken = await login("viewer@test.mn", "Test1234!");

    await api().get(`${PREFIX}/audit`).set(bearer(viewerToken)).expect(403);
  });

  describe("optimistic locking", () => {
    it("хуучирсан version-оор засахад 409", async () => {
      const created = await api()
        .post(`${PREFIX}/products`)
        .set(bearer(token))
        .send({ name: "Бараа", slug: "lock", priceMinor: 100, status: "DRAFT" })
        .expect(201);

      const body = {
        name: "A",
        slug: "lock",
        priceMinor: 100,
        status: "DRAFT" as const,
        version: 0,
      };

      // Хэрэглэгч 1 хадгална → version 0 → 1
      await api()
        .patch(`${PREFIX}/products/${created.body.id}`)
        .set(bearer(token))
        .send(body)
        .expect(200);

      // Хэрэглэгч 2 мөн version 0-г уншсан байсан → зөрчил
      const conflict = await api()
        .patch(`${PREFIX}/products/${created.body.id}`)
        .set(bearer(token))
        .send({ ...body, name: "B" })
        .expect(409);

      expect(conflict.body.code).toBe("CONFLICT");
    });

    it("зөв version-оор засвар амжилттай, version нэмэгдэнэ", async () => {
      const created = await api()
        .post(`${PREFIX}/products`)
        .set(bearer(token))
        .send({ name: "Бараа", slug: "ok", priceMinor: 100, status: "DRAFT" })
        .expect(201);

      expect(created.body.version).toBe(0);

      const updated = await api()
        .patch(`${PREFIX}/products/${created.body.id}`)
        .set(bearer(token))
        .send({ name: "Шинэ", slug: "ok", priceMinor: 100, status: "DRAFT", version: 0 })
        .expect(200);

      expect(updated.body.version).toBe(1);
    });
  });
});
