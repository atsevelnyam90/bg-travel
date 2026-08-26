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

describe("Эрх ба public хил (integration)", () => {
  let roles: Record<string, string>;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    roles = await seedRoles();

    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: roles.owner });
    // viewer: product:read БИЙ, product:write БАЙХГҮЙ
    await createUser({ email: "viewer@test.mn", password: "Test1234!", roleId: roles.viewer });

    await prisma.product.createMany({
      data: [
        { slug: "nийтэлсэн", name: "Нийтэлсэн", priceMinor: 1000, status: "PUBLISHED" },
        { slug: "noorog", name: "Ноорог", priceMinor: 2000, status: "DRAFT" },
      ],
    });
  });

  describe("эрхийн шалгалт", () => {
    it("нэвтрээгүй бол admin жагсаалт 401", async () => {
      await api().get(`${PREFIX}/products`).expect(401);
    });

    it("viewer уншиж чадна", async () => {
      const token = await login("viewer@test.mn", "Test1234!");
      const response = await api().get(`${PREFIX}/products`).set(bearer(token)).expect(200);
      expect(response.body.total).toBe(2);
    });

    it("viewer бичих эрхгүй → 403", async () => {
      const token = await login("viewer@test.mn", "Test1234!");
      await api()
        .post(`${PREFIX}/products`)
        .set(bearer(token))
        .send({ name: "Шинэ", slug: "shine", priceMinor: 100, status: "DRAFT" })
        .expect(403);
    });

    it("viewer устгах эрхгүй → 403", async () => {
      const token = await login("viewer@test.mn", "Test1234!");
      const product = await prisma.product.findFirstOrThrow();
      await api().delete(`${PREFIX}/products/${product.id}`).set(bearer(token)).expect(403);
    });

    it("owner бүх үйлдэл хийж чадна", async () => {
      const token = await login("owner@test.mn", "Test1234!");
      const created = await api()
        .post(`${PREFIX}/products`)
        .set(bearer(token))
        .send({ name: "Шинэ", slug: "shine", priceMinor: 100, status: "PUBLISHED" })
        .expect(201);

      await api().delete(`${PREFIX}/products/${created.body.id}`).set(bearer(token)).expect(204);
    });
  });

  describe("public хил", () => {
    it("нэвтрэлтгүй үзэж болно", async () => {
      await api().get(`${PREFIX}/public/products`).expect(200);
    });

    it("зөвхөн PUBLISHED харагдана", async () => {
      const response = await api().get(`${PREFIX}/public/products`).expect(200);
      expect(response.body.total).toBe(1);
      expect(response.body.items[0].slug).toBe("nийтэлсэн");
    });

    it("дотоод талбарууд (status, createdAt) public хариунд ГАРАХГҮЙ", async () => {
      const response = await api().get(`${PREFIX}/public/products`).expect(200);
      expect(response.body.items[0]).not.toHaveProperty("status");
      expect(response.body.items[0]).not.toHaveProperty("createdAt");
    });

    it("DRAFT барааг slug-аар авах боломжгүй", async () => {
      await api().get(`${PREFIX}/public/products/noorog`).expect(404);
    });
  });

  describe("зөөлөн устгал", () => {
    it("устгасан бараа жагсаалтад гарахгүй, DB-д ARCHIVED хэвээр", async () => {
      const token = await login("owner@test.mn", "Test1234!");
      const product = await prisma.product.findFirstOrThrow({ where: { slug: "nийтэлсэн" } });

      await api().delete(`${PREFIX}/products/${product.id}`).set(bearer(token)).expect(204);

      const list = await api().get(`${PREFIX}/products`).set(bearer(token)).expect(200);
      expect(list.body.items.map((p: { slug: string }) => p.slug)).not.toContain("nийтэлсэн");

      // Мөр устаагүй — зөвхөн тэмдэглэгдсэн
      const row = await prisma.$queryRaw<Array<{ status: string }>>`
        SELECT status FROM products WHERE id = ${product.id}
      `;
      expect(row[0]?.status).toBe("ARCHIVED");
    });

    it("public талд ч алга болно", async () => {
      const token = await login("owner@test.mn", "Test1234!");
      const product = await prisma.product.findFirstOrThrow({ where: { slug: "nийтэлсэн" } });
      await api().delete(`${PREFIX}/products/${product.id}`).set(bearer(token)).expect(204);

      const response = await api().get(`${PREFIX}/public/products`).expect(200);
      expect(response.body.total).toBe(0);
    });
  });
});
