import { isPermission, type Permission } from "@winu/contracts";
import { prisma } from "@/lib/prisma";

export type AuthContext = {
  userId: string;
  sessionKey: string;
  permissions: readonly Permission[];
};

/**
 * Хэрэглэгчийн эрхийг DB-ээс уншина.
 *
 * ⚠️ `orgId` БАЙХГҮЙ: starter нь "клиент бүрт тусдаа deployment, тусдаа DB"
 * загвартай тул нэг DB дотор нэг байгууллага байна. Хүснэгт бүрд orgId
 * зөөвөл юуг ч тусгаарлахгүй мөртөө query бүрд мартагдах эрсдэл нэмнэ.
 * Дэлгэрэнгүй: prisma/schema.prisma-ийн Organization дээрх тайлбар.
 */
export async function resolveAuthContext(input: {
  userId: string;
  sessionKey: string;
}): Promise<AuthContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      status: true,
      deletedAt: true,
      role: { select: { permissions: true } },
    },
  });

  // Устгагдсан / идэвхгүй хэрэглэгч нэвтэрч чадахгүй — токен нь хүчинтэй ч гэсэн.
  if (!user || user.deletedAt || user.status === "DISABLED") return null;

  return {
    userId: user.id,
    sessionKey: input.sessionKey,
    // DB дэх мөрүүд эрхийн жагсаалтаас хасагдсан байж болно (код өөрчлөгдсөн).
    // Танихгүйг чимээгүй хаяна — таамаглаж хөрвүүлэхгүй.
    permissions: (user.role?.permissions ?? []).filter(isPermission),
  };
}
