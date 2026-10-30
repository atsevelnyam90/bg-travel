import { SYSTEM_ROLES } from "@winu/contracts";
import request from "supertest";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/modules/auth/passwordService";
import { createServer } from "@/server";

export const app = createServer();
export const api = () => request(app);
export const PREFIX = "/api/v1";

/**
 * Тест бүрийн өмнө DB-г цэвэрлэнэ.
 *
 * Дараалал чухал: гадаад түлхүүрийн хамаарлын эсрэгээр устгана.
 */
export async function resetDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.refreshToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.paymentReference.deleteMany(),
    prisma.order.deleteMany(),
    prisma.travelDeparture.deleteMany(),
    prisma.travelDetail.deleteMany(),
    prisma.travelItinerarySection.deleteMany(),
    prisma.travel.deleteMany(),
    prisma.websiteSection.deleteMany(),
    prisma.websitePage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
    prisma.organization.deleteMany(),
  ]);
}

export async function seedRoles(): Promise<Record<string, string>> {
  const roles: Record<string, string> = {};
  for (const [name, permissions] of Object.entries(SYSTEM_ROLES)) {
    const role = await prisma.role.create({
      data: { name, permissions: [...permissions], isSystem: true },
    });
    roles[name] = role.id;
  }
  return roles;
}

export const seedOrganization = () =>
  prisma.organization.create({ data: { name: "Тест ХХК", slug: "test" } });

export async function createUser(input: {
  email: string;
  password: string;
  roleId?: string;
  name?: string;
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name ?? "Тест",
      passwordHash: await hashPassword(input.password),
      status: "ACTIVE",
      roleId: input.roleId,
    },
  });
}

/** Нэвтэрч access token авна. */
export async function login(email: string, password: string): Promise<string> {
  const response = await api().post(`${PREFIX}/auth/login`).send({ email, password }).expect(200);
  return response.body.accessToken as string;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
