"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { FormProvider, type Resolver, type UseFormReturn, useForm } from "react-hook-form";
import {
  type BuilderViewEditorEntity,
  type BuilderViewEditorValues,
  builderViewEditorValuesFromEntity,
} from "./editorState";

type BuilderOptionEntity = {
  id: string;
  title: string;
};

type BuilderViewDialogSaveMutation<TInput> = (args: {
  id?: string;
  input: TInput;
}) => Promise<unknown>;

type BuilderViewDialogNotifications = {
  success(message: string): void;
  error(error: unknown): void;
};

type BuilderViewDialogLabels = {
  created: string;
  saved: string;
};

export type BuilderViewDialogProps<TView, TForm, TList, TInput> = {
  open: boolean;
  editing: TView | null;
  forms: TForm[];
  lists: TList[];
  onClose(): void;
  onSave: BuilderViewDialogSaveMutation<TInput>;
  isSaving: boolean;
};

export type BuilderViewDialogShellProps<TView> = {
  open: boolean;
  editing: TView | null;
  onClose(): void;
  children: ReactNode;
};

export type BuilderViewDialogBodyProps<TForm, TList> = {
  form: UseFormReturn<BuilderViewEditorValues>;
  editing: BuilderViewEditorEntity | null;
  forms: TForm[];
  lists: TList[];
  permissionOptions: Array<{ value: string; label: string }>;
  noneValue: string;
  isSaving: boolean;
  onClose(): void;
};

export type BuilderViewDialogDependencies<
  TView extends BuilderViewEditorEntity & { id: string },
  TForm extends BuilderOptionEntity,
  TList extends BuilderOptionEntity,
  TInput,
> = {
  emptyValues: BuilderViewEditorValues;
  defaultPermission: string;
  permissionOptions: Array<{ value: string; label: string }>;
  noneValue: string;
  resolver?: Resolver<BuilderViewEditorValues>;
  labels: BuilderViewDialogLabels;
  buildInput(values: BuilderViewEditorValues): TInput;
  notifications: BuilderViewDialogNotifications;
  Shell(props: BuilderViewDialogShellProps<TView>): ReactNode;
  Body(props: BuilderViewDialogBodyProps<TForm, TList>): ReactNode;
};

export function createBuilderViewDialogComponent<
  TView extends BuilderViewEditorEntity & { id: string },
  TForm extends BuilderOptionEntity,
  TList extends BuilderOptionEntity,
  TInput,
>(deps: BuilderViewDialogDependencies<TView, TForm, TList, TInput>) {
  return function BuilderViewDialog({
    open,
    editing,
    forms,
    lists,
    onClose,
    onSave,
    isSaving,
  }: BuilderViewDialogProps<TView, TForm, TList, TInput>) {
    const form = useForm<BuilderViewEditorValues>({
      resolver: deps.resolver,
      defaultValues: deps.emptyValues,
    });

    useEffect(() => {
      if (!open) return;
      form.reset(
        builderViewEditorValuesFromEntity(editing, deps.emptyValues, deps.defaultPermission),
      );
    }, [editing, form, open]);

    const onSubmit = form.handleSubmit(async (values) => {
      try {
        await onSave({ id: editing?.id, input: deps.buildInput(values) });
        onClose();
        deps.notifications.success(editing ? deps.labels.saved : deps.labels.created);
      } catch (error) {
        deps.notifications.error(error);
      }
    });

    return (
      <deps.Shell open={open} editing={editing} onClose={onClose}>
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate>
            {deps.Body({
              form,
              editing,
              forms,
              lists,
              permissionOptions: deps.permissionOptions,
              noneValue: deps.noneValue,
              isSaving,
              onClose,
            })}
          </form>
        </FormProvider>
      </deps.Shell>
    );
  };
}
