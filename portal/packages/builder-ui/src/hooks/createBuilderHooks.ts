"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BuilderApiClient, BuilderApiContracts } from "../api";

export function createBuilderKeys<C extends BuilderApiContracts>() {
  const builderKeys = {
    forms: ["builder", "forms"] as const,
    dbTables: () => ["builder", "datasources", "tables"] as const,
    formList: (query: C["ListBuilderFormsQuery"]) => [...builderKeys.forms, "list", query] as const,
    form: (id: string) => [...builderKeys.forms, "detail", id] as const,
    formOptions: () => [...builderKeys.forms, "options"] as const,
    lists: ["builder", "lists"] as const,
    listList: (query: C["ListBuilderListsQuery"]) => [...builderKeys.lists, "list", query] as const,
    list: (id: string) => [...builderKeys.lists, "detail", id] as const,
    listOptions: () => [...builderKeys.lists, "options"] as const,
    views: ["builder", "views"] as const,
    viewList: (query: C["ListBuilderViewsQuery"]) => [...builderKeys.views, "list", query] as const,
    runtimeForm: (id: string) => ["builder", "runtime", "form", id] as const,
    runtimeFieldOptions: (
      formId: string,
      fieldKey: string,
      query: C["ListBuilderFieldOptionsQuery"],
    ) => [...builderKeys.runtimeForm(formId), "fields", fieldKey, "options", query] as const,
    runtimeFormEntries: (id: string) => [...builderKeys.runtimeForm(id), "entries"] as const,
    runtimeList: (id: string) => ["builder", "runtime", "list", id] as const,
    runtimeListEntries: (id: string, query: C["ListBuilderViewEntriesQuery"]) =>
      [...builderKeys.runtimeList(id), "entries", query] as const,
    runtimeView: (id: string) => ["builder", "runtime", "view", id] as const,
    entries: (id: string, query: C["ListBuilderViewEntriesQuery"]) =>
      [...builderKeys.runtimeView(id), "entries", query] as const,
  };

  return builderKeys;
}

export function createBuilderHooks<C extends BuilderApiContracts>(client: BuilderApiClient<C>) {
  const builderKeys = createBuilderKeys<C>();

  function useBuilderDbTables() {
    return useQuery({ queryKey: builderKeys.dbTables(), queryFn: client.listBuilderDbTables });
  }

  function useBuilderForms(query: C["ListBuilderFormsQuery"]) {
    return useQuery({
      queryKey: builderKeys.formList(query),
      queryFn: () => client.listBuilderForms(query),
      placeholderData: keepPreviousData,
    });
  }

  function useBuilderFormOptions() {
    return useQuery({
      queryKey: builderKeys.formOptions(),
      queryFn: client.listBuilderFormOptions,
    });
  }

  function useBuilderForm(id?: string) {
    return useQuery({
      queryKey: builderKeys.form(id ?? ""),
      queryFn: () => client.getBuilderForm(id ?? ""),
      enabled: Boolean(id),
    });
  }

  function useSaveBuilderForm() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id?: string; input: C["UpdateBuilderFormInput"] }) =>
        id
          ? client.updateBuilderForm(id, input)
          : client.createBuilderForm(input as unknown as C["CreateBuilderFormInput"]),
      onSuccess: (form) => {
        queryClient.invalidateQueries({ queryKey: builderKeys.forms });
        queryClient.invalidateQueries({ queryKey: builderKeys.form(form.id) });
        queryClient.invalidateQueries({ queryKey: builderKeys.runtimeForm(form.id) });
      },
    });
  }

  function useReplicateBuilderForm() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: C["ReplicateBuilderEntityInput"] }) =>
        client.replicateBuilderForm(id, input),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.forms }),
    });
  }

  function useDeleteBuilderForm() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.deleteBuilderForm,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.forms }),
    });
  }

  function useBuilderLists(query: C["ListBuilderListsQuery"]) {
    return useQuery({
      queryKey: builderKeys.listList(query),
      queryFn: () => client.listBuilderLists(query),
      placeholderData: keepPreviousData,
    });
  }

  function useBuilderListOptions() {
    return useQuery({
      queryKey: builderKeys.listOptions(),
      queryFn: client.listBuilderListOptions,
    });
  }

  function useBuilderList(id?: string) {
    return useQuery({
      queryKey: builderKeys.list(id ?? ""),
      queryFn: () => client.getBuilderList(id ?? ""),
      enabled: Boolean(id),
    });
  }

  function useSaveBuilderList() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id?: string; input: C["UpdateBuilderListInput"] }) =>
        id
          ? client.updateBuilderList(id, input)
          : client.createBuilderList(input as unknown as C["CreateBuilderListInput"]),
      onSuccess: (list) => {
        queryClient.invalidateQueries({ queryKey: builderKeys.lists });
        queryClient.invalidateQueries({ queryKey: builderKeys.list(list.id) });
        queryClient.invalidateQueries({ queryKey: builderKeys.runtimeList(list.id) });
      },
    });
  }

  function useReplicateBuilderList() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: C["ReplicateBuilderEntityInput"] }) =>
        client.replicateBuilderList(id, input),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.lists }),
    });
  }

  function useDeleteBuilderList() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.deleteBuilderList,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.lists }),
    });
  }

  function useBuilderViews(query: C["ListBuilderViewsQuery"]) {
    return useQuery({
      queryKey: builderKeys.viewList(query),
      queryFn: () => client.listBuilderViews(query),
      placeholderData: keepPreviousData,
    });
  }

  function useSaveBuilderView() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id?: string; input: C["UpdateBuilderViewInput"] }) =>
        id
          ? client.updateBuilderView(id, input)
          : client.createBuilderView(input as unknown as C["CreateBuilderViewInput"]),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.views }),
    });
  }

  function useReplicateBuilderView() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: C["ReplicateBuilderEntityInput"] }) =>
        client.replicateBuilderView(id, input),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.views }),
    });
  }

  function useDeleteBuilderView() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.deleteBuilderView,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.views }),
    });
  }

  function useRuntimeBuilderForm(id: string) {
    return useQuery({
      queryKey: builderKeys.runtimeForm(id),
      queryFn: () => client.getRuntimeBuilderForm(id),
    });
  }

  function useRuntimeBuilderFormFieldOptions(
    formId: string | undefined,
    fieldKey: string,
    query: C["ListBuilderFieldOptionsQuery"],
    enabled = true,
  ) {
    return useQuery({
      queryKey: builderKeys.runtimeFieldOptions(formId ?? "", fieldKey, query),
      queryFn: () => client.listRuntimeBuilderFormFieldOptions(formId ?? "", fieldKey, query),
      enabled: Boolean(formId) && enabled,
    });
  }

  function useRunRuntimeBuilderFieldTrigger() {
    return useMutation({
      mutationFn: (args: {
        formId?: string;
        viewId?: string;
        fieldKey: string;
        event: C["BuilderFieldTriggerEvent"];
        input: C["RunBuilderFieldTriggerInput"];
      }) => {
        if (args.viewId) {
          return client.runRuntimeBuilderViewFieldTrigger(
            args.viewId,
            args.fieldKey,
            args.event,
            args.input,
          );
        }
        if (args.formId) {
          return client.runRuntimeBuilderFormFieldTrigger(
            args.formId,
            args.fieldKey,
            args.event,
            args.input,
          );
        }
        throw new Error("formId эсвэл viewId шаардлагатай");
      },
    });
  }

  function useRuntimeBuilderList(id: string) {
    return useQuery({
      queryKey: builderKeys.runtimeList(id),
      queryFn: () => client.getRuntimeBuilderList(id),
    });
  }

  function useRuntimeBuilderListEntries(id: string, query: C["ListBuilderViewEntriesQuery"]) {
    return useQuery({
      queryKey: builderKeys.runtimeListEntries(id, query),
      queryFn: () => client.listRuntimeBuilderListEntries(id, query),
      placeholderData: keepPreviousData,
    });
  }

  function useSaveRuntimeBuilderFormEntry(formId: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (input: C["CreateBuilderViewEntryInput"]) =>
        client.createRuntimeBuilderFormEntry(formId, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: builderKeys.runtimeFormEntries(formId) });
        queryClient.invalidateQueries({ queryKey: builderKeys.runtimeForm(formId) });
        queryClient.invalidateQueries({ queryKey: ["builder", "runtime", "list"] });
      },
    });
  }

  function useRuntimeBuilderView(id: string) {
    return useQuery({
      queryKey: builderKeys.runtimeView(id),
      queryFn: () => client.getRuntimeBuilderView(id),
    });
  }

  function useBuilderViewEntries(id: string, query: C["ListBuilderViewEntriesQuery"]) {
    return useQuery({
      queryKey: builderKeys.entries(id, query),
      queryFn: () => client.listBuilderViewEntries(id, query),
      placeholderData: keepPreviousData,
    });
  }

  function useSaveBuilderViewEntry(viewId: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id?: string; input: C["UpdateBuilderViewEntryInput"] }) =>
        id
          ? client.updateBuilderViewEntry(viewId, id, input)
          : client.createBuilderViewEntry(
              viewId,
              input as unknown as C["CreateBuilderViewEntryInput"],
            ),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.runtimeView(viewId) }),
    });
  }

  function useDeleteBuilderViewEntry(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (entryId: string) => client.deleteBuilderViewEntry(id, entryId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: builderKeys.runtimeView(id) }),
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
    useSaveRuntimeBuilderFormEntry,
  };
}

export type BuilderHooks<C extends BuilderApiContracts> = ReturnType<typeof createBuilderHooks<C>>;
