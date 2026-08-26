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

describe("Auth (integration)", () => {
  let ownerRoleId: string;

  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    ownerRoleId = (await seedRoles()).owner;
    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: ownerRoleId });
  });

  it("зөв нууц үгээр нэвтэрнэ", async () => {
    const response = await api()
      .post(`${PREFIX}/auth/login`)
      .send({ email: "owner@test.mn", password: "Test1234!" })
      .expect(200);

    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.tokenType).toBe("Bearer");
    // Web урсгал: session cookie тавигдана.
    // set-cookie нь нэг эсвэл олон утгатай байж болно.
    const cookies = response.headers["set-cookie"];
    expect([cookies].flat().join()).toContain("sid=");
  });

  it("буруу нууц үгэнд 401, и-мэйлийг ялгахгүй мессеж", async () => {
    const wrongPassword = await api()
      .post(`${PREFIX}/auth/login`)
      .send({ email: "owner@test.mn", password: "buruu123" })
      .expect(401);

    const noSuchUser = await api()
      .post(`${PREFIX}/auth/login`)
      .send({ email: "baihgui@test.mn", password: "Test1234!" })
      .expect(401);

    // Хоёр тохиолдолд ИЖИЛ мессеж — эс тэгвэл ямар и-мэйл бүртгэлтэйг тандаж болно.
    expect(wrongPassword.body.message).toBe(noSuchUser.body.message);
  });

  it("/auth/me нэвтрээгүй үед 401", async () => {
    await api().get(`${PREFIX}/auth/me`).expect(401);
  });

  it("/auth/me эрхийн жагсаалт буцаана", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const response = await api().get(`${PREFIX}/auth/me`).set(bearer(token)).expect(200);

    expect(response.body.user.email).toBe("owner@test.mn");
    expect(response.body.role.name).toBe("owner");
    expect(response.body.permissions).toContain("user:invite");
  });

  it("refresh нь шинэ хос гаргаж, хуучныг хүчингүй болгоно", async () => {
    const first = await api()
      .post(`${PREFIX}/auth/login`)
      .send({ email: "owner@test.mn", password: "Test1234!" })
      .expect(200);

    const second = await api()
      .post(`${PREFIX}/auth/refresh`)
      .send({ refreshToken: first.body.refreshToken })
      .expect(200);

    expect(second.body.refreshToken).not.toBe(first.body.refreshToken);
  });

  it("хуучин refresh дахин ашиглах нь session-ы БҮХ токеныг унтраана", async () => {
    const first = await api()
      .post(`${PREFIX}/auth/login`)
      .send({ email: "owner@test.mn", password: "Test1234!" })
      .expect(200);

    const second = await api()
      .post(`${PREFIX}/auth/refresh`)
      .send({ refreshToken: first.body.refreshToken })
      .expect(200);

    // Хулгайлагдсан хуучин токеноор оролдох
    await api()
      .post(`${PREFIX}/auth/refresh`)
      .send({ refreshToken: first.body.refreshToken })
      .expect(401);

    // Эзний шинэ токен ч хүчингүй болсон байх ёстой
    await api()
      .post(`${PREFIX}/auth/refresh`)
      .send({ refreshToken: second.body.refreshToken })
      .expect(401);
  });

  it("идэвхгүй болгосон хэрэглэгч токентой ч нэвтрэхгүй", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    await prisma.user.updateMany({
      where: { email: "owner@test.mn" },
      data: { status: "DISABLED" },
    });

    await api().get(`${PREFIX}/auth/me`).set(bearer(token)).expect(401);
  });

  it("logout дараа session устана", async () => {
    const agent = api();
    const loginResponse = await agent
      .post(`${PREFIX}/auth/login`)
      .send({ email: "owner@test.mn", password: "Test1234!" })
      .expect(200);

    const token = loginResponse.body.accessToken;
    await api().post(`${PREFIX}/auth/logout`).set(bearer(token)).expect(204);
    await api().get(`${PREFIX}/auth/me`).set(bearer(token)).expect(401);
  });
});
