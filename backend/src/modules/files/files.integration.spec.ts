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

describe("Файл байршуулах (integration)", () => {
  let token: string;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    const roles = await seedRoles();
    // viewer — хамгийн бага эрхтэй. Файл байршуулахад тусгай эрх шаардахгүй,
    // зөвхөн нэвтэрсэн байхыг шаардана.
    await createUser({ email: "viewer@test.mn", password: "Test1234!", roleId: roles.viewer });
    token = await login("viewer@test.mn", "Test1234!");
  });

  it("нэвтрээгүй бол 401", async () => {
    await api()
      .post(`${PREFIX}/files/presign`)
      .send({ contentType: "image/png", contentLength: 100, scope: "product" })
      .expect(401);
  });

  it("зөвшөөрөгдөөгүй төрөлд 400", async () => {
    await api()
      .post(`${PREFIX}/files/presign`)
      .set(bearer(token))
      .send({ contentType: "application/x-msdownload", contentLength: 100, scope: "product" })
      .expect(400);
  });

  it("10MB-аас том файлд 400", async () => {
    await api()
      .post(`${PREFIX}/files/presign`)
      .set(bearer(token))
      .send({ contentType: "image/png", contentLength: 11 * 1024 * 1024, scope: "product" })
      .expect(400);
  });

  it("танихгүй scope-д 400", async () => {
    await api()
      .post(`${PREFIX}/files/presign`)
      .set(bearer(token))
      .send({ contentType: "image/png", contentLength: 100, scope: "хаа_нэгтээ" })
      .expect(400);
  });

  it("зөв хүсэлтэд presigned URL буцаана", async () => {
    const response = await api()
      .post(`${PREFIX}/files/presign`)
      .set(bearer(token))
      .send({ contentType: "image/png", contentLength: 1024, scope: "product" })
      .expect(200);

    expect(response.body.uploadUrl).toContain("X-Amz-Signature");
    // Түлхээр нь клиентээс биш, сервер өөрөө үүсгэсэн байх ёстой.
    expect(response.body.key).toMatch(/^product\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.png$/);
    expect(response.body.publicUrl).toContain(response.body.key);
    expect(response.body.expiresInSeconds).toBeGreaterThan(0);
  });

  it("файлын нэрийг клиентээс АВАХГҮЙ (зам таахаас сэргийлнэ)", async () => {
    const response = await api()
      .post(`${PREFIX}/files/presign`)
      .set(bearer(token))
      .send({
        contentType: "image/png",
        contentLength: 100,
        scope: "product",
        fileName: "../../etc/passwd",
      })
      .expect(200);

    expect(response.body.key).not.toContain("passwd");
    expect(response.body.key).not.toContain("..");
  });
});
