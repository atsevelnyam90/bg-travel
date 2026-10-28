"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit?(event: MouseEvent): void;
  onDelete?(event: MouseEvent): void;
}) {
  if (!onEdit && !onDelete) return null;

  return (
    <div className="text-right" data-row-action>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Мөрийн үйлдэл"
            className="text-muted-foreground"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          {onEdit ? (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Засах
            </DropdownMenuItem>
          ) : null}
          {onEdit && onDelete ? <DropdownMenuSeparator /> : null}
          {onDelete ? (
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 />
              Устгах
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
