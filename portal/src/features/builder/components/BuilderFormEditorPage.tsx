"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUILDER_EDITOR_NONE_VALUE,
  type BuilderFormEditorBodyProps,
  type BuilderFormEditorValues,
  builderFormEditorInputFromValues,
  createBuilderFormEditorPageComponent,
} from "@winu/builder-ui/admin";
import { ArrowLeft, ChevronDown, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { Controller, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { builder as builderContract } from "@/api/generated/contracts";
import { SelectField, TextareaField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { useBuilderDbTables, useBuilderForm, useSaveBuilderForm } from "../hooks/useBuilder";

type Values = BuilderFormEditorValues<
  builderContract.BuilderFieldType,
  builderContract.BuilderFormTriggerEvent
>;

const fieldTypeOptions: Array<{ value: builderContract.BuilderFieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "money", label: "Money" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
];
const formTriggerEventOptions: Array<{
  value: builderContract.BuilderFormTriggerEvent;
  label: string;
}> = [
  { value: "beforeCreate", label: "Before create" },
  { value: "afterCreate", label: "After create" },
  { value: "beforeUpdate", label: "Before update" },
  { value: "afterUpdate", label: "After update" },
];
const fieldTriggerEventOptions: Array<{
  value: builderContract.BuilderFieldTriggerEvent;
  label: string;
}> = [
  { value: "onChange", label: "On change" },
  { value: "onBlur", label: "On blur" },
];
const NONE = BUILDER_EDITOR_NONE_VALUE;

const triggerValueSchema = z.object({
  event: builderContract.builderFormTriggerEventSchema,
  route: z.string().min(1),
  enabled: z.boolean(),
  blocking: z.boolean(),
});

const fieldTriggerValueSchema = z.object({
  event: builderContract.builderFieldTriggerEventSchema,
  action: z.string().min(1),
  enabled: z.boolean(),
  debounceMs: z.number().int().min(0).max(5000),
});

const valuesSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sourceType: z.enum(["none", "dbTable", "apiEndpoint"]),
  sourceTable: z.string(),
  apiBasePath: z.string().optional(),
  fields: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      type: builderContract.builderFieldTypeSchema,
      required: z.boolean(),
      hidden: z.boolean(),
      disabled: z.boolean(),
      placeholder: z.string().optional(),
      optionsText: z.string().optional(),
      optionsMode: z.enum(["static", "table"]),
      optionsTable: z.string(),
      optionsValueField: z.string(),
      optionsLabelField: z.string(),
      optionsSearchFieldsText: z.string().optional(),
      optionsDependsOn: z.string().optional(),
      optionsFilterField: z.string().optional(),
      triggers: z.array(fieldTriggerValueSchema),
    }),
  ),
  triggers: z.array(triggerValueSchema),
  version: z.number().int(),
});

const emptyField: Values["fields"][number] = {
  key: "name",
  label: "Нэр",
  type: "text",
  required: true,
  hidden: false,
  disabled: false,
  placeholder: "",
  optionsText: "",
  optionsMode: "static",
  optionsTable: NONE,
  optionsValueField: NONE,
  optionsLabelField: NONE,
  optionsSearchFieldsText: "",
  optionsDependsOn: "",
  optionsFilterField: "",
  triggers: [],
};

const emptyValues: Values = {
  title: "",
  description: "",
  sourceType: "none",
  sourceTable: NONE,
  apiBasePath: "",
  fields: [emptyField],
  triggers: [],
  version: 0,
};

const emptyTrigger: Values["triggers"][number] = {
  event: "beforeCreate",
  route: "/api/v1/",
  enabled: false,
  blocking: true,
};

const emptyFieldTrigger: Values["fields"][number]["triggers"][number] = {
  event: "onChange",
  action: "/api/v1/",
  enabled: true,
  debounceMs: 300,
};

function fieldStateSummary(field: Values["fields"][number] | undefined) {
  const states = [
    field?.required ? "Required" : null,
    field?.hidden ? "Hidden" : null,
    field?.disabled ? "Disabled" : null,
  ].filter(Boolean);
  return states.length > 0 ? states.join(", ") : "Optional";
}

function buildInput(values: Values): builderContract.UpdateBuilderFormInput {
  return builderContract.updateBuilderFormSchema.parse(builderFormEditorInputFromValues(values));
}

function notifyError(error: unknown) {
  toast.error(apiErrorMessage(error));
}

function FormEditorBody({
  formId,
  form,
  fieldArray,
  triggerArray,
  fields,
  sourceType,
  sourceTable,
  tables,
  emptyField: fieldDefaults,
  emptyTrigger: triggerDefaults,
  isSaving,
  importFieldsFromTable,
}: BuilderFormEditorBodyProps<
  builderContract.BuilderFieldType,
  builderContract.BuilderFormTriggerEvent
>) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/winu/builder/forms" aria-label="Forms руу буцах">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-semibold text-2xl tracking-tight">
              {formId ? "Dynamic Form засах" : "Dynamic Form нэмэх"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Дан form schema. View дээр list-тэй холбогдоно.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild type="button" variant="outline">
            <Link href="/winu/builder/forms">Болих</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save />
            {isSaving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>

      <FieldGroup>
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,0.8fr)_minmax(320px,1.2fr)]">
          <TextField<Values> name="title" label="Гарчиг" placeholder="Бараа form" />
          <TextareaField<Values> name="description" label="Тайлбар" rows={1} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(260px,1fr)_220px]">
          <SelectField<Values>
            name="sourceType"
            label="Datasource"
            options={[
              { value: "none", label: "Сонгохгүй" },
              { value: "dbTable", label: "DB table" },
              { value: "apiEndpoint", label: "API endpoint" },
            ]}
          />
          {sourceType === "dbTable" ? (
            <SelectField<Values>
              name="sourceTable"
              label="Table"
              options={[
                { value: NONE, label: "Table сонгоно уу" },
                ...tables.map((table) => ({
                  value: table.name,
                  label: table.label ?? table.name,
                })),
              ]}
            />
          ) : null}
          {sourceType === "apiEndpoint" ? (
            <TextField<Values> name="apiBasePath" label="API base" placeholder="/api/v1/..." />
          ) : null}
          {sourceType === "dbTable" ? (
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={importFieldsFromTable}
                disabled={sourceTable === NONE}
              >
                Columns татах
              </Button>
            </div>
          ) : null}
        </div>
      </FieldGroup>

      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="font-medium">Fields</h2>
            <p className="text-muted-foreground text-sm">Form дээр харагдах талбарууд.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              fieldArray.append({
                ...fieldDefaults,
                key: `field${fieldArray.fields.length + 1}`,
                label: `Талбар ${fieldArray.fields.length + 1}`,
                required: false,
                hidden: false,
                disabled: false,
              })
            }
          >
            <Plus />
            Field нэмэх
          </Button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            <div className="grid grid-cols-[170px_220px_160px_140px_minmax(220px,1fr)_56px] gap-3 border-b bg-muted/30 px-4 py-2 font-medium text-muted-foreground text-xs uppercase">
              <span>Key</span>
              <span>Label</span>
              <span>Type</span>
              <span>State</span>
              <span>Placeholder</span>
              <span />
            </div>
            {fieldArray.fields.map((field, index) => {
              const selectedType = fields?.[index]?.type;
              const selectedOptionsMode = fields?.[index]?.optionsMode;
              const selectedOptionsTable = fields?.[index]?.optionsTable;
              const fieldTriggers = fields?.[index]?.triggers ?? [];
              const lookupColumns =
                tables.find((table) => table.name === selectedOptionsTable)?.lookupColumns ?? [];
              const formFields = fields?.filter((_, fieldIndex) => fieldIndex !== index) ?? [];
              return (
                <div key={field.id} className="border-b px-4 py-3 last:border-b-0">
                  <div className="grid grid-cols-[170px_220px_160px_140px_minmax(220px,1fr)_56px] items-start gap-3">
                    <Input {...form.register(`fields.${index}.key`)} />
                    <Input {...form.register(`fields.${index}.label`)} />
                    <Controller
                      control={form.control}
                      name={`fields.${index}.type`}
                      render={({ field: controlField }) => (
                        <Select value={controlField.value} onValueChange={controlField.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 justify-between px-3 font-normal"
                        >
                          <span className="truncate">{fieldStateSummary(fields?.[index])}</span>
                          <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        <DropdownMenuLabel>Field state</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                          checked={Boolean(fields?.[index]?.required)}
                          onCheckedChange={(checked) =>
                            form.setValue(`fields.${index}.required`, Boolean(checked), {
                              shouldDirty: true,
                            })
                          }
                          onSelect={(event) => event.preventDefault()}
                        >
                          Required
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={Boolean(fields?.[index]?.hidden)}
                          onCheckedChange={(checked) =>
                            form.setValue(`fields.${index}.hidden`, Boolean(checked), {
                              shouldDirty: true,
                            })
                          }
                          onSelect={(event) => event.preventDefault()}
                        >
                          Hidden
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={Boolean(fields?.[index]?.disabled)}
                          onCheckedChange={(checked) =>
                            form.setValue(`fields.${index}.disabled`, Boolean(checked), {
                              shouldDirty: true,
                            })
                          }
                          onSelect={(event) => event.preventDefault()}
                        >
                          Disabled
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Input {...form.register(`fields.${index}.placeholder`)} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Field устгах"
                      onClick={() => fieldArray.remove(index)}
                      disabled={fieldArray.fields.length === 1}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  {selectedType === "select" ? (
                    <div className="mt-3 rounded-md border bg-muted/10">
                      <div className="border-b px-3 py-2">
                        <div className="font-medium text-sm">Select options</div>
                      </div>
                      <div className="grid gap-3 px-3 py-3">
                        <div className="max-w-52">
                          <Controller
                            control={form.control}
                            name={`fields.${index}.optionsMode`}
                            render={({ field: controlField }) => (
                              <Select
                                value={controlField.value}
                                onValueChange={controlField.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="static">Static</SelectItem>
                                  <SelectItem value="table">Table</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        {selectedOptionsMode === "table" ? (
                          <div className="grid gap-2 md:grid-cols-3">
                            <Controller
                              control={form.control}
                              name={`fields.${index}.optionsTable`}
                              render={({ field: controlField }) => (
                                <Select
                                  value={controlField.value}
                                  onValueChange={(value) => {
                                    controlField.onChange(value);
                                    form.setValue(`fields.${index}.optionsValueField`, NONE);
                                    form.setValue(`fields.${index}.optionsLabelField`, NONE);
                                    form.setValue(`fields.${index}.optionsFilterField`, "");
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Table" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={NONE}>Table сонгох</SelectItem>
                                    {tables.map((table) => (
                                      <SelectItem key={table.name} value={table.name}>
                                        {table.label ?? table.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name={`fields.${index}.optionsValueField`}
                              render={({ field: controlField }) => (
                                <Select
                                  value={controlField.value}
                                  onValueChange={controlField.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Value field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={NONE}>Value field</SelectItem>
                                    {lookupColumns.map((column) => (
                                      <SelectItem key={column.name} value={column.name}>
                                        {column.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name={`fields.${index}.optionsLabelField`}
                              render={({ field: controlField }) => (
                                <Select
                                  value={controlField.value}
                                  onValueChange={controlField.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Label field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={NONE}>Label field</SelectItem>
                                    {lookupColumns.map((column) => (
                                      <SelectItem key={column.name} value={column.name}>
                                        {column.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <Textarea
                              rows={2}
                              placeholder="Search fields: name&#10;sku"
                              {...form.register(`fields.${index}.optionsSearchFieldsText`)}
                            />
                            <Controller
                              control={form.control}
                              name={`fields.${index}.optionsDependsOn`}
                              render={({ field: controlField }) => (
                                <Select
                                  value={controlField.value || NONE}
                                  onValueChange={(value) =>
                                    controlField.onChange(value === NONE ? "" : value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Depends on" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={NONE}>Depends байхгүй</SelectItem>
                                    {formFields.map((item) => (
                                      <SelectItem key={item.key} value={item.key}>
                                        {item.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <Controller
                              control={form.control}
                              name={`fields.${index}.optionsFilterField`}
                              render={({ field: controlField }) => (
                                <Select
                                  value={controlField.value || NONE}
                                  onValueChange={(value) =>
                                    controlField.onChange(value === NONE ? "" : value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Filter field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={NONE}>Filter field байхгүй</SelectItem>
                                    {lookupColumns.map((column) => (
                                      <SelectItem key={column.name} value={column.name}>
                                        {column.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        ) : (
                          <Textarea
                            rows={2}
                            placeholder="Label:value"
                            {...form.register(`fields.${index}.optionsText`)}
                          />
                        )}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-3 rounded-md border bg-muted/10">
                    <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
                      <div>
                        <div className="font-medium text-sm">Field triggers</div>
                        <div className="text-muted-foreground text-xs">
                          Field event дээр backend handler дуудна.
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          form.setValue(
                            `fields.${index}.triggers`,
                            [...fieldTriggers, emptyFieldTrigger],
                            { shouldDirty: true },
                          )
                        }
                      >
                        <Plus />
                        Trigger
                      </Button>
                    </div>
                    {fieldTriggers.length === 0 ? (
                      <div className="px-3 py-3 text-muted-foreground text-sm">
                        Field trigger алга.
                      </div>
                    ) : null}
                    {fieldTriggers.map((trigger, triggerIndex) => (
                      <div
                        key={`${trigger.event}-${trigger.action}-${trigger.debounceMs}`}
                        className="grid grid-cols-[170px_minmax(260px,1fr)_140px_120px_56px] items-start gap-3 border-b px-3 py-3 last:border-b-0"
                      >
                        <Controller
                          control={form.control}
                          name={`fields.${index}.triggers.${triggerIndex}.event`}
                          render={({ field: controlField }) => (
                            <Select
                              value={controlField.value}
                              onValueChange={controlField.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTriggerEventOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <Input
                          placeholder="/api/v1/builder-triggers/product-slug"
                          {...form.register(`fields.${index}.triggers.${triggerIndex}.action`)}
                        />
                        <Input
                          type="number"
                          min={0}
                          max={5000}
                          {...form.register(`fields.${index}.triggers.${triggerIndex}.debounceMs`, {
                            valueAsNumber: true,
                          })}
                        />
                        <Field orientation="horizontal" className="h-10">
                          <Controller
                            control={form.control}
                            name={`fields.${index}.triggers.${triggerIndex}.enabled`}
                            render={({ field: controlField }) => (
                              <Switch
                                size="sm"
                                checked={controlField.value}
                                onCheckedChange={controlField.onChange}
                              />
                            )}
                          />
                          <FieldContent>
                            <FieldLabel>On</FieldLabel>
                          </FieldContent>
                        </Field>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Field trigger устгах"
                          onClick={() =>
                            form.setValue(
                              `fields.${index}.triggers`,
                              fieldTriggers.filter((_, itemIndex) => itemIndex !== triggerIndex),
                              { shouldDirty: true },
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="font-medium">Triggers</h2>
            <p className="text-muted-foreground text-sm">Form create/update үед дуудах route.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => triggerArray.append(triggerDefaults)}
          >
            <Plus />
            Trigger нэмэх
          </Button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[190px_minmax(320px,1fr)_120px_120px_56px] gap-3 border-b bg-muted/30 px-4 py-2 font-medium text-muted-foreground text-xs uppercase">
              <span>Event</span>
              <span>Route</span>
              <span>Enabled</span>
              <span>Blocking</span>
              <span />
            </div>
            {triggerArray.fields.length === 0 ? (
              <div className="px-4 py-6 text-muted-foreground text-sm">Trigger алга.</div>
            ) : null}
            {triggerArray.fields.map((trigger, index) => (
              <div
                key={trigger.id}
                className="grid grid-cols-[190px_minmax(320px,1fr)_120px_120px_56px] items-start gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <Controller
                  control={form.control}
                  name={`triggers.${index}.event`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formTriggerEventOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input placeholder="/api/v1/..." {...form.register(`triggers.${index}.route`)} />
                <Field orientation="horizontal" className="h-10">
                  <Controller
                    control={form.control}
                    name={`triggers.${index}.enabled`}
                    render={({ field }) => (
                      <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <FieldContent>
                    <FieldLabel>On</FieldLabel>
                  </FieldContent>
                </Field>
                <Field orientation="horizontal" className="h-10">
                  <Controller
                    control={form.control}
                    name={`triggers.${index}.blocking`}
                    render={({ field }) => (
                      <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <FieldContent>
                    <FieldLabel>Block</FieldLabel>
                  </FieldContent>
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Trigger устгах"
                  onClick={() => triggerArray.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const BuilderFormEditorPage = createBuilderFormEditorPageComponent<
  builderContract.BuilderForm,
  builderContract.UpdateBuilderFormInput,
  builderContract.BuilderFieldType,
  builderContract.BuilderFormTriggerEvent
>({
  emptyValues,
  emptyField,
  emptyTrigger,
  resolver: zodResolver(valuesSchema) as Resolver<Values>,
  labels: {
    created: "Form үүслээ",
    saved: "Form хадгалагдлаа",
  },
  states: {
    loading: "Form ачааллаж байна...",
    error: "Form уншихад алдаа гарлаа.",
  },
  hooks: {
    useEntity: useBuilderForm,
    useTables: useBuilderDbTables,
    useSave: useSaveBuilderForm,
  },
  buildInput,
  navigateAfterCreate: (form) => {
    window.location.replace(`/winu/builder/forms/edit?id=${form.id}`);
  },
  notifications: {
    success: toast.success,
    error: notifyError,
  },
  Body: FormEditorBody,
});
