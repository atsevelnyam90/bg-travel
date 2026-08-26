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
    getBuilderForm: (id) => transport.get(`/builder/runtime/forms/${encodeURIComponent(id)}`),
    createBuilderForm: (input) => transport.post("/builder/forms", input),
    updateBuilderForm: (id, input) => transport.patch(`/builder/forms/${encodeURIComponent(id)}`, input),
    replicateBuilderForm: (id, input) => transport.post(`/builder/forms/${encodeURIComponent(id)}/replicate`, input),
    deleteBuilderForm: (id) => transport.delete(`/builder/forms/${encodeURIComponent(id)}`),
    listBuilderLists: (query) => transport.get("/builder/lists", {
      query: queryParams(query)
    }),
    listBuilderListOptions: () => transport.get("/builder/lists/options"),
    getBuilderList: (id) => transport.get(`/builder/runtime/lists/${encodeURIComponent(id)}`),
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
export {
  createBuilderApiClient
};
//# sourceMappingURL=index.js.map