"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { audit } from "@/api/generated/contracts";
import { Badge } from "@/components/ui/badge";

const actionLabel: Record<string, string> = {
  create: "Үүсгэсэн",
  update: "Зассан",
  delete: "Устгасан",
  invite: "Урьсан",
  login: "Нэвтэрсэн",
  logout: "Гарсан",
  "accept-invite": "Урилга авсан",
};

const resourceLabel: Record<string, string> = {
  product: "Бараа",
  user: "Хэрэглэгч",
  organization: "Байгууллага",
  role: "Role",
};

const formatter = new Intl.DateTimeFormat("mn-MN", {
  dateStyle: "short",
  timeStyle: "short",
});

// biome-ignore lint/suspicious/noExplicitAny: TanStack v9-ийн feature generic
export const auditColumns: ColumnDef<any, audit.AuditEntry, unknown>[] = [
  {
    accessorKey: "createdAt",
    header: "Хэзээ",
    meta: { label: "Хэзээ" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap tabular-nums">
        {formatter.format(new Date(getValue() as string))}
      </span>
    ),
  },
  {
    id: "actor",
    header: "Хэн",
    meta: { label: "Хэн" },
    cell: ({ row }) => row.original.actor?.name ?? "—",
  },
  {
    accessorKey: "action",
    header: "Юу",
    meta: { label: "Юу" },
    cell: ({ getValue }) => {
      const action = getValue() as string;
      return (
        <Badge
          variant="secondary"
          className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
        >
          {actionLabel[action] ?? action}
        </Badge>
      );
    },
  },
  {
    accessorKey: "resource",
    header: "Юун дээр",
    meta: { label: "Юун дээр" },
    cell: ({ getValue }) => resourceLabel[getValue() as string] ?? (getValue() as string),
  },
];
