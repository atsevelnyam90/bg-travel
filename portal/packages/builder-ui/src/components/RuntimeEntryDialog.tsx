"use client";

import type { ComponentType, ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  type BuilderRuntimeEntryLike,
  type BuilderRuntimeEntryValues,
  type BuilderRuntimeFormSchemaLike,
  type BuilderRuntimeViewLike,
  createBuilderEntryDefaultValues,
} from "../runtime";

export type RuntimeEntryDialogViewLike = BuilderRuntimeViewLike & {
  id: string;
  title: string;
  form?: {
    id: string;
    schema: BuilderRuntimeFormSchemaLike;
  } | null;
};

export type RuntimeEntryDialogSaveArgs<TInput> = {
  id?: string;
  input: TInput;
};

export type RuntimeEntryDialogProps<TView, TEntry, TInput> = {
  open: boolean;
  view: TView;
  editing: TEntry | null;
  onClose: () => void;
  onSave: (args: RuntimeEntryDialogSaveArgs<TInput>) => Promise<unknown>;
  isSaving: boolean;
};

export type RuntimeEntryDialogShellProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
};

export type RuntimeEntryDialogFieldsProps<TSchema> = {
  formId: string;
  viewId: string;
  schema: TSchema;
  namePrefix: "values";
};

export type RuntimeEntryDialogActionsProps = {
  isSaving: boolean;
  onClose: () => void;
};

export type RuntimeEntryDialogNotifications = {
  success(message: string): void;
  error(message: string): void;
  errorMessage(error: unknown, fallback: string): string;
};

export type RuntimeEntryDialogDependencies<TView extends RuntimeEntryDialogViewLike> = {
  DialogShell: ComponentType<RuntimeEntryDialogShellProps>;
  FormFields: ComponentType<RuntimeEntryDialogFieldsProps<NonNullable<TView["form"]>["schema"]>>;
  Actions: ComponentType<RuntimeEntryDialogActionsProps>;
  notifications: RuntimeEntryDialogNotifications;
};

export function createRuntimeEntryDialogComponent<
  TView extends RuntimeEntryDialogViewLike,
  TEntry extends BuilderRuntimeEntryLike,
  TInput extends BuilderRuntimeEntryValues,
>(deps: RuntimeEntryDialogDependencies<TView>) {
  return function RuntimeEntryDialog({
    open,
    view,
    editing,
    onClose,
    onSave,
    isSaving,
  }: RuntimeEntryDialogProps<TView, TEntry, TInput>) {
    const form = useForm<BuilderRuntimeEntryValues>({
      defaultValues: createBuilderEntryDefaultValues(view, editing),
      values: open ? createBuilderEntryDefaultValues(view, editing) : undefined,
    });

    const onSubmit = form.handleSubmit(async (values) => {
      try {
        await onSave({ id: editing?.id, input: values as TInput });
        onClose();
        deps.notifications.success(editing ? "Мөр хадгалагдлаа" : "Мөр нэмэгдлээ");
      } catch (error) {
        deps.notifications.error(deps.notifications.errorMessage(error, "Хадгалахад алдаа гарлаа"));
      }
    });

    return (
      <deps.DialogShell
        open={open}
        title={editing ? "Мөр засах" : "Мөр нэмэх"}
        description={view.title}
        onClose={onClose}
      >
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate>
            {view.form ? (
              <deps.FormFields
                formId={view.form.id}
                viewId={view.id}
                schema={view.form.schema}
                namePrefix="values"
              />
            ) : null}
            <deps.Actions isSaving={isSaving} onClose={onClose} />
          </form>
        </FormProvider>
      </deps.DialogShell>
    );
  };
}
