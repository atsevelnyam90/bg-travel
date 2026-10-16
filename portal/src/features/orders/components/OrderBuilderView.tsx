"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { builderClient, useSaveBuilderViewEntry } from "@/features/builder/builder.config";
import {
  type AppBuilderViewEntry,
  type AppBuilderViewExtension,
  createAppBuilderView,
} from "@/features/builder/presentation";
import { BUILDER_RUNTIME_IDS } from "@/features/builder/runtimeIds";
import { apiErrorMessage } from "@/lib/api/errorMessage";

function OrderConfirmationCell({ entry }: { entry: AppBuilderViewEntry }) {
  const [open, setOpen] = useState(false);
  const save = useSaveBuilderViewEntry(BUILDER_RUNTIME_IDS.orderView);
  const isConfirmed = entry.values.status === "PAID";
  const orderNumber =
    typeof entry.values.public_order_id === "string"
      ? entry.values.public_order_id
      : "Энэ захиалга";

  if (isConfirmed) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-green-600 text-sm">
        <CircleCheck className="size-4" />
        Баталгаажсан
      </span>
    );
  }

  async function confirmOrder() {
    try {
      await save.mutateAsync({
        id: entry.id,
        input: {
          values: { ...entry.values, status: "PAID" },
          version: entry.version,
        },
      });
      setOpen(false);
      toast.success("Захиалга баталгаажлаа");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Захиалга баталгаажуулахад алдаа гарлаа"));
    }
  }

  return (
    <div data-builder-row-action>
      <Button
        size="sm"
        variant="outline"
        className="border-primary/40 bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        Баталгаажуулах
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!save.isPending) setOpen(next);
        }}
      >
        <AlertDialogContent onClick={(event) => event.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Захиалгыг баталгаажуулах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              {orderNumber} захиалгын төлбөрийг хүлээн авсан гэж тэмдэглэнэ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={save.isPending}>Болих</AlertDialogCancel>
            <Button
              disabled={save.isPending}
              onClick={(event) => {
                event.stopPropagation();
                void confirmOrder();
              }}
            >
              {save.isPending ? "Баталгаажуулж байна..." : "Баталгаажуулах"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const extendOrderColumns: AppBuilderViewExtension = ({ view, columns }) => {
  if (view.id !== BUILDER_RUNTIME_IDS.orderView) return;

  const confirmationColumn = {
    id: "orderConfirmation",
    header: "Баталгаажуулалт",
    meta: { label: "Баталгаажуулалт" },
    enableHiding: false,
    cell: ({ row }: { row: { original: AppBuilderViewEntry } }) => (
      <OrderConfirmationCell entry={row.original} />
    ),
  };
  const orderNumberIndex = columns.findIndex((column) => column.id === "public_order_id");
  columns.splice(orderNumberIndex + 1, 0, confirmationColumn);
};

export const OrderBuilderView = createAppBuilderView(builderClient.hooks, {
  extendColumns: extendOrderColumns,
});
