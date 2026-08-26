"use client";

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
import {
  useRunRuntimeBuilderFieldTrigger,
  useRuntimeBuilderFormFieldOptions,
} from "@/features/builder/hooks/useBuilder";
import { apiErrorMessage } from "@/lib/api/errorMessage";

type DataFormProps<T extends FieldValues> = {
  formId?: string;
  viewId?: string;
  schema: builder.BuilderFormSchema;
  namePrefix?: Path<T>;
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

export function DataForm<T extends FieldValues>({
  formId,
  viewId,
  schema,
  namePrefix,
}: DataFormProps<T>) {
  return (
    <>
      {schema.fields.map((field) => (
        <DataFormField<T>
          key={field.key}
          formId={formId}
          viewId={viewId}
          field={field}
          namePrefix={namePrefix}
        />
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

  if (field.type === "textarea") {
    fieldElement = (
      <TextareaField<T>
        name={name}
        label={field.label}
        description={field.description}
        placeholder={field.placeholder}
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
          placeholder={field.placeholder}
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
              placeholder={field.placeholder}
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
        placeholder={field.placeholder}
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
      placeholder={field.placeholder ?? (options.isPending ? "Уншиж байна..." : "Сонгоно уу")}
      options={options.data ?? []}
      disabled={disabled || !formId || options.isPending}
    />
  );
}
