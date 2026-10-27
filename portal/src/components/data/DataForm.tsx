"use client";

import { ReadyFileField, ReadyRichTextField } from "@duke333/builder-ui";
import { Fragment, type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Controller,
  type FieldValues,
  type Path,
  type PathValue,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import type { builder } from "@/api/generated/contracts";
import {
  CheckboxField,
  CurrencyField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useRunRuntimeBuilderFieldTrigger,
  useRuntimeBuilderFormFieldOptions,
} from "@/features/builder/builder.config";
import { apiErrorMessage } from "@/lib/api/errorMessage";

type DataFormProps<T extends FieldValues> = {
  formId?: string;
  viewId?: string;
  schema: builder.BuilderFormSchema;
  namePrefix?: Path<T>;
  extraItems?: DataFormExtraItem[];
};

export type DataFormExtraItem = {
  key: string;
  render(): ReactNode;
};

function fieldName<T extends FieldValues>(prefix: string | undefined, key: string): Path<T> {
  return (prefix ? `${prefix}.${key}` : key) as Path<T>;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function triggerPatches(response: builder.BuilderFieldTriggerResponse) {
  return {
    ...Object.fromEntries((response.schema ?? []).map((item) => [item.field, item.value])),
    ...(response.valuesPatch ?? {}),
  };
}

const layoutColumnClasses: Record<6 | 8 | 12, string> = {
  6: "md:grid-cols-6",
  8: "md:grid-cols-8",
  12: "md:grid-cols-12",
};

const layoutSpanClasses: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

type DataFormLayoutField = {
  key: string;
  field?: builder.BuilderField;
  extra?: DataFormExtraItem;
  span: number;
};

type DataFormLayoutGroup = {
  id: string;
  title?: string;
  columns: 6 | 8 | 12;
  fields: DataFormLayoutField[];
};

function clampLayoutSpan(span: number | undefined, columns: 6 | 8 | 12) {
  if (!span || Number.isNaN(span)) return columns;
  return Math.max(1, Math.min(columns, Math.trunc(span)));
}

function getDataFormLayoutGroups(
  schema: builder.BuilderFormSchema,
  extraItems: DataFormExtraItem[] = [],
): DataFormLayoutGroup[] | null {
  if (!schema.layout?.groups?.length) return null;

  const visibleFields = schema.fields.filter((field) => !field.hidden);
  const itemsByKey = new Map<string, { field?: builder.BuilderField; extra?: DataFormExtraItem }>([
    ...visibleFields.map((field) => [field.key, { field }] as const),
    ...extraItems.map((extra) => [extra.key, { extra }] as const),
  ]);
  const usedKeys = new Set<string>();
  const groups = schema.layout.groups
    .map((group, index) => {
      const columns: 6 | 8 | 12 = group.columns === 6 || group.columns === 8 ? group.columns : 12;
      const groupFields = (group.fields ?? [])
        .map((layoutField) => {
          const item = itemsByKey.get(layoutField.key);
          if (!item || usedKeys.has(layoutField.key)) return null;
          usedKeys.add(layoutField.key);
          return {
            key: layoutField.key,
            ...item,
            span: clampLayoutSpan(layoutField.span, columns),
          };
        })
        .filter((field): field is DataFormLayoutField => Boolean(field));

      return {
        id: group.id || `group${index + 1}`,
        title: group.title,
        columns,
        fields: groupFields,
      };
    })
    .filter((group) => group.fields.length > 0);

  const missingItems = Array.from(itemsByKey.entries()).filter(([key]) => !usedKeys.has(key));
  if (missingItems.length > 0) {
    groups.push({
      id: "ungrouped",
      title: "Бусад",
      columns: 12,
      fields: missingItems.map(([key, item]) => ({ key, ...item, span: 12 })),
    });
  }

  return groups.length > 0 ? groups : null;
}

export function DataForm<T extends FieldValues>({
  formId,
  viewId,
  schema,
  namePrefix,
  extraItems = [],
}: DataFormProps<T>) {
  const layoutGroups = getDataFormLayoutGroups(schema, extraItems);

  if (layoutGroups) {
    const renderGroupFields = (group: DataFormLayoutGroup) => (
      <div className={`grid grid-cols-1 gap-4 ${layoutColumnClasses[group.columns]}`}>
        {group.fields.map(({ key, field, extra, span }) => (
          <div key={key} className={`min-w-0 ${layoutSpanClasses[span] ?? "md:col-span-12"}`}>
            {field ? (
              <DataFormField<T>
                formId={formId}
                viewId={viewId}
                field={field}
                namePrefix={namePrefix}
              />
            ) : (
              extra?.render()
            )}
          </div>
        ))}
      </div>
    );

    if (schema.layout?.presentation === "tabs") {
      const firstGroup = layoutGroups[0];
      return (
        <Tabs defaultValue={firstGroup.id} className="min-h-0 gap-4">
          <TabsList variant="line" className="max-w-full justify-start overflow-x-auto">
            {layoutGroups.map((group, index) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="rounded-none border-b-2 border-b-transparent px-3 data-[state=active]:border-b-primary data-[state=active]:text-foreground"
              >
                {group.title ?? `Хэсэг ${index + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {layoutGroups.map((group) => (
            <TabsContent
              forceMount
              key={group.id}
              value={group.id}
              className="data-[state=inactive]:hidden"
            >
              {renderGroupFields(group)}
            </TabsContent>
          ))}
        </Tabs>
      );
    }

    return (
      <div className="space-y-6">
        {layoutGroups.map((group) => (
          <section key={group.id} className="space-y-3">
            {group.title ? <h3 className="font-medium text-sm">{group.title}</h3> : null}
            {renderGroupFields(group)}
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      {schema.fields
        .filter((field) => !field.hidden)
        .map((field) => (
          <DataFormField<T>
            key={field.key}
            formId={formId}
            viewId={viewId}
            field={field}
            namePrefix={namePrefix}
          />
        ))}
      {extraItems.map((item) => (
        <Fragment key={item.key}>{item.render()}</Fragment>
      ))}
    </>
  );
}

type DataFormFieldProps<T extends FieldValues> = {
  formId?: string;
  viewId?: string;
  field: builder.BuilderField;
  namePrefix?: Path<T>;
};

function DataFormField<T extends FieldValues>({
  formId,
  viewId,
  field,
  namePrefix,
}: DataFormFieldProps<T>) {
  const { control, getValues } = useFormContext<T>();
  const isDisabled = field.disabled ?? false;
  const name = fieldName<T>(namePrefix, field.key);
  const placeholder = field.placeholder?.trim() || field.label;
  const { runFieldTriggers } = useFieldTriggerActions<T>({
    formId,
    viewId,
    field,
    namePrefix,
  });
  const runBlurTriggers = useCallback(() => {
    void runFieldTriggers("onBlur", getValues(name));
  }, [getValues, name, runFieldTriggers]);

  if (field.hidden) return null;

  let fieldElement: ReactNode;

  if (field.type === "file") {
    fieldElement = <ReadyFileField field={field} formId={formId} viewId={viewId} name={name} />;
  } else if (field.type === "richtext") {
    fieldElement = <ReadyRichTextField field={field} name={name} />;
  } else if (field.type === "textarea") {
    fieldElement = (
      <TextareaField<T>
        name={name}
        label={field.label}
        description={field.description}
        placeholder={placeholder}
        rows={4}
        disabled={isDisabled}
        onBlur={runBlurTriggers}
      />
    );
  } else if (field.type === "select") {
    if (field.optionsSource) {
      fieldElement = (
        <DatasourceSelectField<T>
          formId={formId}
          field={field}
          name={name}
          namePrefix={namePrefix}
          disabled={isDisabled}
        />
      );
    } else {
      fieldElement = (
        <SelectField<T>
          name={name}
          label={field.label}
          description={field.description}
          placeholder={placeholder}
          options={field.options ?? []}
          disabled={isDisabled}
        />
      );
    }
  } else if (field.type === "checkbox") {
    fieldElement = (
      <CheckboxField<T>
        name={name}
        label={field.label}
        description={field.description}
        disabled={isDisabled}
      />
    );
  } else if (field.type === "money") {
    fieldElement = (
      <CurrencyField<T>
        name={name}
        minorUnits={field.key.endsWith("Minor") || field.key.endsWith("_minor")}
        label={field.label}
        description={field.description}
        disabled={isDisabled}
        onBlur={runBlurTriggers}
      />
    );
  } else if (field.type === "number") {
    fieldElement = (
      <Field>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
        <Controller
          control={control}
          name={name}
          render={({ field: controlField }) => (
            <Input
              id={name}
              type="number"
              placeholder={placeholder}
              disabled={isDisabled}
              value={controlField.value == null ? "" : String(controlField.value)}
              onChange={(event) =>
                controlField.onChange(event.target.value === "" ? null : Number(event.target.value))
              }
              onBlur={() => {
                controlField.onBlur();
                runBlurTriggers();
              }}
            />
          )}
        />
        {field.description ? <FieldDescription>{field.description}</FieldDescription> : null}
      </Field>
    );
  } else {
    fieldElement = (
      <TextField<T>
        name={name}
        label={field.label}
        description={field.description}
        placeholder={placeholder}
        type={field.type === "date" ? "date" : "text"}
        disabled={isDisabled}
        onBlur={runBlurTriggers}
      />
    );
  }

  return (
    <Fragment>
      <FieldTriggerRunner<T> field={field} name={name} runFieldTriggers={runFieldTriggers} />
      {fieldElement}
    </Fragment>
  );
}

type FieldTriggerRunnerProps<T extends FieldValues> = {
  field: builder.BuilderField;
  name: Path<T>;
  runFieldTriggers: (event: builder.BuilderFieldTriggerEvent, value: unknown) => Promise<void>;
};

function FieldTriggerRunner<T extends FieldValues>({
  field,
  name,
  runFieldTriggers,
}: FieldTriggerRunnerProps<T>) {
  const { control } = useFormContext<T>();
  const value = useWatch({ control, name });
  const mounted = useRef(false);
  const onChangeTriggers = (field.triggers ?? []).filter(
    (trigger) => trigger.enabled && trigger.event === "onChange",
  );
  const debounceMs = Math.max(0, ...onChangeTriggers.map((trigger) => trigger.debounceMs));

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (onChangeTriggers.length === 0) return;

    const timeoutId = window.setTimeout(async () => {
      await runFieldTriggers("onChange", value);
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, onChangeTriggers.length, runFieldTriggers, value]);

  return null;
}

type FieldTriggerActionsProps<T extends FieldValues> = {
  formId?: string;
  viewId?: string;
  field: builder.BuilderField;
  namePrefix?: Path<T>;
};

function useFieldTriggerActions<T extends FieldValues>({
  formId,
  viewId,
  field,
  namePrefix,
}: FieldTriggerActionsProps<T>) {
  const { getValues, setValue } = useFormContext<T>();
  const requestSeq = useRef(0);
  const triggerMutation = useRunRuntimeBuilderFieldTrigger();

  const runFieldTriggers = useCallback(
    async (event: builder.BuilderFieldTriggerEvent, value: unknown) => {
      const hasTriggers = (field.triggers ?? []).some(
        (trigger) => trigger.enabled && trigger.event === event,
      );
      if (!hasTriggers || (!formId && !viewId)) return;

      const currentSeq = requestSeq.current + 1;
      requestSeq.current = currentSeq;
      try {
        const values = toRecord(namePrefix ? getValues(namePrefix) : getValues());
        const response = await triggerMutation.mutateAsync({
          formId,
          viewId,
          fieldKey: field.key,
          event,
          input: { value, values },
        });
        if (requestSeq.current !== currentSeq) return;

        for (const [key, nextValue] of Object.entries(triggerPatches(response))) {
          const targetName = fieldName<T>(namePrefix, key);
          if (Object.is(getValues(targetName), nextValue)) continue;
          setValue(targetName, nextValue as PathValue<T, Path<T>>, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }

        const fieldErrors = Object.values(response.fieldErrors ?? {});
        if (fieldErrors.length > 0) toast.error(fieldErrors.join("\n"));
        if (response.toast?.message) {
          const notify = response.toast.type === "error" ? toast.error : toast;
          notify(response.toast.message);
        }
      } catch (error) {
        if (requestSeq.current === currentSeq) {
          toast.error(apiErrorMessage(error, "Field trigger ажиллахад алдаа гарлаа"));
        }
      }
    },
    [field.key, field.triggers, formId, getValues, namePrefix, setValue, triggerMutation, viewId],
  );

  return { runFieldTriggers };
}

type DatasourceSelectFieldProps<T extends FieldValues> = {
  formId?: string;
  field: builder.BuilderField;
  name: Path<T>;
  namePrefix?: Path<T>;
  disabled?: boolean;
};

function DatasourceSelectField<T extends FieldValues>({
  formId,
  field,
  name,
  namePrefix,
  disabled,
}: DatasourceSelectFieldProps<T>) {
  const { control } = useFormContext<T>();
  const dependsField = field.optionsSource?.filterBy?.valueFromField;
  const dependsName =
    namePrefix && dependsField ? (`${namePrefix}.${dependsField}` as Path<T>) : undefined;
  const dependsValue = useWatch({ control, name: dependsName ?? name });
  const query = useMemo<builder.ListBuilderFieldOptionsQuery>(() => {
    const depends: Record<string, string> = {};
    if (
      dependsField &&
      dependsValue !== undefined &&
      dependsValue !== null &&
      dependsValue !== ""
    ) {
      depends[dependsField] = String(dependsValue);
    }
    return { depends };
  }, [dependsField, dependsValue]);
  const options = useRuntimeBuilderFormFieldOptions(
    formId,
    field.key,
    query,
    Boolean(!dependsField || query.depends?.[dependsField]),
  );

  return (
    <SelectField<T>
      name={name}
      label={field.label}
      description={field.description}
      placeholder={options.isPending ? "Уншиж байна..." : field.placeholder?.trim() || field.label}
      options={options.data ?? []}
      disabled={disabled || !formId || options.isPending}
    />
  );
}
