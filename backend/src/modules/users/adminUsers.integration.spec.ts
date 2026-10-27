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

describe("admin users (integration)", () => {
  let roles: Record<string, string>;
  let targetId: string;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    roles = await seedRoles();
    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: roles.owner });
    const target = await createUser({
      email: "viewer@test.mn",
      password: "Test1234!",
      roleId: roles.viewer,
    });
    targetId = target.id;
  });

  it("нэвтрээгүй хэрэглэгч 401, засах эрхгүй хэрэглэгч 403 авна", async () => {
    await api().get(`${PREFIX}/users`).expect(401);
    const viewerToken = await login("viewer@test.mn", "Test1234!");
    await api().patch(`${PREFIX}/users/${targetId}`).set(bearer(viewerToken)).send({}).expect(403);
  });

  it("хэрэглэгчийг optimistic lock-той засаж, зөөлөн устгана", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const list = await api().get(`${PREFIX}/users`).set(bearer(token)).expect(200);
    const target = list.body.items.find((item: { id: string }) => item.id === targetId);

    const updated = await api()
      .patch(`${PREFIX}/users/${targetId}`)
      .set(bearer(token))
      .send({
        email: "updated@test.mn",
        name: "Шинэ нэр",
        status: "ACTIVE",
        roleId: roles.member,
        version: target.version,
      })
      .expect(200);
    expect(updated.body.email).toBe("updated@test.mn");
    expect(updated.body.version).toBe(1);

    await api().delete(`${PREFIX}/users/${targetId}`).set(bearer(token)).expect(204);
    const stored = await prisma.$queryRaw<Array<{ deletedAt: Date | null; status: string }>>`
      SELECT "deletedAt", status::text FROM users WHERE id = ${targetId}
    `;
    expect(stored[0]?.deletedAt).toBeInstanceOf(Date);
    expect(stored[0]?.status).toBe("DISABLED");
  });
});
