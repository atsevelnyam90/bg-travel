"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  FormProvider,
  type Resolver,
  type UseFieldArrayReturn,
  type UseFormReturn,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  type BuilderEditorDbTable,
  type BuilderEditorTriggerValues,
  type BuilderFormEditorEntity,
  type BuilderFormEditorFieldValues,
  type BuilderFormEditorValues,
  type BuilderListEditorColumnValues,
  type BuilderListEditorEntity,
  type BuilderListEditorValues,
  builderFormEditorDefaultLayoutGroups,
  builderFormEditorFieldsFromTable,
  builderFormEditorValuesFromEntity,
  builderListEditorColumnsFromTable,
  builderListEditorValuesFromEntity,
} from "./editorState";

type BuilderEditorEntity = {
  id: string;
};

type BuilderEditorQuery<TEntity> = {
  data?: TEntity;
  isPending: boolean;
  isError: boolean;
};

type BuilderEditorListQuery<TItem> = {
  data?: TItem[];
};

type BuilderEditorSaveMutation<TInput, TEntity> = {
  mutateAsync(args: { id?: string; input: TInput }): Promise<TEntity>;
  isPending: boolean;
};

type BuilderEditorNotifications = {
  success(message: string): void;
  error(error: unknown): void;
};

type BuilderEditorLabels = {
  created: string;
  saved: string;
};

type BuilderEditorStateLabels = {
  loading: string;
  error: string;
};

export type BuilderFormEditorBodyProps<TFieldType extends string, TTriggerEvent extends string> = {
  formId?: string;
  form: UseFormReturn<BuilderFormEditorValues<TFieldType, TTriggerEvent>>;
  fieldArray: UseFieldArrayReturn<BuilderFormEditorValues<TFieldType, TTriggerEvent>, "fields">;
  triggerArray: UseFieldArrayReturn<BuilderFormEditorValues<TFieldType, TTriggerEvent>, "triggers">;
  fields: BuilderFormEditorFieldValues<TFieldType>[];
  sourceType: BuilderFormEditorValues<TFieldType, TTriggerEvent>["sourceType"];
  sourceTable: string;
  tables: BuilderEditorDbTable<TFieldType>[];
  emptyField: BuilderFormEditorFieldValues<TFieldType>;
  emptyTrigger: BuilderEditorTriggerValues<TTriggerEvent>;
  isSaving: boolean;
  importFieldsFromTable(): void;
};

export type BuilderListEditorBodyProps<TTriggerEvent extends string> = {
  listId?: string;
  form: UseFormReturn<BuilderListEditorValues<TTriggerEvent>>;
  columnArray: UseFieldArrayReturn<BuilderListEditorValues<TTriggerEvent>, "columns">;
  triggerArray: UseFieldArrayReturn<BuilderListEditorValues<TTriggerEvent>, "triggers">;
  sourceType: BuilderListEditorValues<TTriggerEvent>["sourceType"];
  sourceTable: string;
  tables: BuilderEditorDbTable[];
  emptyColumn: BuilderListEditorColumnValues;
  emptyTrigger: BuilderEditorTriggerValues<TTriggerEvent>;
  isSaving: boolean;
  importColumnsFromTable(): void;
};

export type BuilderFormEditorPageDependencies<
  TEntity extends BuilderEditorEntity & BuilderFormEditorEntity<TFieldType, TTriggerEvent>,
  TInput,
  TFieldType extends string,
  TTriggerEvent extends string,
> = {
  emptyValues: BuilderFormEditorValues<TFieldType, TTriggerEvent>;
  emptyField: BuilderFormEditorFieldValues<TFieldType>;
  emptyTrigger: BuilderEditorTriggerValues<TTriggerEvent>;
  resolver?: Resolver<BuilderFormEditorValues<TFieldType, TTriggerEvent>>;
  labels: BuilderEditorLabels;
  states: BuilderEditorStateLabels;
  hooks: {
    useEntity(id?: string): BuilderEditorQuery<TEntity>;
    useTables(): BuilderEditorListQuery<BuilderEditorDbTable<TFieldType>>;
    useSave(): BuilderEditorSaveMutation<TInput, TEntity>;
  };
  buildInput(values: BuilderFormEditorValues<TFieldType, TTriggerEvent>): TInput;
  navigateAfterCreate(entity: TEntity): void;
  notifications: BuilderEditorNotifications;
  Body(props: BuilderFormEditorBodyProps<TFieldType, TTriggerEvent>): ReactNode;
};

export type BuilderListEditorPageDependencies<
  TEntity extends BuilderEditorEntity & BuilderListEditorEntity<TTriggerEvent>,
  TInput,
  TTriggerEvent extends string,
> = {
  emptyValues: BuilderListEditorValues<TTriggerEvent>;
  emptyColumn: BuilderListEditorColumnValues;
  emptyTrigger: BuilderEditorTriggerValues<TTriggerEvent>;
  resolver?: Resolver<BuilderListEditorValues<TTriggerEvent>>;
  labels: BuilderEditorLabels;
  states: BuilderEditorStateLabels;
  hooks: {
    useEntity(id?: string): BuilderEditorQuery<TEntity>;
    useTables(): BuilderEditorListQuery<BuilderEditorDbTable>;
    useSave(): BuilderEditorSaveMutation<TInput, TEntity>;
  };
  buildInput(values: BuilderListEditorValues<TTriggerEvent>): TInput;
  navigateAfterCreate(entity: TEntity): void;
  notifications: BuilderEditorNotifications;
  Body(props: BuilderListEditorBodyProps<TTriggerEvent>): ReactNode;
};

export function createBuilderFormEditorPageComponent<
  TEntity extends BuilderEditorEntity & BuilderFormEditorEntity<TFieldType, TTriggerEvent>,
  TInput,
  TFieldType extends string,
  TTriggerEvent extends string,
>(deps: BuilderFormEditorPageDependencies<TEntity, TInput, TFieldType, TTriggerEvent>) {
  return function BuilderFormEditorPage({ formId }: { formId?: string }) {
    const entityQuery = deps.hooks.useEntity(formId);
    const tables = deps.hooks.useTables();
    const save = deps.hooks.useSave();
    const form = useForm<BuilderFormEditorValues<TFieldType, TTriggerEvent>>({
      resolver: deps.resolver,
      defaultValues: deps.emptyValues,
    });
    const fieldArray = useFieldArray({ control: form.control, name: "fields" });
    const triggerArray = useFieldArray({ control: form.control, name: "triggers" });
    const fields = useWatch({ control: form.control, name: "fields" }) ?? [];
    const sourceType = useWatch({ control: form.control, name: "sourceType" });
    const sourceTable = useWatch({ control: form.control, name: "sourceTable" });

    useEffect(() => {
      if (formId && !entityQuery.data) return;
      form.reset(builderFormEditorValuesFromEntity(entityQuery.data ?? null, deps.emptyValues));
    }, [entityQuery.data, form, formId]);

    const importFieldsFromTable = () => {
      const table = tables.data?.find((item) => item.name === sourceTable);
      if (!table) return;
      const nextFields = builderFormEditorFieldsFromTable(table);
      fieldArray.replace(nextFields);
      form.setValue("layoutGroups", builderFormEditorDefaultLayoutGroups(nextFields), {
        shouldDirty: true,
      });
    };

    const onSubmit = form.handleSubmit(async (values) => {
      try {
        const saved = await save.mutateAsync({ id: formId, input: deps.buildInput(values) });
        deps.notifications.success(formId ? deps.labels.saved : deps.labels.created);
        if (!formId) deps.navigateAfterCreate(saved);
      } catch (error) {
        deps.notifications.error(error);
      }
    });

    if (formId && entityQuery.isPending) {
      return <div className="text-muted-foreground text-sm">{deps.states.loading}</div>;
    }

    if (formId && entityQuery.isError) {
      return <div className="text-destructive text-sm">{deps.states.error}</div>;
    }

    return (
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          {deps.Body({
            formId,
            form,
            fieldArray,
            triggerArray,
            fields,
            sourceType,
            sourceTable,
            tables: tables.data ?? [],
            emptyField: deps.emptyField,
            emptyTrigger: deps.emptyTrigger,
            isSaving: save.isPending,
            importFieldsFromTable,
          })}
        </form>
      </FormProvider>
    );
  };
}

export function createBuilderListEditorPageComponent<
  TEntity extends BuilderEditorEntity & BuilderListEditorEntity<TTriggerEvent>,
  TInput,
  TTriggerEvent extends string,
>(deps: BuilderListEditorPageDependencies<TEntity, TInput, TTriggerEvent>) {
  return function BuilderListEditorPage({ listId }: { listId?: string }) {
    const entityQuery = deps.hooks.useEntity(listId);
    const tables = deps.hooks.useTables();
    const save = deps.hooks.useSave();
    const form = useForm<BuilderListEditorValues<TTriggerEvent>>({
      resolver: deps.resolver,
      defaultValues: deps.emptyValues,
    });
    const columnArray = useFieldArray({ control: form.control, name: "columns" });
    const triggerArray = useFieldArray({ control: form.control, name: "triggers" });
    const sourceType = useWatch({ control: form.control, name: "sourceType" });
    const sourceTable = useWatch({ control: form.control, name: "sourceTable" });

    useEffect(() => {
      if (listId && !entityQuery.data) return;
      form.reset(builderListEditorValuesFromEntity(entityQuery.data ?? null, deps.emptyValues));
    }, [entityQuery.data, form, listId]);

    const importColumnsFromTable = () => {
      const table = tables.data?.find((item) => item.name === sourceTable);
      if (!table) return;
      columnArray.replace(builderListEditorColumnsFromTable(table));
    };

    const onSubmit = form.handleSubmit(async (values) => {
      try {
        const saved = await save.mutateAsync({ id: listId, input: deps.buildInput(values) });
        deps.notifications.success(listId ? deps.labels.saved : deps.labels.created);
        if (!listId) deps.navigateAfterCreate(saved);
      } catch (error) {
        deps.notifications.error(error);
      }
    });

    if (listId && entityQuery.isPending) {
      return <div className="text-muted-foreground text-sm">{deps.states.loading}</div>;
    }

    if (listId && entityQuery.isError) {
      return <div className="text-destructive text-sm">{deps.states.error}</div>;
    }

    return (
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          {deps.Body({
            listId,
            form,
            columnArray,
            triggerArray,
            sourceType,
            sourceTable,
            tables: tables.data ?? [],
            emptyColumn: deps.emptyColumn,
            emptyTrigger: deps.emptyTrigger,
            isSaving: save.isPending,
            importColumnsFromTable,
          })}
        </form>
      </FormProvider>
    );
  };
}
