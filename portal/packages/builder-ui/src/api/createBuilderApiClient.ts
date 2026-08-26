export type BuilderApiQueryValue = string | number | boolean | null | undefined;
export type BuilderApiQuery = Record<string, BuilderApiQueryValue>;

export type BuilderApiTransport = {
  get<T>(path: string, options?: { query?: BuilderApiQuery }): Promise<T>;
  post<T>(path: string, body?: unknown, options?: { query?: BuilderApiQuery }): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: { query?: BuilderApiQuery }): Promise<T>;
  delete<T>(path: string, options?: { query?: BuilderApiQuery }): Promise<T>;
};

export type BuilderFieldOptionsQuery = {
  search?: string;
  depends?: Record<string, string | undefined>;
};

export type BuilderApiContracts = {
  BuilderDbTable: unknown;
  BuilderForm: { id: string };
  BuilderList: { id: string };
  BuilderView: { id: string };
  BuilderViewEntry: { id: string };
  ListBuilderFormsQuery: object;
  ListBuilderFormsResponse: unknown;
  CreateBuilderFormInput: unknown;
  UpdateBuilderFormInput: unknown;
  ListBuilderListsQuery: object;
  ListBuilderListsResponse: unknown;
  CreateBuilderListInput: unknown;
  UpdateBuilderListInput: unknown;
  ListBuilderViewsQuery: object;
  ListBuilderViewsResponse: unknown;
  CreateBuilderViewInput: unknown;
  UpdateBuilderViewInput: unknown;
  ReplicateBuilderEntityInput: unknown;
  CreateBuilderViewEntryInput: unknown;
  UpdateBuilderViewEntryInput: unknown;
  ListBuilderFieldOptionsQuery: BuilderFieldOptionsQuery;
  ListBuilderFieldOptionsResponse: unknown;
  RunBuilderFieldTriggerInput: unknown;
  BuilderFieldTriggerEvent: string;
  BuilderFieldTriggerResponse: unknown;
  ListBuilderViewEntriesQuery: object;
  ListBuilderViewEntriesResponse: unknown;
};

function queryParams(query: object): BuilderApiQuery {
  return { ...query } as BuilderApiQuery;
}

function fieldOptionsQueryParams(query: BuilderFieldOptionsQuery): BuilderApiQuery {
  const flatQuery: BuilderApiQuery = { search: query.search };
  for (const [key, value] of Object.entries(query.depends ?? {})) {
    flatQuery[`depends.${key}`] = value;
  }
  return flatQuery;
}

export function createBuilderApiClient<C extends BuilderApiContracts>(
  transport: BuilderApiTransport,
) {
  return {
    listBuilderForms: (query: C["ListBuilderFormsQuery"]) =>
      transport.get<C["ListBuilderFormsResponse"]>("/builder/forms", {
        query: queryParams(query),
      }),

    listBuilderDbTables: () => transport.get<C["BuilderDbTable"][]>("/builder/datasources/tables"),

    listBuilderFormOptions: () => transport.get<C["BuilderForm"][]>("/builder/forms/options"),

    getBuilderForm: (id: string) =>
      transport.get<C["BuilderForm"]>(`/builder/forms/${encodeURIComponent(id)}`),

    createBuilderForm: (input: C["CreateBuilderFormInput"]) =>
      transport.post<C["BuilderForm"]>("/builder/forms", input),

    updateBuilderForm: (id: string, input: C["UpdateBuilderFormInput"]) =>
      transport.patch<C["BuilderForm"]>(`/builder/forms/${encodeURIComponent(id)}`, input),

    replicateBuilderForm: (id: string, input: C["ReplicateBuilderEntityInput"]) =>
      transport.post<C["BuilderForm"]>(`/builder/forms/${encodeURIComponent(id)}/replicate`, input),

    deleteBuilderForm: (id: string) =>
      transport.delete<void>(`/builder/forms/${encodeURIComponent(id)}`),

    listBuilderLists: (query: C["ListBuilderListsQuery"]) =>
      transport.get<C["ListBuilderListsResponse"]>("/builder/lists", {
        query: queryParams(query),
      }),

    listBuilderListOptions: () => transport.get<C["BuilderList"][]>("/builder/lists/options"),

    getBuilderList: (id: string) =>
      transport.get<C["BuilderList"]>(`/builder/lists/${encodeURIComponent(id)}`),

    createBuilderList: (input: C["CreateBuilderListInput"]) =>
      transport.post<C["BuilderList"]>("/builder/lists", input),

    updateBuilderList: (id: string, input: C["UpdateBuilderListInput"]) =>
      transport.patch<C["BuilderList"]>(`/builder/lists/${encodeURIComponent(id)}`, input),

    replicateBuilderList: (id: string, input: C["ReplicateBuilderEntityInput"]) =>
      transport.post<C["BuilderList"]>(`/builder/lists/${encodeURIComponent(id)}/replicate`, input),

    deleteBuilderList: (id: string) =>
      transport.delete<void>(`/builder/lists/${encodeURIComponent(id)}`),

    listBuilderViews: (query: C["ListBuilderViewsQuery"]) =>
      transport.get<C["ListBuilderViewsResponse"]>("/builder/views", {
        query: queryParams(query),
      }),

    getBuilderView: (id: string) =>
      transport.get<C["BuilderView"]>(`/builder/views/${encodeURIComponent(id)}`),

    createBuilderView: (input: C["CreateBuilderViewInput"]) =>
      transport.post<C["BuilderView"]>("/builder/views", input),

    updateBuilderView: (id: string, input: C["UpdateBuilderViewInput"]) =>
      transport.patch<C["BuilderView"]>(`/builder/views/${encodeURIComponent(id)}`, input),

    replicateBuilderView: (id: string, input: C["ReplicateBuilderEntityInput"]) =>
      transport.post<C["BuilderView"]>(`/builder/views/${encodeURIComponent(id)}/replicate`, input),

    deleteBuilderView: (id: string) =>
      transport.delete<void>(`/builder/views/${encodeURIComponent(id)}`),

    getRuntimeBuilderForm: (id: string) =>
      transport.get<C["BuilderForm"]>(`/builder/runtime/forms/${encodeURIComponent(id)}`),

    createRuntimeBuilderFormEntry: (formId: string, input: C["CreateBuilderViewEntryInput"]) =>
      transport.post<C["BuilderViewEntry"]>(
        `/builder/runtime/forms/${encodeURIComponent(formId)}/entries`,
        input,
      ),

    listRuntimeBuilderFormFieldOptions: (
      formId: string,
      fieldKey: string,
      query: C["ListBuilderFieldOptionsQuery"],
    ) =>
      transport.get<C["ListBuilderFieldOptionsResponse"]>(
        `/builder/runtime/forms/${encodeURIComponent(formId)}/fields/${encodeURIComponent(fieldKey)}/options`,
        { query: fieldOptionsQueryParams(query) },
      ),

    runRuntimeBuilderFormFieldTrigger: (
      formId: string,
      fieldKey: string,
      event: C["BuilderFieldTriggerEvent"],
      input: C["RunBuilderFieldTriggerInput"],
    ) =>
      transport.post<C["BuilderFieldTriggerResponse"]>(
        `/builder/runtime/forms/${encodeURIComponent(formId)}/fields/${encodeURIComponent(fieldKey)}/triggers/${encodeURIComponent(event)}`,
        input,
      ),

    getRuntimeBuilderList: (id: string) =>
      transport.get<C["BuilderList"]>(`/builder/runtime/lists/${encodeURIComponent(id)}`),

    listRuntimeBuilderListEntries: (listId: string, query: C["ListBuilderViewEntriesQuery"]) =>
      transport.get<C["ListBuilderViewEntriesResponse"]>(
        `/builder/runtime/lists/${encodeURIComponent(listId)}/entries`,
        { query: queryParams(query) },
      ),

    getRuntimeBuilderView: (id: string) =>
      transport.get<C["BuilderView"]>(`/builder/runtime/views/${encodeURIComponent(id)}`),

    runRuntimeBuilderViewFieldTrigger: (
      viewId: string,
      fieldKey: string,
      event: C["BuilderFieldTriggerEvent"],
      input: C["RunBuilderFieldTriggerInput"],
    ) =>
      transport.post<C["BuilderFieldTriggerResponse"]>(
        `/builder/runtime/views/${encodeURIComponent(viewId)}/fields/${encodeURIComponent(fieldKey)}/triggers/${encodeURIComponent(event)}`,
        input,
      ),

    listBuilderViewEntries: (viewId: string, query: C["ListBuilderViewEntriesQuery"]) =>
      transport.get<C["ListBuilderViewEntriesResponse"]>(
        `/builder/runtime/views/${encodeURIComponent(viewId)}/entries`,
        { query: queryParams(query) },
      ),

    createBuilderViewEntry: (viewId: string, input: C["CreateBuilderViewEntryInput"]) =>
      transport.post<C["BuilderViewEntry"]>(
        `/builder/runtime/views/${encodeURIComponent(viewId)}/entries`,
        input,
      ),

    updateBuilderViewEntry: (viewId: string, id: string, input: C["UpdateBuilderViewEntryInput"]) =>
      transport.patch<C["BuilderViewEntry"]>(
        `/builder/runtime/views/${encodeURIComponent(viewId)}/entries/${encodeURIComponent(id)}`,
        input,
      ),

    deleteBuilderViewEntry: (viewId: string, id: string) =>
      transport.delete<void>(
        `/builder/runtime/views/${encodeURIComponent(viewId)}/entries/${encodeURIComponent(id)}`,
      ),
  };
}

export type BuilderApiClient<C extends BuilderApiContracts> = ReturnType<
  typeof createBuilderApiClient<C>
>;
