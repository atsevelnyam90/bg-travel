"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { BuilderApiContracts } from "../api";
import type { BuilderHooks } from "../hooks";
import {
  type BuilderRuntimeFormSchemaLike,
  type BuilderRuntimeFormValues,
  createBuilderFormDefaultValues,
} from "../runtime";

export type DynamicFormContracts = BuilderApiContracts & {
  BuilderForm: {
    id: string;
    title: string;
    schema: BuilderRuntimeFormSchemaLike;
  };
  CreateBuilderViewEntryInput: BuilderRuntimeFormValues;
};

export type DynamicFormProps = {
  formId: string;
};

export type DynamicFormShellProps = {
  title: string;
  children: ReactNode;
};

export type DynamicFormFieldsProps<TSchema> = {
  formId: string;
  schema: TSchema;
  namePrefix: "values";
};

export type DynamicFormSubmitProps = {
  isSaving: boolean;
};

export type DynamicFormErrorStateProps = {
  title: string;
  description: string;
};

export type DynamicFormNotifications = {
  success(message: string): void;
  error(message: string): void;
  errorMessage(error: unknown, fallback: string): string;
};

export type DynamicFormDependencies<C extends DynamicFormContracts> = {
  hooks: Pick<BuilderHooks<C>, "useRuntimeBuilderForm" | "useSaveRuntimeBuilderFormEntry">;
  FormShell: ComponentType<DynamicFormShellProps>;
  FormFields: ComponentType<DynamicFormFieldsProps<C["BuilderForm"]["schema"]>>;
  SubmitButton: ComponentType<DynamicFormSubmitProps>;
  ErrorState: ComponentType<DynamicFormErrorStateProps>;
  notifications: DynamicFormNotifications;
};

export function createDynamicFormComponent<C extends DynamicFormContracts>(
  deps: DynamicFormDependencies<C>,
) {
  return function DynamicForm({ formId }: DynamicFormProps) {
    const query = deps.hooks.useRuntimeBuilderForm(formId);
    const save = deps.hooks.useSaveRuntimeBuilderFormEntry(formId);
    const formValues = useMemo(
      () => (query.data ? createBuilderFormDefaultValues(query.data.schema) : undefined),
      [query.data],
    );
    const form = useForm<BuilderRuntimeFormValues>({
      defaultValues: createBuilderFormDefaultValues(query.data?.schema),
      values: formValues,
    });

    const onSubmit = form.handleSubmit(async (values) => {
      try {
        await save.mutateAsync(values as C["CreateBuilderViewEntryInput"]);
        form.reset(createBuilderFormDefaultValues(query.data?.schema));
        deps.notifications.success("Form хадгалагдлаа");
      } catch (error) {
        deps.notifications.error(deps.notifications.errorMessage(error, "Хадгалахад алдаа гарлаа"));
      }
    });

    if (query.isError) {
      return (
        <deps.ErrorState
          title="Form нээгдсэнгүй"
          description={`«${formId}» id-тай form олдсонгүй.`}
        />
      );
    }

    if (!query.data) return null;

    return (
      <deps.FormShell title={query.data.title}>
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <deps.FormFields formId={formId} schema={query.data.schema} namePrefix="values" />
            <deps.SubmitButton isSaving={save.isPending} />
          </form>
        </FormProvider>
      </deps.FormShell>
    );
  };
}
