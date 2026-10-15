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
import { FieldGroup } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import {
  useCreateCompositeBuilderViewEntry,
  useUpdateCompositeBuilderViewEntry,
} from "../builder.config";
import { RuntimeSubformField } from "./RuntimeSubformField";

function DrawerShell({
  open,
  title,
  description,
  onClose,
  children,
}: RuntimeEntryDialogShellProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl data-[side=right]:lg:max-w-4xl"
      >
        <SheetHeader className="border-b bg-muted/20 px-5 py-4 pr-12">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          <SheetDescription className="truncate">{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
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
    <SheetFooter className="mx-0 mt-0 mb-0 flex-row justify-end rounded-none border-t bg-background px-5 py-3">
      <Button type="button" variant="outline" className="min-w-24" onClick={onClose}>
        Болих
      </Button>
      <Button type="submit" className="min-w-28" disabled={isSaving}>
        {isSaving ? "Хадгалж байна..." : "Хадгалах"}
      </Button>
    </SheetFooter>
  );
}

export const RuntimeEntryDialog = createRuntimeEntryDialogComponent<
  builder.BuilderView,
  builder.BuilderViewEntry,
  builder.UpdateBuilderViewEntryInput
>({
  DialogShell: DrawerShell,
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
