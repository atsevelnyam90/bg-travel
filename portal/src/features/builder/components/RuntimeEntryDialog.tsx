"use client";

import {
  createRuntimeEntryDialogComponent,
  type RuntimeEntryDialogActionsProps,
  type RuntimeEntryDialogFieldsProps,
  type RuntimeEntryDialogProps,
  type RuntimeEntryDialogShellProps,
} from "@winu/builder-ui/components";
import type { BuilderRuntimeEntryValues } from "@winu/builder-ui/runtime";
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

function DialogShell({
  open,
  title,
  description,
  onClose,
  children,
}: RuntimeEntryDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
}: RuntimeEntryDialogFieldsProps<builder.BuilderFormSchema>) {
  return (
    <FieldGroup>
      <DataForm<BuilderRuntimeEntryValues>
        formId={formId}
        viewId={viewId}
        schema={schema}
        namePrefix={namePrefix}
      />
    </FieldGroup>
  );
}

function Actions({ isSaving, onClose }: RuntimeEntryDialogActionsProps) {
  return (
    <DialogFooter className="mt-6">
      <Button type="button" variant="outline" onClick={onClose}>
        Болих
      </Button>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Хадгалж байна…" : "Хадгалах"}
      </Button>
    </DialogFooter>
  );
}

const RuntimeEntryDialogComponent = createRuntimeEntryDialogComponent<
  builder.BuilderView,
  builder.BuilderViewEntry,
  builder.UpdateBuilderViewEntryInput
>({
  DialogShell,
  FormFields,
  Actions,
  notifications: {
    success: toast.success,
    error: toast.error,
    errorMessage(error, fallback) {
      return apiErrorMessage(error, fallback);
    },
  },
});

export function RuntimeEntryDialog(
  props: RuntimeEntryDialogProps<
    builder.BuilderView,
    builder.BuilderViewEntry,
    builder.UpdateBuilderViewEntryInput
  >,
) {
  return <RuntimeEntryDialogComponent {...props} />;
}
