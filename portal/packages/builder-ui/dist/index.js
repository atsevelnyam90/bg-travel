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

// src/api/createBuilderApiClient.ts
function queryParams(query) {
  return { ...query };
}
function fieldOptionsQueryParams(query) {
  const flatQuery = { search: query.search };
  for (const [key, value] of Object.entries(query.depends ?? {})) {
    flatQuery[`depends.${key}`] = value;
  }
  return flatQuery;
}
function createBuilderApiClient(transport) {
  return {
    listBuilderForms: (query) => transport.get("/builder/forms", {
      query: queryParams(query)
    }),
    listBuilderDbTables: () => transport.get("/builder/datasources/tables"),
    listBuilderFormOptions: () => transport.get("/builder/forms/options"),
    getBuilderForm: (id) => transport.get(`/builder/forms/${encodeURIComponent(id)}`),
    createBuilderForm: (input) => transport.post("/builder/forms", input),
    updateBuilderForm: (id, input) => transport.patch(`/builder/forms/${encodeURIComponent(id)}`, input),
    replicateBuilderForm: (id, input) => transport.post(`/builder/forms/${encodeURIComponent(id)}/replicate`, input),
    deleteBuilderForm: (id) => transport.delete(`/builder/forms/${encodeURIComponent(id)}`),
    listBuilderLists: (query) => transport.get("/builder/lists", {
      query: queryParams(query)
    }),
    listBuilderListOptions: () => transport.get("/builder/lists/options"),
    getBuilderList: (id) => transport.get(`/builder/lists/${encodeURIComponent(id)}`),
    createBuilderList: (input) => transport.post("/builder/lists", input),
    updateBuilderList: (id, input) => transport.patch(`/builder/lists/${encodeURIComponent(id)}`, input),
    replicateBuilderList: (id, input) => transport.post(`/builder/lists/${encodeURIComponent(id)}/replicate`, input),
    deleteBuilderList: (id) => transport.delete(`/builder/lists/${encodeURIComponent(id)}`),
    listBuilderViews: (query) => transport.get("/builder/views", {
      query: queryParams(query)
    }),
    getBuilderView: (id) => transport.get(`/builder/views/${encodeURIComponent(id)}`),
    createBuilderView: (input) => transport.post("/builder/views", input),
    updateBuilderView: (id, input) => transport.patch(`/builder/views/${encodeURIComponent(id)}`, input),
    replicateBuilderView: (id, input) => transport.post(`/builder/views/${encodeURIComponent(id)}/replicate`, input),
    deleteBuilderView: (id) => transport.delete(`/builder/views/${encodeURIComponent(id)}`),
    getRuntimeBuilderForm: (id) => transport.get(`/builder/runtime/forms/${encodeURIComponent(id)}`),
    createRuntimeBuilderFormEntry: (formId, input) => transport.post(
      `/builder/runtime/forms/${encodeURIComponent(formId)}/entries`,
      input
    ),
    listRuntimeBuilderFormFieldOptions: (formId, fieldKey, query) => transport.get(
      `/builder/runtime/forms/${encodeURIComponent(formId)}/fields/${encodeURIComponent(fieldKey)}/options`,
      { query: fieldOptionsQueryParams(query) }
    ),
    runRuntimeBuilderFormFieldTrigger: (formId, fieldKey, event, input) => transport.post(
      `/builder/runtime/forms/${encodeURIComponent(formId)}/fields/${encodeURIComponent(fieldKey)}/triggers/${encodeURIComponent(event)}`,
      input
    ),
    getRuntimeBuilderList: (id) => transport.get(`/builder/runtime/lists/${encodeURIComponent(id)}`),
    listRuntimeBuilderListEntries: (listId, query) => transport.get(
      `/builder/runtime/lists/${encodeURIComponent(listId)}/entries`,
      { query: queryParams(query) }
    ),
    getRuntimeBuilderView: (id) => transport.get(`/builder/runtime/views/${encodeURIComponent(id)}`),
    runRuntimeBuilderViewFieldTrigger: (viewId, fieldKey, event, input) => transport.post(
      `/builder/runtime/views/${encodeURIComponent(viewId)}/fields/${encodeURIComponent(fieldKey)}/triggers/${encodeURIComponent(event)}`,
      input
    ),
    listBuilderViewEntries: (viewId, query) => transport.get(
      `/builder/runtime/views/${encodeURIComponent(viewId)}/entries`,
      { query: queryParams(query) }
    ),
    createBuilderViewEntry: (viewId, input) => transport.post(
      `/builder/runtime/views/${encodeURIComponent(viewId)}/entries`,
      input
    ),
    updateBuilderViewEntry: (viewId, id, input) => transport.patch(
      `/builder/runtime/views/${encodeURIComponent(viewId)}/entries/${encodeURIComponent(id)}`,
      input
    ),
    deleteBuilderViewEntry: (viewId, id) => transport.delete(
      `/builder/runtime/views/${encodeURIComponent(viewId)}/entries/${encodeURIComponent(id)}`
    )
  };
}

// src/components/DynamicForm.tsx
import { useMemo as useMemo2 } from "react";
import { FormProvider as FormProvider3, useForm as useForm3 } from "react-hook-form";

// src/runtime/runtimeUtils.ts
function emptyFieldValue(field) {
  return field.type === "checkbox" ? false : "";
}
function createBuilderFormDefaultValues(schema) {
  const values = {};
  for (const field of schema?.fields ?? []) {
    values[field.key] = emptyFieldValue(field);
  }
  return { values };
}
function createBuilderEntryDefaultValues(view, editing) {
  const values = {};
  for (const field of view.form?.schema.fields ?? []) {
    const existing = editing?.values[field.key];
    values[field.key] = existing === void 0 ? emptyFieldValue(field) : existing;
  }
  return { values, version: editing?.version ?? 0 };
}
function formatBuilderRuntimeValue(value, locale = "mn-MN") {
  if (value === null || value === void 0 || value === "") return "\u2014";
  if (typeof value === "boolean") return value ? "\u0422\u0438\u0439\u043C" : "\u04AE\u0433\u04AF\u0439";
  if (typeof value === "number") return new Intl.NumberFormat(locale).format(value);
  return String(value);
}

// src/components/DynamicForm.tsx
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function createDynamicFormComponent(deps) {
  return function DynamicForm({ formId }) {
    const query = deps.hooks.useRuntimeBuilderForm(formId);
    const save = deps.hooks.useSaveRuntimeBuilderFormEntry(formId);
    const formValues = useMemo2(
      () => query.data ? createBuilderFormDefaultValues(query.data.schema) : void 0,
      [query.data]
    );
    const form = useForm3({
      defaultValues: createBuilderFormDefaultValues(query.data?.schema),
      values: formValues
    });
    const onSubmit = form.handleSubmit(async (values) => {
      try {
        await save.mutateAsync(values);
        form.reset(createBuilderFormDefaultValues(query.data?.schema));
        deps.notifications.success("Form \u0445\u0430\u0434\u0433\u0430\u043B\u0430\u0433\u0434\u043B\u0430\u0430");
      } catch (error) {
        deps.notifications.error(deps.notifications.errorMessage(error, "\u0425\u0430\u0434\u0433\u0430\u043B\u0430\u0445\u0430\u0434 \u0430\u043B\u0434\u0430\u0430 \u0433\u0430\u0440\u043B\u0430\u0430"));
      }
    });
    if (query.isError) {
      return /* @__PURE__ */ jsx4(
        deps.ErrorState,
        {
          title: "Form \u043D\u044D\u044D\u0433\u0434\u0441\u044D\u043D\u0433\u04AF\u0439",
          description: `\xAB${formId}\xBB id-\u0442\u0430\u0439 form \u043E\u043B\u0434\u0441\u043E\u043D\u0433\u04AF\u0439.`
        }
      );
    }
    if (!query.data) return null;
    return /* @__PURE__ */ jsx4(deps.FormShell, { title: query.data.title, children: /* @__PURE__ */ jsx4(FormProvider3, { ...form, children: /* @__PURE__ */ jsxs2("form", { onSubmit, noValidate: true, className: "space-y-6", children: [
      /* @__PURE__ */ jsx4(deps.FormFields, { formId, schema: query.data.schema, namePrefix: "values" }),
      /* @__PURE__ */ jsx4(deps.SubmitButton, { isSaving: save.isPending })
    ] }) }) });
  };
}

// src/components/DynamicList.tsx
import { useMemo as useMemo3 } from "react";
import { jsx as jsx5 } from "react/jsx-runtime";
function createDynamicListComponent(deps) {
  return function DynamicList({ listId }) {
    const query = deps.hooks.useRuntimeBuilderList(listId);
    const state = deps.useDataTableState({ pageSize: 20 });
    const entriesQuery = deps.hooks.useRuntimeBuilderListEntries(listId, state.query);
    const columns = useMemo3(() => query.data ? deps.buildColumns(query.data) : [], [query.data]);
    const entries = entriesQuery.data?.items ?? [];
    const controller = deps.useDataTable({
      columns,
      data: entries,
      rowCount: entriesQuery.data?.total ?? 0,
      state,
      getRowId: (row) => row.id
    });
    if (query.isError) {
      return /* @__PURE__ */ jsx5(
        deps.ErrorState,
        {
          title: "List \u043D\u044D\u044D\u0433\u0434\u0441\u044D\u043D\u0433\u04AF\u0439",
          description: `\xAB${listId}\xBB id-\u0442\u0430\u0439 list \u043E\u043B\u0434\u0441\u043E\u043D\u0433\u04AF\u0439.`
        }
      );
    }
    return /* @__PURE__ */ jsx5(
      deps.DataGrid,
      {
        title: query.data?.title ?? "Dynamic List",
        description: query.data?.description ?? `/winu/list?id=${listId}`,
        controller,
        isLoading: query.isPending || entriesQuery.isPending,
        searchPlaceholder: "\u041C\u04E9\u0440 \u0445\u0430\u0439\u0445...",
        emptyTitle: "\u041C\u04E9\u0440 \u0430\u043B\u0433\u0430",
        emptyDescription: "\u042D\u043D\u044D list-\u0438\u0439\u043D datasource \u0434\u044D\u044D\u0440 \u043C\u04E9\u0440 \u0430\u043B\u0433\u0430."
      }
    );
  };
}

// src/components/DynamicView.tsx
import { useMemo as useMemo4, useState as useState2 } from "react";
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
function createDynamicViewComponent(deps) {
  return function DynamicView({ viewId }) {
    const [editing, setEditing] = useState2(null);
    const [isDialogOpen, setDialogOpen] = useState2(false);
    const [pendingDelete, setPendingDelete] = useState2(null);
    const viewQuery = deps.hooks.useRuntimeBuilderView(viewId);
    const state = deps.useDataTableState({ pageSize: 20 });
    const entriesQuery = deps.hooks.useBuilderViewEntries(viewId, state.query);
    const save = deps.hooks.useSaveBuilderViewEntry(viewId);
    const remove = deps.hooks.useDeleteBuilderViewEntry(viewId);
    const view = viewQuery.data;
    const columns = useMemo4(
      () => view ? deps.buildColumns(view, {
        onEdit: (entry) => {
          setEditing(entry);
          setDialogOpen(true);
        },
        onDelete: setPendingDelete
      }) : [],
      [view]
    );
    const controller = deps.useDataTable({
      columns,
      data: entriesQuery.data?.items ?? [],
      rowCount: entriesQuery.data?.total ?? 0,
      state,
      getRowId: (row) => row.id
    });
    if (viewQuery.isError) {
      return /* @__PURE__ */ jsx6(
        deps.ErrorState,
        {
          title: "View \u043D\u044D\u044D\u0433\u0434\u0441\u044D\u043D\u0433\u04AF\u0439",
          description: `\xAB${viewId}\xBB id-\u0442\u0430\u0439 view \u043E\u043B\u0434\u0441\u043E\u043D\u0433\u04AF\u0439.`
        }
      );
    }
    return /* @__PURE__ */ jsxs3("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx6(
        deps.DataGrid,
        {
          title: view?.title ?? "Dynamic View",
          description: view?.description ?? `/winu/view?id=${viewId}`,
          controller,
          isLoading: viewQuery.isPending || entriesQuery.isPending,
          searchPlaceholder: "\u041C\u04E9\u0440 \u0445\u0430\u0439\u0445...",
          emptyTitle: "\u041C\u04E9\u0440 \u0430\u043B\u0433\u0430",
          emptyDescription: "\u042D\u043D\u044D view \u0434\u044D\u044D\u0440 \u044D\u0445\u043D\u0438\u0439 \u043C\u04E9\u0440\u04E9\u04E9 \u043D\u044D\u043C\u044D\u044D\u0440\u044D\u0439.",
          onRowClick: (entry) => {
            setEditing(entry);
            setDialogOpen(true);
          },
          toolbarExtra: /* @__PURE__ */ jsx6(
            deps.AddButton,
            {
              disabled: !view?.form,
              onAdd: () => {
                setEditing(null);
                setDialogOpen(true);
              }
            }
          )
        }
      ),
      view ? /* @__PURE__ */ jsx6(
        deps.EntryDialog,
        {
          open: isDialogOpen,
          view,
          editing,
          onClose: () => setDialogOpen(false),
          onSave: save.mutateAsync,
          isSaving: save.isPending
        }
      ) : null,
      /* @__PURE__ */ jsx6(
        deps.DeleteDialog,
        {
          entry: pendingDelete,
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

// src/components/RuntimeEntryDialog.tsx
import { FormProvider as FormProvider4, useForm as useForm4 } from "react-hook-form";
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
function createRuntimeEntryDialogComponent(deps) {
  return function RuntimeEntryDialog({
    open,
    view,
    editing,
    onClose,
    onSave,
    isSaving
  }) {
    const form = useForm4({
      defaultValues: createBuilderEntryDefaultValues(view, editing),
      values: open ? createBuilderEntryDefaultValues(view, editing) : void 0
    });
    const onSubmit = form.handleSubmit(async (values) => {
      try {
        await onSave({ id: editing?.id, input: values });
        onClose();
        deps.notifications.success(editing ? "\u041C\u04E9\u0440 \u0445\u0430\u0434\u0433\u0430\u043B\u0430\u0433\u0434\u043B\u0430\u0430" : "\u041C\u04E9\u0440 \u043D\u044D\u043C\u044D\u0433\u0434\u043B\u044D\u044D");
      } catch (error) {
        deps.notifications.error(deps.notifications.errorMessage(error, "\u0425\u0430\u0434\u0433\u0430\u043B\u0430\u0445\u0430\u0434 \u0430\u043B\u0434\u0430\u0430 \u0433\u0430\u0440\u043B\u0430\u0430"));
      }
    });
    return /* @__PURE__ */ jsx7(
      deps.DialogShell,
      {
        open,
        title: editing ? "\u041C\u04E9\u0440 \u0437\u0430\u0441\u0430\u0445" : "\u041C\u04E9\u0440 \u043D\u044D\u043C\u044D\u0445",
        description: view.title,
        onClose,
        children: /* @__PURE__ */ jsx7(FormProvider4, { ...form, children: /* @__PURE__ */ jsxs4("form", { onSubmit, noValidate: true, children: [
          view.form ? /* @__PURE__ */ jsx7(
            deps.FormFields,
            {
              formId: view.form.id,
              viewId: view.id,
              schema: view.form.schema,
              namePrefix: "values"
            }
          ) : null,
          /* @__PURE__ */ jsx7(deps.Actions, { isSaving, onClose })
        ] }) })
      }
    );
  };
}

// src/hooks/createBuilderHooks.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
function createBuilderKeys() {
  const builderKeys = {
    forms: ["builder", "forms"],
    dbTables: () => ["builder", "datasources", "tables"],
    formList: (query) => [...builderKeys.forms, "list", query],
    form: (id) => [...builderKeys.forms, "detail", id],
    formOptions: () => [...builderKeys.forms, "options"],
    lists: ["builder", "lists"],
    listList: (query) => [...builderKeys.lists, "list", query],
    list: (id) => [...builderKeys.lists, "detail", id],
    listOptions: () => [...builderKeys.lists, "options"],
    views: ["builder", "views"],
    viewList: (query) => [...builderKeys.views, "list", query],
    runtimeForm: (id) => ["builder", "runtime", "form", id],
    runtimeFieldOptions: (formId, fieldKey, query) => [...builderKeys.runtimeForm(formId), "fields", fieldKey, "options", query],
    runtimeFormEntries: (id) => [...builderKeys.runtimeForm(id), "entries"],
    runtimeList: (id) => ["builder", "runtime", "list", id],
    runtimeListEntries: (id, query) => [...builderKeys.runtimeList(id), "entries", query],
    runtimeView: (id) => ["builder", "runtime", "view", id],
    entries: (id, query) => [...builderKeys.runtimeView(id), "entries", query]
  };
  return builderKeys;
}
function createBuilderHooks(client) {
  const builderKeys = createBuilderKeys();
  function useBuilderDbTables() {
    return useQuery({ queryKey: builderKeys.dbTables(), queryFn: client.listBuilderDbTables });
  }
  function useBuilderForms(query) {
    return useQuery({
      queryKey: builderKeys.formList(query),
      queryFn: () => client.listBuilderForms(query),
      placeholderData: keepPreviousData
    });
  }
  function useBuilderFormOptions() {
    return useQuery({
      queryKey: builderKeys.formOptions(),
      queryFn: client.listBuilderFormOptions
    });
  }
  function useBuilderForm(id) {
    return useQuery({
      queryKey: builderKeys.form(id ?? ""),
      queryFn: () => client.getBuilderForm(id ?? ""),
      enabled: Boolean(id)
    });
  }
  function useSaveBuilderForm() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }) => id ? client.updateBuilderForm(id, input) : client.createBuilderForm(input),
      onSuccess: (form) => {
        queryClient.invalidateQueries({ queryKey: builderKeys.forms });
        queryClient.invalidateQueries({ queryKey: builderKeys.form(form.id) });
        queryClient.invalidateQueries({ queryKey: builderKeys.runtimeForm(form.id) });
      }
    });
  }
  function useReplicateBuilderForm() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }) => client.replicateBuilderForm(id, input),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.forms })
    });
  }
  function useDeleteBuilderForm() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.deleteBuilderForm,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.forms })
    });
  }
  function useBuilderLists(query) {
    return useQuery({
      queryKey: builderKeys.listList(query),
      queryFn: () => client.listBuilderLists(query),
      placeholderData: keepPreviousData
    });
  }
  function useBuilderListOptions() {
    return useQuery({
      queryKey: builderKeys.listOptions(),
      queryFn: client.listBuilderListOptions
    });
  }
  function useBuilderList(id) {
    return useQuery({
      queryKey: builderKeys.list(id ?? ""),
      queryFn: () => client.getBuilderList(id ?? ""),
      enabled: Boolean(id)
    });
  }
  function useSaveBuilderList() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }) => id ? client.updateBuilderList(id, input) : client.createBuilderList(input),
      onSuccess: (list) => {
        queryClient.invalidateQueries({ queryKey: builderKeys.lists });
        queryClient.invalidateQueries({ queryKey: builderKeys.list(list.id) });
        queryClient.invalidateQueries({ queryKey: builderKeys.runtimeList(list.id) });
      }
    });
  }
  function useReplicateBuilderList() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }) => client.replicateBuilderList(id, input),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.lists })
    });
  }
  function useDeleteBuilderList() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.deleteBuilderList,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.lists })
    });
  }
  function useBuilderViews(query) {
    return useQuery({
      queryKey: builderKeys.viewList(query),
      queryFn: () => client.listBuilderViews(query),
      placeholderData: keepPreviousData
    });
  }
  function useSaveBuilderView() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }) => id ? client.updateBuilderView(id, input) : client.createBuilderView(input),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.views })
    });
  }
  function useReplicateBuilderView() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }) => client.replicateBuilderView(id, input),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.views })
    });
  }
  function useDeleteBuilderView() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.deleteBuilderView,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.views })
    });
  }
  function useRuntimeBuilderForm(id) {
    return useQuery({
      queryKey: builderKeys.runtimeForm(id),
      queryFn: () => client.getRuntimeBuilderForm(id)
    });
  }
  function useRuntimeBuilderFormFieldOptions(formId, fieldKey, query, enabled = true) {
    return useQuery({
      queryKey: builderKeys.runtimeFieldOptions(formId ?? "", fieldKey, query),
      queryFn: () => client.listRuntimeBuilderFormFieldOptions(formId ?? "", fieldKey, query),
      enabled: Boolean(formId) && enabled
    });
  }
  function useRunRuntimeBuilderFieldTrigger() {
    return useMutation({
      mutationFn: (args) => {
        if (args.viewId) {
          return client.runRuntimeBuilderViewFieldTrigger(
            args.viewId,
            args.fieldKey,
            args.event,
            args.input
          );
        }
        if (args.formId) {
          return client.runRuntimeBuilderFormFieldTrigger(
            args.formId,
            args.fieldKey,
            args.event,
            args.input
          );
        }
        throw new Error("formId \u044D\u0441\u0432\u044D\u043B viewId \u0448\u0430\u0430\u0440\u0434\u043B\u0430\u0433\u0430\u0442\u0430\u0439");
      }
    });
  }
  function useRuntimeBuilderList(id) {
    return useQuery({
      queryKey: builderKeys.runtimeList(id),
      queryFn: () => client.getRuntimeBuilderList(id)
    });
  }
  function useRuntimeBuilderListEntries(id, query) {
    return useQuery({
      queryKey: builderKeys.runtimeListEntries(id, query),
      queryFn: () => client.listRuntimeBuilderListEntries(id, query),
      placeholderData: keepPreviousData
    });
  }
  function useSaveRuntimeBuilderFormEntry(formId) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (input) => client.createRuntimeBuilderFormEntry(formId, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: builderKeys.runtimeFormEntries(formId) });
        queryClient.invalidateQueries({ queryKey: builderKeys.runtimeForm(formId) });
        queryClient.invalidateQueries({ queryKey: ["builder", "runtime", "list"] });
      }
    });
  }
  function useRuntimeBuilderView(id) {
    return useQuery({
      queryKey: builderKeys.runtimeView(id),
      queryFn: () => client.getRuntimeBuilderView(id)
    });
  }
  function useBuilderViewEntries(id, query) {
    return useQuery({
      queryKey: builderKeys.entries(id, query),
      queryFn: () => client.listBuilderViewEntries(id, query),
      placeholderData: keepPreviousData
    });
  }
  function useSaveBuilderViewEntry(viewId) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }) => id ? client.updateBuilderViewEntry(viewId, id, input) : client.createBuilderViewEntry(
        viewId,
        input
      ),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.runtimeView(viewId) })
    });
  }
  function useDeleteBuilderViewEntry(id) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (entryId) => client.deleteBuilderViewEntry(id, entryId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.runtimeView(id) })
    });
  }
  return {
    builderKeys,
    useBuilderDbTables,
    useBuilderForm,
    useBuilderFormOptions,
    useBuilderForms,
    useBuilderList,
    useBuilderListOptions,
    useBuilderLists,
    useBuilderViewEntries,
    useBuilderViews,
    useDeleteBuilderForm,
    useDeleteBuilderList,
    useDeleteBuilderView,
    useDeleteBuilderViewEntry,
    useReplicateBuilderForm,
    useReplicateBuilderList,
    useReplicateBuilderView,
    useRuntimeBuilderForm,
    useRuntimeBuilderFormFieldOptions,
    useRuntimeBuilderList,
    useRuntimeBuilderListEntries,
    useRuntimeBuilderView,
    useRunRuntimeBuilderFieldTrigger,
    useSaveBuilderForm,
    useSaveBuilderList,
    useSaveBuilderView,
    useSaveBuilderViewEntry,
    useSaveRuntimeBuilderFormEntry
  };
}

// src/index.ts
var builderUiPackage = {
  name: "@winu/builder-ui",
  version: "0.1.0"
};
export {
  BUILDER_EDITOR_NONE_VALUE,
  builderEditorOptionsToText,
  builderEditorSearchFieldsToText,
  builderEditorTextToOptions,
  builderEditorTextToSearchFields,
  builderFormEditorFieldsFromTable,
  builderFormEditorInputFromValues,
  builderFormEditorValuesFromEntity,
  builderListEditorColumnsFromTable,
  builderListEditorInputFromValues,
  builderListEditorValuesFromEntity,
  builderUiPackage,
  builderViewEditorInputFromValues,
  builderViewEditorValuesFromEntity,
  createBuilderApiClient,
  createBuilderEntityDialogManagerComponent,
  createBuilderEntityManagerComponent,
  createBuilderEntryDefaultValues,
  createBuilderFormDefaultValues,
  createBuilderFormEditorPageComponent,
  createBuilderHooks,
  createBuilderKeys,
  createBuilderListEditorPageComponent,
  createBuilderViewDialogComponent,
  createDynamicFormComponent,
  createDynamicListComponent,
  createDynamicViewComponent,
  createRuntimeEntryDialogComponent,
  formatBuilderRuntimeValue,
  getBuilderEditorTriggerRoute
};
//# sourceMappingURL=index.js.map