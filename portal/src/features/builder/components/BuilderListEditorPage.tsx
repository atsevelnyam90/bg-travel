"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUILDER_EDITOR_NONE_VALUE,
  type BuilderListEditorBodyProps,
  type BuilderListEditorValues,
  builderListEditorInputFromValues,
  createBuilderListEditorPageComponent,
} from "@winu/builder-ui/admin";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { Controller, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { builder as builderContract } from "@/api/generated/contracts";
import { SelectField, TextareaField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
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
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { useBuilderDbTables, useBuilderList, useSaveBuilderList } from "../hooks/useBuilder";

type Values = BuilderListEditorValues<builderContract.BuilderListTriggerEvent>;

const alignOptions: Array<{ value: builderContract.BuilderColumn["align"]; label: string }> = [
  { value: "left", label: "Зүүн" },
  { value: "right", label: "Баруун" },
];
const listTriggerEventOptions: Array<{
  value: builderContract.BuilderListTriggerEvent;
  label: string;
}> = [
  { value: "beforeRead", label: "Before read" },
  { value: "afterRead", label: "After read" },
  { value: "beforeDelete", label: "Before delete" },
  { value: "afterDelete", label: "After delete" },
];
const NONE = BUILDER_EDITOR_NONE_VALUE;

const triggerValueSchema = z.object({
  event: builderContract.builderListTriggerEventSchema,
  route: z.string().min(1),
  enabled: z.boolean(),
  blocking: z.boolean(),
});

const valuesSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sourceType: z.enum(["none", "dbTable", "apiEndpoint"]),
  sourceTable: z.string(),
  apiBasePath: z.string().optional(),
  columns: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      sortable: z.boolean(),
      align: z.enum(["left", "right"]),
    }),
  ),
  triggers: z.array(triggerValueSchema),
  version: z.number().int(),
});

const emptyColumn: Values["columns"][number] = {
  key: "name",
  label: "Нэр",
  sortable: true,
  align: "left",
};

const emptyValues: Values = {
  title: "",
  description: "",
  sourceType: "none",
  sourceTable: NONE,
  apiBasePath: "",
  columns: [emptyColumn],
  triggers: [],
  version: 0,
};

const emptyTrigger: Values["triggers"][number] = {
  event: "beforeRead",
  route: "/api/v1/",
  enabled: false,
  blocking: true,
};

function buildInput(values: Values): builderContract.UpdateBuilderListInput {
  return builderContract.updateBuilderListSchema.parse(builderListEditorInputFromValues(values));
}

function notifyError(error: unknown) {
  toast.error(apiErrorMessage(error));
}

function ListEditorBody({
  listId,
  form,
  columnArray,
  triggerArray,
  sourceType,
  sourceTable,
  tables,
  emptyColumn: columnDefaults,
  emptyTrigger: triggerDefaults,
  isSaving,
  importColumnsFromTable,
}: BuilderListEditorBodyProps<builderContract.BuilderListTriggerEvent>) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/winu/builder/lists" aria-label="Lists руу буцах">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-semibold text-2xl tracking-tight">
              {listId ? "Dynamic List засах" : "Dynamic List нэмэх"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Дан list/grid column schema. View дээр form-той холбогдоно.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild type="button" variant="outline">
            <Link href="/winu/builder/lists">Болих</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save />
            {isSaving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </div>

      <FieldGroup>
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,0.8fr)_minmax(320px,1.2fr)]">
          <TextField<Values> name="title" label="Гарчиг" placeholder="Бараа list" />
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
                onClick={importColumnsFromTable}
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
            <h2 className="font-medium">Columns</h2>
            <p className="text-muted-foreground text-sm">Grid/table дээр харагдах баганууд.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              columnArray.append({
                ...columnDefaults,
                key: `field${columnArray.fields.length + 1}`,
                label: `Багана ${columnArray.fields.length + 1}`,
                sortable: false,
              })
            }
          >
            <Plus />
            Column нэмэх
          </Button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[220px_260px_170px_130px_56px] gap-3 border-b bg-muted/30 px-4 py-2 font-medium text-muted-foreground text-xs uppercase">
              <span>Key</span>
              <span>Label</span>
              <span>Align</span>
              <span>Sortable</span>
              <span />
            </div>
            {columnArray.fields.map((column, index) => (
              <div
                key={column.id}
                className="grid grid-cols-[220px_260px_170px_130px_56px] items-start gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <Input {...form.register(`columns.${index}.key`)} />
                <Input {...form.register(`columns.${index}.label`)} />
                <Controller
                  control={form.control}
                  name={`columns.${index}.align`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {alignOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Field orientation="horizontal" className="h-10">
                  <Controller
                    control={form.control}
                    name={`columns.${index}.sortable`}
                    render={({ field }) => (
                      <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <FieldContent>
                    <FieldLabel>Sort</FieldLabel>
                  </FieldContent>
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Column устгах"
                  onClick={() => columnArray.remove(index)}
                  disabled={columnArray.fields.length === 1}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="font-medium">Triggers</h2>
            <p className="text-muted-foreground text-sm">List read/delete үед дуудах route.</p>
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
                        {listTriggerEventOptions.map((option) => (
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

export const BuilderListEditorPage = createBuilderListEditorPageComponent<
  builderContract.BuilderList,
  builderContract.UpdateBuilderListInput,
  builderContract.BuilderListTriggerEvent
>({
  emptyValues,
  emptyColumn,
  emptyTrigger,
  resolver: zodResolver(valuesSchema) as Resolver<Values>,
  labels: {
    created: "List үүслээ",
    saved: "List хадгалагдлаа",
  },
  states: {
    loading: "List ачааллаж байна...",
    error: "List уншихад алдаа гарлаа.",
  },
  hooks: {
    useEntity: useBuilderList,
    useTables: useBuilderDbTables,
    useSave: useSaveBuilderList,
  },
  buildInput,
  navigateAfterCreate: (list) => {
    window.location.replace(`/winu/builder/lists/edit?id=${list.id}`);
  },
  notifications: {
    success: toast.success,
    error: notifyError,
  },
  Body: ListEditorBody,
});
