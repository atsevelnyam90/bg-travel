// src/admin/BuilderEditorPage.tsx
import { useEffect } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch
} from "react-hook-form";

// src/admin/editorState.ts
var BUILDER_EDITOR_NONE_VALUE = "__none";
function builderEditorOptionsToText(options) {
  return (options ?? []).map((option) => `${option.label}:${option.value}`).join("\n");
}
function builderEditorTextToOptions(value) {
  const rows = (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  if (rows.length === 0) return void 0;
  return rows.map((line) => {
    const [label, ...rest] = line.split(":");
    return { label: label.trim(), value: rest.join(":").trim() || label.trim() };
  });
}
function builderEditorSearchFieldsToText(fields) {
  return (fields ?? []).join("\n");
}
function builderEditorTextToSearchFields(value) {
  const fields = (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
  return fields.length > 0 ? fields : void 0;
}
function getBuilderEditorTriggerRoute(config) {
  const route = config.route ?? config.path ?? config.url;
  return typeof route === "string" ? route : "";
}
function valuesFromTriggers(triggers) {
  return triggers.filter((trigger) => trigger.action === "callApi" || trigger.action === "webhook").map((trigger) => ({
    event: trigger.event,
    route: getBuilderEditorTriggerRoute(trigger.config),
    enabled: trigger.enabled,
    blocking: trigger.blocking
  })).filter((trigger) => trigger.route);
}
function valuesFromFieldTriggers(triggers) {
  return (triggers ?? []).map((trigger) => ({
    event: trigger.event,
    action: trigger.action,
    enabled: trigger.enabled,
    debounceMs: trigger.debounceMs
  }));
}
function clampLayoutSpan(span, columns) {
  if (!span || Number.isNaN(span)) return columns;
  return Math.max(1, Math.min(columns, Math.trunc(span)));
}
function builderFormEditorDefaultSpan(field) {
  if (field.type === "textarea" || field.type === "checkbox") return 12;
  return 6;
}
function builderFormEditorDefaultLayoutGroups(fields) {
  return [
    {
      id: "main",
      title: "\u04AE\u043D\u0434\u0441\u044D\u043D",
      columns: 12,
      fields: fields.map((field) => ({
        key: field.key,
        span: builderFormEditorDefaultSpan(field)
      }))
    }
  ];
}
function normalizeBuilderFormEditorLayoutGroups(groups, fields) {
  if (fields.length === 0) return [];
  const fieldKeys = new Set(fields.map((field) => field.key));
  const usedKeys = /* @__PURE__ */ new Set();
  const normalized = (groups ?? []).map((group, index) => {
    const columns = group.columns === 6 || group.columns === 8 ? group.columns : 12;
    const groupFields = (group.fields ?? []).filter((field) => fieldKeys.has(field.key) && !usedKeys.has(field.key)).map((field) => {
      usedKeys.add(field.key);
      return { key: field.key, span: clampLayoutSpan(field.span, columns) };
    });
    return {
      id: group.id || `group${index + 1}`,
      title: group.title || `Group ${index + 1}`,
      columns,
      fields: groupFields
    };
  }).filter((group) => group.fields.length > 0 || group.title.trim());
  const missingFields = fields.filter((field) => !usedKeys.has(field.key)).map((field) => ({
    key: field.key,
    span: builderFormEditorDefaultSpan(field)
  }));
  if (normalized.length === 0) {
    return builderFormEditorDefaultLayoutGroups(fields);
  }
  if (missingFields.length > 0) {
    normalized.push({
      id: "ungrouped",
      title: "\u0411\u0443\u0441\u0430\u0434",
      columns: 12,
      fields: missingFields
    });
  }
  return normalized;
}
function builderFormEditorValuesFromEntity(form, emptyValues) {
  if (!form) return emptyValues;
  const source = form.source;
  const fields = form.schema.fields.map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    hidden: field.hidden ?? false,
    disabled: field.disabled ?? false,
    placeholder: field.placeholder ?? "",
    optionsText: builderEditorOptionsToText(field.options),
    optionsMode: field.optionsSource?.type === "dbTable" ? "table" : "static",
    optionsTable: field.optionsSource?.type === "dbTable" ? field.optionsSource.tableName : BUILDER_EDITOR_NONE_VALUE,
    optionsValueField: field.optionsSource?.type === "dbTable" ? field.optionsSource.valueField : BUILDER_EDITOR_NONE_VALUE,
    optionsLabelField: field.optionsSource?.type === "dbTable" ? field.optionsSource.labelField : BUILDER_EDITOR_NONE_VALUE,
    optionsSearchFieldsText: field.optionsSource?.type === "dbTable" ? builderEditorSearchFieldsToText(field.optionsSource.searchFields) : "",
    optionsDependsOn: field.optionsSource?.type === "dbTable" ? field.optionsSource.filterBy?.valueFromField ?? "" : "",
    optionsFilterField: field.optionsSource?.type === "dbTable" ? field.optionsSource.filterBy?.field ?? "" : "",
    triggers: valuesFromFieldTriggers(field.triggers)
  }));
  return {
    title: form.title,
    description: form.description ?? "",
    sourceType: source?.type ?? "none",
    sourceTable: source?.type === "dbTable" ? source.tableName : BUILDER_EDITOR_NONE_VALUE,
    apiBasePath: source?.type === "apiEndpoint" ? source.basePath : "",
    fields,
    layoutGroups: normalizeBuilderFormEditorLayoutGroups(form.schema.layout?.groups, fields),
    triggers: valuesFromTriggers(form.triggers),
    version: form.version
  };
}
function builderListEditorValuesFromEntity(list, emptyValues) {
  if (!list) return emptyValues;
  const source = list.source;
  return {
    title: list.title,
    description: list.description ?? "",
    sourceType: source?.type ?? "none",
    sourceTable: source?.type === "dbTable" ? source.tableName : BUILDER_EDITOR_NONE_VALUE,
    apiBasePath: source?.type === "apiEndpoint" ? source.basePath : "",
    columns: list.schema.columns.map((column) => ({
      key: column.key,
      label: column.label,
      sortable: column.sortable,
      align: column.align
    })),
    triggers: valuesFromTriggers(list.triggers),
    version: list.version
  };
}
function builderViewEditorValuesFromEntity(view, emptyValues, defaultPermission) {
  if (!view) return emptyValues;
  return {
    title: view.title,
    description: view.description ?? "",
    formId: view.formId ?? BUILDER_EDITOR_NONE_VALUE,
    listId: view.listId ?? BUILDER_EDITOR_NONE_VALUE,
    permissionRead: view.permissionRead ?? defaultPermission,
    permissionWrite: view.permissionWrite ?? defaultPermission,
    triggersText: JSON.stringify(view.triggers ?? [], null, 2),
    version: view.version
  };
}
function builderFormEditorFieldsFromTable(table) {
  return table.columns.map((column) => ({
    key: column.name,
    label: column.label,
    type: column.fieldType,
    required: !column.nullable,
    hidden: false,
    disabled: false,
    placeholder: column.label,
    optionsText: "",
    optionsMode: "static",
    optionsTable: BUILDER_EDITOR_NONE_VALUE,
    optionsValueField: BUILDER_EDITOR_NONE_VALUE,
    optionsLabelField: BUILDER_EDITOR_NONE_VALUE,
    optionsSearchFieldsText: "",
    optionsDependsOn: "",
    optionsFilterField: "",
    triggers: []
  }));
}
function builderListEditorColumnsFromTable(table) {
  return table.columns.map((column) => ({
    key: column.name,
    label: column.label,
    sortable: column.sortable,
    align: column.fieldType === "number" || column.fieldType === "money" ? "right" : "left"
  }));
}
function builderFormEditorInputFromValues(values) {
  const source = values.sourceType === "dbTable" && values.sourceTable !== BUILDER_EDITOR_NONE_VALUE ? { type: "dbTable", tableName: values.sourceTable } : values.sourceType === "apiEndpoint" && values.apiBasePath ? { type: "apiEndpoint", basePath: values.apiBasePath } : null;
  return {
    title: values.title,
    description: values.description || null,
    source,
    schema: {
      fields: values.fields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        hidden: field.hidden,
        disabled: field.disabled,
        placeholder: field.placeholder?.trim() || field.label,
        options: field.type === "select" && field.optionsMode === "static" ? builderEditorTextToOptions(field.optionsText) : void 0,
        optionsSource: field.type === "select" && field.optionsMode === "table" && field.optionsTable !== BUILDER_EDITOR_NONE_VALUE && field.optionsValueField !== BUILDER_EDITOR_NONE_VALUE && field.optionsLabelField !== BUILDER_EDITOR_NONE_VALUE ? {
          type: "dbTable",
          tableName: field.optionsTable,
          valueField: field.optionsValueField,
          labelField: field.optionsLabelField,
          searchFields: builderEditorTextToSearchFields(field.optionsSearchFieldsText),
          filterBy: field.optionsDependsOn && field.optionsFilterField ? {
            field: field.optionsFilterField,
            valueFromField: field.optionsDependsOn
          } : void 0
        } : void 0,
        triggers: field.triggers.map((trigger) => ({
          event: trigger.event,
          action: trigger.action,
          enabled: trigger.enabled,
          debounceMs: trigger.debounceMs,
          config: {}
        }))
      })),
      layout: {
        groups: normalizeBuilderFormEditorLayoutGroups(values.layoutGroups, values.fields)
      }
    },
    triggers: values.triggers.map((trigger) => ({
      event: trigger.event,
      action: "callApi",
      enabled: trigger.enabled,
      blocking: trigger.blocking,
      config: { route: trigger.route }
    })),
    version: values.version
  };
}
function builderListEditorInputFromValues(values) {
  const source = values.sourceType === "dbTable" && values.sourceTable !== BUILDER_EDITOR_NONE_VALUE ? { type: "dbTable", tableName: values.sourceTable } : values.sourceType === "apiEndpoint" && values.apiBasePath ? { type: "apiEndpoint", basePath: values.apiBasePath } : null;
  return {
    title: values.title,
    description: values.description || null,
    source,
    schema: { columns: values.columns },
    triggers: values.triggers.map((trigger) => ({
      event: trigger.event,
      action: "callApi",
      enabled: trigger.enabled,
      blocking: trigger.blocking,
      config: { route: trigger.route }
    })),
    version: values.version
  };
}
function builderViewEditorInputFromValues(values, parseTriggers) {
  return {
    title: values.title,
    description: values.description || null,
    formId: values.formId === BUILDER_EDITOR_NONE_VALUE ? null : values.formId,
    listId: values.listId === BUILDER_EDITOR_NONE_VALUE ? null : values.listId,
    permissionRead: values.permissionRead,
    permissionWrite: values.permissionWrite,
    triggers: values.triggersText?.trim() ? parseTriggers(values.triggersText) : [],
    version: values.version
  };
}

// src/admin/BuilderEditorPage.tsx
import { jsx } from "react/jsx-runtime";
function createBuilderFormEditorPageComponent(deps) {
  return function BuilderFormEditorPage({ formId }) {
    const entityQuery = deps.hooks.useEntity(formId);
    const tables = deps.hooks.useTables();
    const save = deps.hooks.useSave();
    const form = useForm({
      resolver: deps.resolver,
      defaultValues: deps.emptyValues
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
        shouldDirty: true
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
      return /* @__PURE__ */ jsx("div", { className: "text-muted-foreground text-sm", children: deps.states.loading });
    }
    if (formId && entityQuery.isError) {
      return /* @__PURE__ */ jsx("div", { className: "text-destructive text-sm", children: deps.states.error });
    }
    return /* @__PURE__ */ jsx(FormProvider, { ...form, children: /* @__PURE__ */ jsx("form", { onSubmit, noValidate: true, className: "space-y-6", children: deps.Body({
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
      importFieldsFromTable
    }) }) });
  };
}
function createBuilderListEditorPageComponent(deps) {
  return function BuilderListEditorPage({ listId }) {
    const entityQuery = deps.hooks.useEntity(listId);
    const tables = deps.hooks.useTables();
    const save = deps.hooks.useSave();
    const form = useForm({
      resolver: deps.resolver,
      defaultValues: deps.emptyValues
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
      return /* @__PURE__ */ jsx("div", { className: "text-muted-foreground text-sm", children: deps.states.loading });
    }
    if (listId && entityQuery.isError) {
      return /* @__PURE__ */ jsx("div", { className: "text-destructive text-sm", children: deps.states.error });
    }
    return /* @__PURE__ */ jsx(FormProvider, { ...form, children: /* @__PURE__ */ jsx("form", { onSubmit, noValidate: true, className: "space-y-6", children: deps.Body({
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
      importColumnsFromTable
    }) }) });
  };
}

// src/admin/BuilderEntityManager.tsx
import { useCallback, useMemo, useState } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function createBuilderEntityManagerComponent(deps) {
  return function BuilderEntityManager() {
    const [pendingDelete, setPendingDelete] = useState(null);
    const state = deps.useDataTableState({ pageSize: 20 });
    const query = deps.hooks.useEntities(state.query);
    const remove = deps.hooks.useDelete();
    const replicate = deps.hooks.useReplicate();
    const columns = useMemo(
      () => deps.buildColumns({
        onEdit: deps.navigateToEdit,
        onReplicate: async (entity) => {
          const title = await deps.requestReplicateTitle(entity);
          if (!title) return;
          await replicate.mutateAsync({ id: entity.id, input: { title } });
        },
        onDelete: setPendingDelete,
        runtimeHref: deps.runtimeHref
      }),
      [replicate]
    );
    const controller = deps.useDataTable({
      columns,
      data: query.data?.items ?? [],
      rowCount: query.data?.total ?? 0,
      state,
      getRowId: (row) => row.id
    });
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx2(
        deps.DataGrid,
        {
          title: deps.labels.title,
          description: deps.labels.description,
          controller,
          isLoading: query.isPending,
          searchPlaceholder: deps.labels.searchPlaceholder,
          emptyTitle: deps.labels.emptyTitle,
          emptyDescription: deps.labels.emptyDescription,
          onRowClick: deps.navigateToEdit,
          toolbarExtra: /* @__PURE__ */ jsx2(deps.AddButton, { href: deps.createHref, label: deps.labels.addLabel })
        }
      ),
      /* @__PURE__ */ jsx2(
        deps.DeleteDialog,
        {
          entity: pendingDelete,
          title: deps.labels.deleteTitle,
          description: deps.labels.deleteDescription(pendingDelete),
          isDeleting: remove.isPending,
          onClose: () => setPendingDelete(null),
          onConfirm: async () => {
            if (!pendingDelete) return;
            await remove.mutateAsync(pendingDelete.id);
            setPendingDelete(null);
          }
        }
      )
    ] });
  };
}
function createBuilderEntityDialogManagerComponent(deps) {
  return function BuilderEntityDialogManager() {
    const [editing, setEditing] = useState(null);
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const state = deps.useDataTableState({ pageSize: 20 });
    const query = deps.hooks.useEntities(state.query);
    const remove = deps.hooks.useDelete();
    const replicate = deps.hooks.useReplicate();
    const openEditor = useCallback((entity) => {
      setEditing(entity);
      setEditorOpen(true);
    }, []);
    const columns = useMemo(
      () => deps.buildColumns({
        onEdit: (entity) => openEditor(entity),
        onReplicate: async (entity) => {
          const title = await deps.requestReplicateTitle(entity);
          if (!title) return;
          await replicate.mutateAsync({ id: entity.id, input: { title } });
        },
        onDelete: setPendingDelete,
        runtimeHref: deps.runtimeHref
      }),
      [replicate, openEditor]
    );
    const controller = deps.useDataTable({
      columns,
      data: query.data?.items ?? [],
      rowCount: query.data?.total ?? 0,
      state,
      getRowId: (row) => row.id
    });
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx2(
        deps.DataGrid,
        {
          title: deps.labels.title,
          description: deps.labels.description,
          controller,
          isLoading: query.isPending,
          searchPlaceholder: deps.labels.searchPlaceholder,
          emptyTitle: deps.labels.emptyTitle,
          emptyDescription: deps.labels.emptyDescription,
          onRowClick: openEditor,
          toolbarExtra: /* @__PURE__ */ jsx2(deps.AddButton, { label: deps.labels.addLabel, onAdd: () => openEditor(null) })
        }
      ),
      /* @__PURE__ */ jsx2(
        deps.EditorDialog,
        {
          open: isEditorOpen,
          editing,
          onClose: () => setEditorOpen(false)
        }
      ),
      /* @__PURE__ */ jsx2(
        deps.DeleteDialog,
        {
          entity: pendingDelete,
          title: deps.labels.deleteTitle,
          description: deps.labels.deleteDescription(pendingDelete),
          isDeleting: remove.isPending,
          onClose: () => setPendingDelete(null),
          onConfirm: async () => {
            if (!pendingDelete) return;
            await remove.mutateAsync(pendingDelete.id);
            setPendingDelete(null);
          }
        }
      )
    ] });
  };
}

// src/admin/BuilderViewDialog.tsx
import { useEffect as useEffect2 } from "react";
import { FormProvider as FormProvider2, useForm as useForm2 } from "react-hook-form";
import { jsx as jsx3 } from "react/jsx-runtime";
function createBuilderViewDialogComponent(deps) {
  return function BuilderViewDialog({
    open,
    editing,
    forms,
    lists,
    onClose,
    onSave,
    isSaving
  }) {
    const form = useForm2({
      resolver: deps.resolver,
      defaultValues: deps.emptyValues
    });
    useEffect2(() => {
      if (!open) return;
      form.reset(
        builderViewEditorValuesFromEntity(editing, deps.emptyValues, deps.defaultPermission)
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
    return /* @__PURE__ */ jsx3(deps.Shell, { open, editing, onClose, children: /* @__PURE__ */ jsx3(FormProvider2, { ...form, children: /* @__PURE__ */ jsx3("form", { onSubmit, noValidate: true, children: deps.Body({
      form,
      editing,
      forms,
      lists,
      permissionOptions: deps.permissionOptions,
      noneValue: deps.noneValue,
      isSaving,
      onClose
    }) }) }) });
  };
}
export {
  BUILDER_EDITOR_NONE_VALUE,
  builderEditorOptionsToText,
  builderEditorSearchFieldsToText,
  builderEditorTextToOptions,
  builderEditorTextToSearchFields,
  builderFormEditorDefaultLayoutGroups,
  builderFormEditorDefaultSpan,
  builderFormEditorFieldsFromTable,
  builderFormEditorInputFromValues,
  builderFormEditorValuesFromEntity,
  builderListEditorColumnsFromTable,
  builderListEditorInputFromValues,
  builderListEditorValuesFromEntity,
  builderViewEditorInputFromValues,
  builderViewEditorValuesFromEntity,
  createBuilderEntityDialogManagerComponent,
  createBuilderEntityManagerComponent,
  createBuilderFormEditorPageComponent,
  createBuilderListEditorPageComponent,
  createBuilderViewDialogComponent,
  getBuilderEditorTriggerRoute
};
//# sourceMappingURL=index.js.map