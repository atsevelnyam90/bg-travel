"use client";

import {
  createRuntimeEntryDialogComponent,
  type RuntimeEntryDialogActionsProps,
  type RuntimeEntryDialogFieldsProps,
  type RuntimeEntryDialogShellProps,
} from "@duke333/builder-ui/components";
import type { BuilderRuntimeEntryValues } from "@duke333/builder-ui/runtime";
import { toast } from "sonner";
import type { builder } from "@/api/generated/contracts";
import { DataForm } from "@/components/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import {
  useCreateCompositeBuilderViewEntry,
  useUpdateCompositeBuilderViewEntry,
} from "../builder.config";
import { RuntimeSubformField } from "./RuntimeSubformField";

function DialogShell({
  open,
  title,
  description,
  onClose,
  children,
}: RuntimeEntryDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[88dvh] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="border-b bg-muted/20 px-5 py-4 pr-12">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="truncate">{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function FormFields({
  formId,
  viewId,
  schema,
  namePrefix,
  extraItems,
}: RuntimeEntryDialogFieldsProps<builder.BuilderFormSchema>) {
  return (
    <FieldGroup className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <DataForm<BuilderRuntimeEntryValues>
        formId={formId}
        viewId={viewId}
        schema={schema}
        namePrefix={namePrefix}
        extraItems={extraItems}
      />
    </FieldGroup>
  );
}

function Actions({ isSaving, onClose }: RuntimeEntryDialogActionsProps) {
  return (
    <DialogFooter className="mx-0 mt-0 mb-0 flex-row justify-end rounded-none border-t bg-background px-5 py-3">
      <Button type="button" variant="outline" className="min-w-24" onClick={onClose}>
        Болих
      </Button>
      <Button type="submit" className="min-w-28" disabled={isSaving}>
        {isSaving ? "Хадгалж байна..." : "Хадгалах"}
      </Button>
    </DialogFooter>
  );
}

export const RuntimeEntryDialog = createRuntimeEntryDialogComponent<
  builder.BuilderView,
  builder.BuilderViewEntry,
  builder.UpdateBuilderViewEntryInput
>({
  DialogShell,
  FormFields,
  Actions,
  formClassName: "flex min-h-0 flex-1 flex-col",
  SubformField: RuntimeSubformField,
  useCreateCompositeEntry: useCreateCompositeBuilderViewEntry,
  useUpdateCompositeEntry: useUpdateCompositeBuilderViewEntry,
  notifications: {
    success: toast.success,
    error: toast.error,
    errorMessage: apiErrorMessage,
  },
});
