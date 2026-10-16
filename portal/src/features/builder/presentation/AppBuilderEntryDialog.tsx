"use client";

import type { ReadyBuilderContracts } from "@duke333/builder-ui";
import {
  createRuntimeEntryDialogComponent,
  type RuntimeEntryDialogActionsProps,
  type RuntimeEntryDialogFieldsProps,
  type RuntimeEntryDialogShellProps,
} from "@duke333/builder-ui/components";
import type { BuilderHooks } from "@duke333/builder-ui/hooks";
import type { BuilderRuntimeEntryValues } from "@duke333/builder-ui/runtime";
import { toast } from "sonner";
import { DataForm } from "@/components/data";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { AppBuilderPresentationShell } from "./AppBuilderPresentationShell";
import { createAppBuilderSubformField } from "./AppBuilderSubformField";

type BuilderFormSchema = ReadyBuilderContracts["BuilderForm"]["schema"];
type BuilderView = ReadyBuilderContracts["BuilderView"];
type BuilderViewEntry = ReadyBuilderContracts["BuilderViewEntry"];
type UpdateBuilderViewEntryInput = ReadyBuilderContracts["UpdateBuilderViewEntryInput"];

const PresentationShell = (props: RuntimeEntryDialogShellProps) => (
  <AppBuilderPresentationShell {...props} />
);

function FormFields({
  formId,
  viewId,
  schema,
  namePrefix,
  extraItems,
}: RuntimeEntryDialogFieldsProps<BuilderFormSchema>) {
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
    <div className="mx-0 mt-0 mb-0 flex flex-row justify-end gap-2 rounded-none border-t bg-background px-5 py-3">
      <Button type="button" variant="outline" className="min-w-24" onClick={onClose}>
        Болих
      </Button>
      <Button type="submit" className="min-w-28" disabled={isSaving}>
        {isSaving ? "Хадгалж байна..." : "Хадгалах"}
      </Button>
    </div>
  );
}

export function createAppBuilderEntryDialog(hooks: BuilderHooks<ReadyBuilderContracts>) {
  return createRuntimeEntryDialogComponent<
    BuilderView,
    BuilderViewEntry,
    UpdateBuilderViewEntryInput
  >({
    DialogShell: PresentationShell,
    FormFields,
    Actions,
    formClassName: "flex min-h-0 flex-1 flex-col",
    SubformField: createAppBuilderSubformField(hooks),
    useCreateCompositeEntry: hooks.useCreateCompositeBuilderViewEntry,
    useUpdateCompositeEntry: hooks.useUpdateCompositeBuilderViewEntry,
    notifications: {
      success: toast.success,
      error: toast.error,
      errorMessage: apiErrorMessage,
    },
  });
}
