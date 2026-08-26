import type { audit as auditContract } from "@winu/contracts";
import { prisma } from "@/lib/prisma";

export async function listAudit(
  query: auditContract.ListAuditQuery,
): Promise<auditContract.ListAuditResponse> {
  const where = {
    ...(query.resource ? { resource: query.resource } : {}),
    ...(query.search ? { resourceId: { contains: query.search } } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        meta: true,
        ip: true,
        createdAt: true,
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      action: row.action,
      resource: row.resource,
      resourceId: row.resourceId,
      meta: row.meta ?? null,
      ip: row.ip,
      createdAt: row.createdAt.toISOString(),
      actor: row.actor,
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}
