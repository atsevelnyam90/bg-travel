import type { users as usersContract } from "@winu/contracts";
import { prisma } from "@/lib/prisma";

export async function listRoles(): Promise<usersContract.ListRolesResponse> {
  const roles = await prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    select: { id: true, name: true, description: true, isSystem: true, permissions: true },
  });

  return roles.map(({ permissions, ...role }) => ({
    ...role,
    permissionCount: permissions.length,
  }));
}
