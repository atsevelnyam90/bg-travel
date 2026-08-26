"use client";

import { Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { builder } from "@/api/generated/contracts";
import type { DataTableColumnDef } from "@/components/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BaseEntity = {
  id: string;
  title: string;
  description: string | null;
};

type EntityActions<T extends BaseEntity> = {
  onEdit: (entity: T) => void;
  onReplicate: (entity: T) => void;
  onDelete: (entity: T) => void;
  runtimeHref?: (entity: T) => string;
};

export function buildBuilderFormColumns(actions: EntityActions<builder.BuilderForm>) {
  return buildBaseColumns<builder.BuilderForm>({
    ...actions,
    kindLabel: "Form",
    detail: (form) => <Badge variant="secondary">{form.schema.fields.length} fields</Badge>,
  });
}

export function buildBuilderListColumns(actions: EntityActions<builder.BuilderList>) {
  return buildBaseColumns<builder.BuilderList>({
    ...actions,
    kindLabel: "List",
    detail: (list) => <Badge variant="secondary">{list.schema.columns.length} columns</Badge>,
  });
}

export function buildBuilderViewColumns(actions: EntityActions<builder.BuilderView>) {
  return buildBaseColumns<builder.BuilderView>({
    ...actions,
    kindLabel: "View",
    detail: (view) => (
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={view.form ? "secondary" : "outline"}>
          {view.form?.title ?? "Form алга"}
        </Badge>
        <Badge variant={view.list ? "secondary" : "outline"}>
          {view.list?.title ?? "List алга"}
        </Badge>
      </div>
    ),
  });
}

function buildBaseColumns<T extends BaseEntity>({
  onEdit,
  onReplicate,
  onDelete,
  runtimeHref,
  kindLabel,
  detail,
}: EntityActions<T> & {
  kindLabel: string;
  detail: (entity: T) => React.ReactNode;
}) {
  const columns: DataTableColumnDef<T>[] = [
    {
      accessorKey: "title",
      header: kindLabel,
      meta: { sortable: true, label: kindLabel },
      cell: ({ row }) => (
        <span className="truncate font-medium text-foreground text-sm">{row.original.title}</span>
      ),
    },
    {
      id: "detail",
      header: "Тохиргоо",
      meta: { label: "Тохиргоо" },
      cell: ({ row }) => detail(row.original),
    },
    {
      accessorKey: "description",
      header: "Тайлбар",
      meta: { label: "Тайлбар" },
      cell: ({ getValue }) => (
        <span className="line-clamp-1 text-muted-foreground text-sm">
          {(getValue() as string | null) || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Үйлдэл</div>,
      meta: { hideOnMobile: true },
      enableHiding: false,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${row.original.title} үйлдэл`}
                className="text-muted-foreground"
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {runtimeHref ? (
                <DropdownMenuItem asChild>
                  <Link href={runtimeHref(row.original)}>
                    <ExternalLink />
                    Runtime
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={() => onEdit(row.original)}>
                <Pencil />
                Засах
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onReplicate(row.original)}>
                <Copy />
                Replicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
                <Trash2 />
                Устгах
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return columns;
}
