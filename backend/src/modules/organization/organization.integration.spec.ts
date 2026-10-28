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

describe("organization settings (integration)", () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    const roles = await seedRoles();
    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: roles.owner });
    await createUser({ email: "viewer@test.mn", password: "Test1234!", roleId: roles.viewer });
  });

  it("нэвтрээгүй хэрэглэгч 401, удирдах эрхгүй хэрэглэгч 403 авна", async () => {
    await api().get(`${PREFIX}/org`).expect(401);
    const viewerToken = await login("viewer@test.mn", "Test1234!");
    await api().get(`${PREFIX}/org`).set(bearer(viewerToken)).expect(200);
    await api()
      .patch(`${PREFIX}/org`)
      .set(bearer(viewerToken))
      .send({ name: "Шинэ нэр", version: 0 })
      .expect(403);
  });

  it("тохиргоог optimistic lock-той хадгална", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const current = await api().get(`${PREFIX}/org`).set(bearer(token)).expect(200);
    const input = {
      name: "Шинэ байгууллага",
      logoUrl: current.body.logoUrl,
      bankCode: current.body.bankCode,
      bankAccount: current.body.bankAccount,
      bankAccountName: current.body.bankAccountName,
      version: current.body.version,
    };

    const updated = await api().patch(`${PREFIX}/org`).set(bearer(token)).send(input).expect(200);
    expect(updated.body.name).toBe("Шинэ байгууллага");
    expect(updated.body.version).toBe(current.body.version + 1);

    await api().patch(`${PREFIX}/org`).set(bearer(token)).send(input).expect(409);
  });
});
