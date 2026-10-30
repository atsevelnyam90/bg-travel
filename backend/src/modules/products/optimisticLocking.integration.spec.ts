import { beforeEach, describe, expect, it } from "vitest";
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

describe("product optimistic locking (integration)", () => {
  let token: string;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    const roles = await seedRoles();
    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: roles.owner });
    token = await login("owner@test.mn", "Test1234!");
  });

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

    await api()
      .patch(`${PREFIX}/products/${created.body.id}`)
      .set(bearer(token))
      .send(body)
      .expect(200);

    const response = await api()
      .patch(`${PREFIX}/products/${created.body.id}`)
      .set(bearer(token))
      .send({ ...body, name: "B" })
      .expect(409);

    expect(response.body.code).toBe("CONFLICT");
  });

  it("зөв version-оор засвар амжилттай, version нэмэгдэнэ", async () => {
    const created = await api()
      .post(`${PREFIX}/products`)
      .set(bearer(token))
      .send({ name: "Бараа", slug: "ok", priceMinor: 100, status: "DRAFT" })
      .expect(201);

    const updated = await api()
      .patch(`${PREFIX}/products/${created.body.id}`)
      .set(bearer(token))
      .send({ name: "Шинэ", slug: "ok", priceMinor: 100, status: "DRAFT", version: 0 })
      .expect(200);

    expect(created.body.version).toBe(0);
    expect(updated.body.version).toBe(1);
  });
});
