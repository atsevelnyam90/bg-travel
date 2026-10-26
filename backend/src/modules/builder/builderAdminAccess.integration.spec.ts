import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { setupTravelBuilder } from "@/modules/travels/setupTravelBuilder";
import { setupWebsiteBuilder } from "@/modules/website/setupWebsiteBuilder";
import { WEBSITE_BUILDER_IDS } from "@/modules/website/websiteBuilderDefinitions";
import { api, bearer, createUser, login, PREFIX, resetDatabase, seedRoles } from "@/test/helpers";

describe("Builder administration permissions", () => {
  let adminToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    await resetDatabase();
    const roles = await seedRoles();
    await createUser({
      email: "builder-admin@example.com",
      password: "test-password-123",
      roleId: roles.admin,
    });
    await createUser({
      email: "builder-viewer@example.com",
      password: "test-password-123",
      roleId: roles.viewer,
    });
    adminToken = await login("builder-admin@example.com", "test-password-123");
    viewerToken = await login("builder-viewer@example.com", "test-password-123");
    await setupTravelBuilder();
    await setupWebsiteBuilder();
  });

  it("lets an admin list and create forms without organization management", async () => {
    const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "admin" } });
    expect(adminRole.permissions).toContain("builder:manage");
    expect(adminRole.permissions).not.toContain("org:manage");

    const forms = await api()
      .get(`${PREFIX}/builder/forms?page=1&pageSize=20`)
      .set(bearer(adminToken))
      .expect(200);
    expect(forms.body.items.some((form: { title: string }) => form.title === "Аялал — form")).toBe(
      true,
    );
    expect(
      forms.body.items.some((form: { title: string }) => form.title === "WebSite Pages Form"),
    ).toBe(true);
    await api().get(`${PREFIX}/builder/lists`).set(bearer(adminToken)).expect(200);
    await api().get(`${PREFIX}/builder/views`).set(bearer(adminToken)).expect(200);
    await api()
      .get(`${PREFIX}/builder/forms/${WEBSITE_BUILDER_IDS.pageForm}`)
      .set(bearer(adminToken))
      .expect(200);
    await api()
      .get(`${PREFIX}/builder/lists/${WEBSITE_BUILDER_IDS.pageList}`)
      .set(bearer(adminToken))
      .expect(200);
    await api()
      .get(`${PREFIX}/builder/runtime/views/${WEBSITE_BUILDER_IDS.pageView}`)
      .set(bearer(adminToken))
      .expect(200);

    const created = await api()
      .post(`${PREFIX}/builder/forms`)
      .set(bearer(adminToken))
      .send({
        title: "Admin test form",
        source: { type: "dbTable", tableName: "travels" },
        schema: { fields: [{ key: "name", label: "Name", type: "text", required: true }] },
        triggers: [],
      })
      .expect(201);
    expect(created.body.title).toBe("Admin test form");

    await api().get(`${PREFIX}/builder/forms`).expect(401);
    await api().get(`${PREFIX}/builder/forms`).set(bearer(viewerToken)).expect(403);
    await api()
      .post(`${PREFIX}/builder/forms`)
      .set(bearer(viewerToken))
      .send({ title: "Forbidden form" })
      .expect(403);
  });
});
