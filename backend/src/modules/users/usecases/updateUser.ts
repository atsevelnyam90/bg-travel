import type { users as usersContract } from "@winu/contracts";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  status: true,
  roleId: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toUser(row: {
  id: string;
  email: string;
  name: string;
  status: "ACTIVE" | "INVITED" | "DISABLED";
  roleId: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}): usersContract.User {
  return {
    ...row,
    roleId: row.roleId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateUser(id: string, input: usersContract.UpdateUserInput) {
  const existing = await prisma.user.findFirst({ where: { id }, select: USER_SELECT });
  if (!existing) throw notFound("Хэрэглэгч олдсонгүй");

  const email = input.email.toLowerCase();
  const duplicate = await prisma.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) throw badRequest("Энэ и-мэйл аль хэдийн бүртгэлтэй байна");

  if (input.roleId) {
    const role = await prisma.role.findUnique({
      where: { id: input.roleId },
      select: { id: true },
    });
    if (!role) throw badRequest("Role олдсонгүй");
  }

  const result = await prisma.user.updateMany({
    where: { id, version: input.version },
    data: {
      email,
      name: input.name,
      status: input.status,
      roleId: input.roleId,
      version: { increment: 1 },
    },
  });
  if (result.count === 0) {
    throw conflict("Энэ хэрэглэгчийг өөр хэрэглэгч зэрэг заслаа. Жагсаалтаа шинэчилнэ үү.");
  }

  const updated = await prisma.user.findFirstOrThrow({ where: { id }, select: USER_SELECT });
  return { user: toUser(updated), before: toUser(existing) };
}

export async function disableUser(id: string) {
  const existing = await prisma.user.findFirst({ where: { id }, select: { id: true } });
  if (!existing) throw notFound("Хэрэглэгч олдсонгүй");
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), status: "DISABLED", version: { increment: 1 } },
  });
}
