// src/components/DynamicForm.tsx
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

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

// src/components/DynamicForm.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function createDynamicFormComponent(deps) {
  return function DynamicForm({ formId }) {
    const query = deps.hooks.useRuntimeBuilderForm(formId);
    const save = deps.hooks.useSaveRuntimeBuilderFormEntry(formId);
    const formValues = useMemo(
      () => query.data ? createBuilderFormDefaultValues(query.data.schema) : void 0,
      [query.data]
    );
    const form = useForm({
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
      return /* @__PURE__ */ jsx(
        deps.ErrorState,
        {
          title: "Form \u043D\u044D\u044D\u0433\u0434\u0441\u044D\u043D\u0433\u04AF\u0439",
          description: `\xAB${formId}\xBB id-\u0442\u0430\u0439 form \u043E\u043B\u0434\u0441\u043E\u043D\u0433\u04AF\u0439.`
        }
      );
    }
    if (!query.data) return null;
    return /* @__PURE__ */ jsx(deps.FormShell, { title: query.data.title, children: /* @__PURE__ */ jsx(FormProvider, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit, noValidate: true, className: "space-y-6", children: [
      /* @__PURE__ */ jsx(deps.FormFields, { formId, schema: query.data.schema, namePrefix: "values" }),
      /* @__PURE__ */ jsx(deps.SubmitButton, { isSaving: save.isPending })
    ] }) }) });
  };
}

// src/components/DynamicList.tsx
import { useMemo as useMemo2 } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
function createDynamicListComponent(deps) {
  return function DynamicList({ listId }) {
    const query = deps.hooks.useRuntimeBuilderList(listId);
    const state = deps.useDataTableState({ pageSize: 20 });
    const entriesQuery = deps.hooks.useRuntimeBuilderListEntries(listId, state.query);
    const columns = useMemo2(() => query.data ? deps.buildColumns(query.data) : [], [query.data]);
    const entries = entriesQuery.data?.items ?? [];
    const controller = deps.useDataTable({
      columns,
      data: entries,
      rowCount: entriesQuery.data?.total ?? 0,
      state,
      getRowId: (row) => row.id
    });
    if (query.isError) {
      return /* @__PURE__ */ jsx2(
        deps.ErrorState,
        {
          title: "List \u043D\u044D\u044D\u0433\u0434\u0441\u044D\u043D\u0433\u04AF\u0439",
          description: `\xAB${listId}\xBB id-\u0442\u0430\u0439 list \u043E\u043B\u0434\u0441\u043E\u043D\u0433\u04AF\u0439.`
        }
      );
    }
    return /* @__PURE__ */ jsx2(
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
import { useMemo as useMemo3, useState } from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function createDynamicViewComponent(deps) {
  return function DynamicView({ viewId }) {
    const [editing, setEditing] = useState(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const viewQuery = deps.hooks.useRuntimeBuilderView(viewId);
    const state = deps.useDataTableState({ pageSize: 20 });
    const entriesQuery = deps.hooks.useBuilderViewEntries(viewId, state.query);
    const save = deps.hooks.useSaveBuilderViewEntry(viewId);
    const remove = deps.hooks.useDeleteBuilderViewEntry(viewId);
    const view = viewQuery.data;
    const columns = useMemo3(
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
      return /* @__PURE__ */ jsx3(
        deps.ErrorState,
        {
          title: "View \u043D\u044D\u044D\u0433\u0434\u0441\u044D\u043D\u0433\u04AF\u0439",
          description: `\xAB${viewId}\xBB id-\u0442\u0430\u0439 view \u043E\u043B\u0434\u0441\u043E\u043D\u0433\u04AF\u0439.`
        }
      );
    }
    return /* @__PURE__ */ jsxs2("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx3(
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
          toolbarExtra: /* @__PURE__ */ jsx3(
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
      view ? /* @__PURE__ */ jsx3(
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
      /* @__PURE__ */ jsx3(
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
import { FormProvider as FormProvider2, useForm as useForm2 } from "react-hook-form";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function createRuntimeEntryDialogComponent(deps) {
  return function RuntimeEntryDialog({
    open,
    view,
    editing,
    onClose,
    onSave,
    isSaving
  }) {
    const form = useForm2({
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
    return /* @__PURE__ */ jsx4(
      deps.DialogShell,
      {
        open,
        title: editing ? "\u041C\u04E9\u0440 \u0437\u0430\u0441\u0430\u0445" : "\u041C\u04E9\u0440 \u043D\u044D\u043C\u044D\u0445",
        description: view.title,
        onClose,
        children: /* @__PURE__ */ jsx4(FormProvider2, { ...form, children: /* @__PURE__ */ jsxs3("form", { onSubmit, noValidate: true, children: [
          view.form ? /* @__PURE__ */ jsx4(
            deps.FormFields,
            {
              formId: view.form.id,
              viewId: view.id,
              schema: view.form.schema,
              namePrefix: "values"
            }
          ) : null,
          /* @__PURE__ */ jsx4(deps.Actions, { isSaving, onClose })
        ] }) })
      }
    );
  };
}
export {
  createDynamicFormComponent,
  createDynamicListComponent,
  createDynamicViewComponent,
  createRuntimeEntryDialogComponent
};
//# sourceMappingURL=index.js.map