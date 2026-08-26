"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUILDER_EDITOR_NONE_VALUE,
  type BuilderViewDialogBodyProps,
  type BuilderViewDialogProps,
  type BuilderViewDialogShellProps,
  type BuilderViewEditorValues,
  builderViewEditorInputFromValues,
  createBuilderViewDialogComponent,
} from "@winu/builder-ui/admin";
import type { Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { builder as builderContract, PERMISSIONS } from "@/api/generated/contracts";
import { SelectField, TextareaField, TextField } from "@/components/form";
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

const NONE = BUILDER_EDITOR_NONE_VALUE;
const DEFAULT_PERMISSION = "org:manage";

const valuesSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  formId: z.string(),
  listId: z.string(),
  permissionRead: z.string(),
  permissionWrite: z.string(),
  triggersText: z.string().optional(),
  version: z.number().int(),
});

type Values = BuilderViewEditorValues;

const permissionOptions = PERMISSIONS.map((permission) => ({
  value: permission,
  label: permission,
}));

const emptyValues: Values = {
  title: "",
  description: "",
  formId: NONE,
  listId: NONE,
  permissionRead: DEFAULT_PERMISSION,
  permissionWrite: DEFAULT_PERMISSION,
  triggersText: "[]",
  version: 0,
};

function parseTriggers(value: string): builderContract.BuilderTrigger[] {
  return builderContract.builderTriggerSchema.array().parse(JSON.parse(value));
}

function parsePermission(value: string): builderContract.BuilderView["permissionRead"] {
  return builderContract.permissionSchema.parse(value);
}

function buildInput(values: Values): builderContract.UpdateBuilderViewInput {
  const input = builderViewEditorInputFromValues(values, parseTriggers);
  return builderContract.updateBuilderViewSchema.parse({
    ...input,
    permissionRead: parsePermission(input.permissionRead),
    permissionWrite: parsePermission(input.permissionWrite),
  });
}

function notifyError(error: unknown) {
  toast.error(apiErrorMessage(error));
}

function ViewDialogShell({
  open,
  editing,
  onClose,
  children,
}: BuilderViewDialogShellProps<builderContract.BuilderView>) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Dynamic View засах" : "Dynamic View нэмэх"}</DialogTitle>
          <DialogDescription>
            Form + List сонгож runtime дээр дуудагдах view үүсгэнэ.
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function ViewDialogBody({
  forms,
  lists,
  permissionOptions,
  noneValue,
  isSaving,
  onClose,
}: BuilderViewDialogBodyProps<builderContract.BuilderForm, builderContract.BuilderList>) {
  return (
    <>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField<Values> name="title" label="Гарчиг" placeholder="Харилцагч" />
        </div>
        <TextareaField<Values> name="description" label="Тайлбар" rows={2} />
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField<Values>
            name="formId"
            label="Form"
            options={[
              { value: noneValue, label: "Form сонгохгүй" },
              ...forms.map((item) => ({ value: item.id, label: item.title })),
            ]}
          />
          <SelectField<Values>
            name="listId"
            label="List"
            options={[
              { value: noneValue, label: "List сонгохгүй" },
              ...lists.map((item) => ({ value: item.id, label: item.title })),
            ]}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField<Values>
            name="permissionRead"
            label="Унших эрх"
            options={permissionOptions}
          />
          <SelectField<Values>
            name="permissionWrite"
            label="Бичих эрх"
            options={permissionOptions}
          />
        </div>
        <TextareaField<Values>
          name="triggersText"
          label="Triggers JSON"
          rows={5}
          description="beforeCreate/afterCreate гэх мэт event + callApi/webhook/audit action metadata."
        />
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Болих
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Хадгалж байна…" : "Хадгалах"}
        </Button>
      </DialogFooter>
    </>
  );
}

const BuilderViewDialogComponent = createBuilderViewDialogComponent<
  builderContract.BuilderView,
  builderContract.BuilderForm,
  builderContract.BuilderList,
  builderContract.UpdateBuilderViewInput
>({
  emptyValues,
  defaultPermission: DEFAULT_PERMISSION,
  permissionOptions,
  noneValue: NONE,
  resolver: zodResolver(valuesSchema) as Resolver<Values>,
  labels: {
    created: "View үүслээ",
    saved: "View хадгалагдлаа",
  },
  buildInput,
  notifications: {
    success: toast.success,
    error: notifyError,
  },
  Shell: ViewDialogShell,
  Body: ViewDialogBody,
});

export function BuilderViewDialog(
  props: BuilderViewDialogProps<
    builderContract.BuilderView,
    builderContract.BuilderForm,
    builderContract.BuilderList,
    builderContract.UpdateBuilderViewInput
  >,
) {
  return <BuilderViewDialogComponent {...props} />;
}
