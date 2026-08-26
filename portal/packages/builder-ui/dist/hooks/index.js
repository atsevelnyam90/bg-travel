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
export {
  createBuilderHooks,
  createBuilderKeys
};
//# sourceMappingURL=index.js.map