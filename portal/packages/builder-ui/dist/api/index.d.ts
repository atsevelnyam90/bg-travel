type BuilderApiQueryValue = string | number | boolean | null | undefined;
type BuilderApiQuery = Record<string, BuilderApiQueryValue>;
type BuilderApiTransport = {
    get<T>(path: string, options?: {
        query?: BuilderApiQuery;
    }): Promise<T>;
    post<T>(path: string, body?: unknown, options?: {
        query?: BuilderApiQuery;
    }): Promise<T>;
    patch<T>(path: string, body?: unknown, options?: {
        query?: BuilderApiQuery;
    }): Promise<T>;
    delete<T>(path: string, options?: {
        query?: BuilderApiQuery;
    }): Promise<T>;
};
type BuilderFieldOptionsQuery = {
    search?: string;
    depends?: Record<string, string | undefined>;
};
type BuilderApiContracts = {
    BuilderDbTable: unknown;
    BuilderForm: {
        id: string;
    };
    BuilderList: {
        id: string;
    };
    BuilderView: {
        id: string;
    };
    BuilderViewEntry: {
        id: string;
    };
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
declare function createBuilderApiClient<C extends BuilderApiContracts>(transport: BuilderApiTransport): {
    listBuilderForms: (query: C["ListBuilderFormsQuery"]) => Promise<C["ListBuilderFormsResponse"]>;
    listBuilderDbTables: () => Promise<C["BuilderDbTable"][]>;
    listBuilderFormOptions: () => Promise<C["BuilderForm"][]>;
    getBuilderForm: (id: string) => Promise<C["BuilderForm"]>;
    createBuilderForm: (input: C["CreateBuilderFormInput"]) => Promise<C["BuilderForm"]>;
    updateBuilderForm: (id: string, input: C["UpdateBuilderFormInput"]) => Promise<C["BuilderForm"]>;
    replicateBuilderForm: (id: string, input: C["ReplicateBuilderEntityInput"]) => Promise<C["BuilderForm"]>;
    deleteBuilderForm: (id: string) => Promise<void>;
    listBuilderLists: (query: C["ListBuilderListsQuery"]) => Promise<C["ListBuilderListsResponse"]>;
    listBuilderListOptions: () => Promise<C["BuilderList"][]>;
    getBuilderList: (id: string) => Promise<C["BuilderList"]>;
    createBuilderList: (input: C["CreateBuilderListInput"]) => Promise<C["BuilderList"]>;
    updateBuilderList: (id: string, input: C["UpdateBuilderListInput"]) => Promise<C["BuilderList"]>;
    replicateBuilderList: (id: string, input: C["ReplicateBuilderEntityInput"]) => Promise<C["BuilderList"]>;
    deleteBuilderList: (id: string) => Promise<void>;
    listBuilderViews: (query: C["ListBuilderViewsQuery"]) => Promise<C["ListBuilderViewsResponse"]>;
    getBuilderView: (id: string) => Promise<C["BuilderView"]>;
    createBuilderView: (input: C["CreateBuilderViewInput"]) => Promise<C["BuilderView"]>;
    updateBuilderView: (id: string, input: C["UpdateBuilderViewInput"]) => Promise<C["BuilderView"]>;
    replicateBuilderView: (id: string, input: C["ReplicateBuilderEntityInput"]) => Promise<C["BuilderView"]>;
    deleteBuilderView: (id: string) => Promise<void>;
    getRuntimeBuilderForm: (id: string) => Promise<C["BuilderForm"]>;
    createRuntimeBuilderFormEntry: (formId: string, input: C["CreateBuilderViewEntryInput"]) => Promise<C["BuilderViewEntry"]>;
    listRuntimeBuilderFormFieldOptions: (formId: string, fieldKey: string, query: C["ListBuilderFieldOptionsQuery"]) => Promise<C["ListBuilderFieldOptionsResponse"]>;
    runRuntimeBuilderFormFieldTrigger: (formId: string, fieldKey: string, event: C["BuilderFieldTriggerEvent"], input: C["RunBuilderFieldTriggerInput"]) => Promise<C["BuilderFieldTriggerResponse"]>;
    getRuntimeBuilderList: (id: string) => Promise<C["BuilderList"]>;
    listRuntimeBuilderListEntries: (listId: string, query: C["ListBuilderViewEntriesQuery"]) => Promise<C["ListBuilderViewEntriesResponse"]>;
    getRuntimeBuilderView: (id: string) => Promise<C["BuilderView"]>;
    runRuntimeBuilderViewFieldTrigger: (viewId: string, fieldKey: string, event: C["BuilderFieldTriggerEvent"], input: C["RunBuilderFieldTriggerInput"]) => Promise<C["BuilderFieldTriggerResponse"]>;
    listBuilderViewEntries: (viewId: string, query: C["ListBuilderViewEntriesQuery"]) => Promise<C["ListBuilderViewEntriesResponse"]>;
    createBuilderViewEntry: (viewId: string, input: C["CreateBuilderViewEntryInput"]) => Promise<C["BuilderViewEntry"]>;
    updateBuilderViewEntry: (viewId: string, id: string, input: C["UpdateBuilderViewEntryInput"]) => Promise<C["BuilderViewEntry"]>;
    deleteBuilderViewEntry: (viewId: string, id: string) => Promise<void>;
};
type BuilderApiClient<C extends BuilderApiContracts> = ReturnType<typeof createBuilderApiClient<C>>;

export { type BuilderApiClient, type BuilderApiContracts, type BuilderApiQuery, type BuilderApiQueryValue, type BuilderApiTransport, type BuilderFieldOptionsQuery, createBuilderApiClient };
