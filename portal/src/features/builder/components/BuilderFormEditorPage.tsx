"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUILDER_EDITOR_NONE_VALUE,
  type BuilderFormEditorBodyProps,
  type BuilderFormEditorLayoutGroupValues,
  type BuilderFormEditorValues,
  builderFormEditorDefaultLayoutGroups,
  builderFormEditorDefaultSpan,
  builderFormEditorInputFromValues,
  createBuilderFormEditorPageComponent,
} from "@winu/builder-ui/admin";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { DragEvent } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  layoutGroups: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      columns: z.union([z.literal(6), z.literal(8), z.literal(12)]),
      fields: z.array(
        z.object({
          key: z.string().min(1),
          span: z.number().int().min(1).max(12),
        }),
      ),
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
  layoutGroups: builderFormEditorDefaultLayoutGroups([emptyField]),
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

function swapItems<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const item = next[from];
  next[from] = next[to];
  next[to] = item;
  return next;
}

function clampSpan(span: number, columns: 6 | 8 | 12) {
  return Math.max(1, Math.min(columns, span));
}

function nextGroupId(groups: BuilderFormEditorLayoutGroupValues[]) {
  let index = groups.length + 1;
  let id = `group${index}`;
  const ids = new Set(groups.map((group) => group.id));
  while (ids.has(id)) {
    index += 1;
    id = `group${index}`;
  }
  return id;
}

const layoutDragPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("palette"), key: z.string().min(1) }),
  z.object({
    type: z.literal("layout"),
    groupIndex: z.number().int().min(0),
    fieldIndex: z.number().int().min(0),
    key: z.string().min(1),
  }),
]);
type LayoutDragPayload = z.infer<typeof layoutDragPayloadSchema>;
const layoutDragDataType = "application/x-winu-builder-layout-field";
const editorLayoutColumnClasses: Record<6 | 8 | 12, string> = {
  6: "md:grid-cols-6",
  8: "md:grid-cols-8",
  12: "md:grid-cols-12",
};
const editorLayoutSpanClasses: Record<number, string> = {
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

function setLayoutDragPayload(event: DragEvent<HTMLElement>, payload: LayoutDragPayload) {
  event.dataTransfer.setData(layoutDragDataType, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "move";
}

function getLayoutDragPayload(event: DragEvent<HTMLElement>) {
  const raw = event.dataTransfer.getData(layoutDragDataType);
  if (!raw) return null;
  try {
    return layoutDragPayloadSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function FormLayoutEditor({
  form,
  fields,
}: {
  form: BuilderFormEditorBodyProps<
    builderContract.BuilderFieldType,
    builderContract.BuilderFormTriggerEvent
  >["form"];
  fields: Values["fields"];
}) {
  const layoutGroups = form.watch("layoutGroups") ?? [];
  const fieldLabels = new Map(fields.map((field) => [field.key, field.label]));
  const assignedKeys = new Set(
    layoutGroups.flatMap((group) => group.fields.map((field) => field.key)),
  );
  const unassignedFields = fields.filter((field) => !assignedKeys.has(field.key));

  const setGroups = (groups: BuilderFormEditorLayoutGroupValues[]) => {
    form.setValue("layoutGroups", groups, { shouldDirty: true, shouldValidate: true });
  };

  const updateGroup = (groupIndex: number, group: BuilderFormEditorLayoutGroupValues) => {
    setGroups(layoutGroups.map((item, index) => (index === groupIndex ? group : item)));
  };

  const updateGroupFields = (
    groupIndex: number,
    updater: (
      fields: BuilderFormEditorLayoutGroupValues["fields"],
    ) => BuilderFormEditorLayoutGroupValues["fields"],
  ) => {
    const group = layoutGroups[groupIndex];
    if (!group) return;
    updateGroup(groupIndex, { ...group, fields: updater(group.fields) });
  };

  const addGroup = () => {
    setGroups([
      ...layoutGroups,
      {
        id: nextGroupId(layoutGroups),
        title: `Group ${layoutGroups.length + 1}`,
        columns: 12,
        fields: [],
      },
    ]);
  };

  const addFieldToNewGroup = (fieldKey: string) => {
    if (assignedKeys.has(fieldKey)) return;
    const field = fields.find((item) => item.key === fieldKey);
    if (!field) return;
    setGroups([
      ...layoutGroups,
      {
        id: nextGroupId(layoutGroups),
        title: layoutGroups.length === 0 ? "Үндсэн" : `Group ${layoutGroups.length + 1}`,
        columns: 12,
        fields: [{ key: fieldKey, span: builderFormEditorDefaultSpan(field) }],
      },
    ]);
  };

  const addFieldToGroup = (groupIndex: number, fieldKey: string, insertAt?: number) => {
    if (assignedKeys.has(fieldKey)) return;
    const field = fields.find((item) => item.key === fieldKey);
    const group = layoutGroups[groupIndex];
    if (!field || !group) return;
    const nextField = {
      key: fieldKey,
      span: clampSpan(builderFormEditorDefaultSpan(field), group.columns),
    };
    updateGroupFields(groupIndex, (groupFields) => {
      const next = [...groupFields];
      next.splice(insertAt ?? next.length, 0, nextField);
      return next;
    });
  };

  const dropFieldToGroup = (
    event: DragEvent<HTMLElement>,
    targetGroupIndex: number,
    targetFieldIndex?: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = getLayoutDragPayload(event);
    if (!payload) return;

    if (payload.type === "palette") {
      addFieldToGroup(targetGroupIndex, payload.key, targetFieldIndex);
      return;
    }

    const sourceGroup = layoutGroups[payload.groupIndex];
    const targetGroup = layoutGroups[targetGroupIndex];
    if (!sourceGroup || !targetGroup) return;

    const movingField = sourceGroup.fields[payload.fieldIndex];
    if (!movingField) return;

    const nextGroups = layoutGroups.map((group) => ({ ...group, fields: [...group.fields] }));
    nextGroups[payload.groupIndex].fields.splice(payload.fieldIndex, 1);

    let insertAt = targetFieldIndex ?? nextGroups[targetGroupIndex].fields.length;
    if (payload.groupIndex === targetGroupIndex && payload.fieldIndex < insertAt) {
      insertAt -= 1;
    }

    nextGroups[targetGroupIndex].fields.splice(insertAt, 0, {
      ...movingField,
      span: clampSpan(movingField.span, targetGroup.columns),
    });
    setGroups(nextGroups);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3">
          <div>
            <h2 className="font-medium">Form харагдац</h2>
            <p className="text-muted-foreground text-sm">
              Desktop preview дээр field-ээ байрлуулна. Mobile дээр бүгд full width болно.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGroups(builderFormEditorDefaultLayoutGroups(fields))}
            >
              Default layout
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addGroup()}>
              <Plus />
              Group нэмэх
            </Button>
          </div>
        </div>

        {layoutGroups.length === 0 ? (
          <section className="rounded-lg border border-dashed bg-background px-4 py-10 text-center text-muted-foreground text-sm">
            Layout group алга. Group нэмэх эсвэл баруун талын field дээр дарж эхэлнэ.
          </section>
        ) : null}

        {layoutGroups.map((group, groupIndex) => {
          const spanOptions = Array.from({ length: group.columns }, (_, index) => index + 1);

          return (
            <div key={group.id} className="rounded-lg border bg-background">
              <div className="grid gap-3 border-b bg-muted/20 px-4 py-3 xl:grid-cols-[minmax(220px,1fr)_160px_auto]">
                <Input
                  value={group.title}
                  onChange={(event) =>
                    updateGroup(groupIndex, { ...group, title: event.target.value })
                  }
                  aria-label="Group title"
                />
                <Select
                  value={String(group.columns)}
                  onValueChange={(value) => {
                    const columns = Number(value) as 6 | 8 | 12;
                    updateGroup(groupIndex, {
                      ...group,
                      columns,
                      fields: group.fields.map((field) => ({
                        ...field,
                        span: clampSpan(field.span, columns),
                      })),
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 columns</SelectItem>
                    <SelectItem value="8">8 columns</SelectItem>
                    <SelectItem value="12">12 columns</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Group устгах"
                  onClick={() => setGroups(layoutGroups.filter((_, index) => index !== groupIndex))}
                >
                  <Trash2 />
                </Button>
              </div>
              <ul
                className={`grid min-h-36 grid-cols-1 gap-3 p-4 ${editorLayoutColumnClasses[group.columns]}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropFieldToGroup(event, groupIndex)}
              >
                {group.fields.length === 0 ? (
                  <div className="rounded-md border border-dashed px-4 py-8 text-center text-muted-foreground text-sm md:col-span-12">
                    Баруун талаас field чирээд энд тавина.
                  </div>
                ) : null}
                {group.fields.map((layoutField, fieldIndex) => {
                  const field = fields.find((item) => item.key === layoutField.key);
                  const span = clampSpan(layoutField.span, group.columns);

                  if (!field) return null;

                  return (
                    <li
                      key={`${group.id}-${layoutField.key}`}
                      draggable
                      onDragStart={(event) =>
                        setLayoutDragPayload(event, {
                          type: "layout",
                          groupIndex,
                          fieldIndex,
                          key: layoutField.key,
                        })
                      }
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => dropFieldToGroup(event, groupIndex, fieldIndex)}
                      className={`rounded-md border bg-background p-3 shadow-sm transition-colors hover:border-primary/60 ${editorLayoutSpanClasses[span] ?? "md:col-span-12"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <GripVertical className="size-4 text-muted-foreground" />
                            <span className="truncate">{field.label}</span>
                          </div>
                          <div className="mt-1 truncate text-muted-foreground text-xs">
                            {field.key} · span {span}/{group.columns}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Layout field устгах"
                          onClick={() =>
                            updateGroupFields(groupIndex, (groupFields) =>
                              groupFields.filter((_, index) => index !== fieldIndex),
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Select
                          value={String(span)}
                          onValueChange={(value) =>
                            updateGroupFields(groupIndex, (groupFields) =>
                              groupFields.map((item, index) =>
                                index === fieldIndex ? { ...item, span: Number(value) } : item,
                              ),
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {spanOptions.map((option) => (
                              <SelectItem key={option} value={String(option)}>
                                Span {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Дээш зөөх"
                          onClick={() =>
                            updateGroupFields(groupIndex, (groupFields) =>
                              swapItems(groupFields, fieldIndex, fieldIndex - 1),
                            )
                          }
                          disabled={fieldIndex === 0}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Доош зөөх"
                          onClick={() =>
                            updateGroupFields(groupIndex, (groupFields) =>
                              swapItems(groupFields, fieldIndex, fieldIndex + 1),
                            )
                          }
                          disabled={fieldIndex === group.fields.length - 1}
                        >
                          <ArrowDown />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <aside className="rounded-lg border bg-background lg:sticky lg:top-4 lg:self-start">
        <div className="border-b px-4 py-3">
          <h3 className="font-medium">Fields</h3>
          <p className="text-muted-foreground text-sm">Чирээд group preview дээр тавина.</p>
        </div>
        <div className="space-y-2 p-3">
          {unassignedFields.length === 0 ? (
            <div className="rounded-md border border-dashed px-3 py-4 text-muted-foreground text-sm">
              Бүх field layout-д орсон байна.
            </div>
          ) : null}
          {unassignedFields.map((field) => (
            <button
              key={field.key}
              type="button"
              draggable
              onClick={() =>
                layoutGroups.length === 0
                  ? addFieldToNewGroup(field.key)
                  : addFieldToGroup(0, field.key)
              }
              onDragStart={(event) =>
                setLayoutDragPayload(event, { type: "palette", key: field.key })
              }
              className="flex w-full cursor-grab items-center gap-2 rounded-md border bg-background px-3 py-2 text-left shadow-sm transition-colors hover:border-primary/60 active:cursor-grabbing"
            >
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-sm">
                  {fieldLabels.get(field.key) ?? field.key}
                </span>
                <span className="block truncate text-muted-foreground text-xs">{field.key}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
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

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Үндсэн</TabsTrigger>
          <TabsTrigger value="layout">Харагдац</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="space-y-6">
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
                    tables.find((table) => table.name === selectedOptionsTable)?.lookupColumns ??
                    [];
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
                            <Select
                              value={controlField.value}
                              onValueChange={controlField.onChange}
                            >
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
                              {...form.register(
                                `fields.${index}.triggers.${triggerIndex}.debounceMs`,
                                {
                                  valueAsNumber: true,
                                },
                              )}
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
                                  fieldTriggers.filter(
                                    (_, itemIndex) => itemIndex !== triggerIndex,
                                  ),
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
                <p className="text-muted-foreground text-sm">
                  Form create/update үед дуудах route.
                </p>
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
                    <Input
                      placeholder="/api/v1/..."
                      {...form.register(`triggers.${index}.route`)}
                    />
                    <Field orientation="horizontal" className="h-10">
                      <Controller
                        control={form.control}
                        name={`triggers.${index}.enabled`}
                        render={({ field }) => (
                          <Switch
                            size="sm"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Switch
                            size="sm"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
        </TabsContent>
        <TabsContent value="layout">
          <FormLayoutEditor form={form} fields={fields} />
        </TabsContent>
      </Tabs>
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
