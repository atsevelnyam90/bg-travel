import * as _tanstack_react_query from '@tanstack/react-query';
import { BuilderApiContracts, BuilderApiClient } from '../api/index.js';

declare function createBuilderKeys<C extends BuilderApiContracts>(): {
    forms: readonly ["builder", "forms"];
    dbTables: () => readonly ["builder", "datasources", "tables"];
    formList: (query: C["ListBuilderFormsQuery"]) => readonly ["builder", "forms", "list", C["ListBuilderFormsQuery"]];
    form: (id: string) => readonly ["builder", "forms", "detail", string];
    formOptions: () => readonly ["builder", "forms", "options"];
    lists: readonly ["builder", "lists"];
    listList: (query: C["ListBuilderListsQuery"]) => readonly ["builder", "lists", "list", C["ListBuilderListsQuery"]];
    list: (id: string) => readonly ["builder", "lists", "detail", string];
    listOptions: () => readonly ["builder", "lists", "options"];
    views: readonly ["builder", "views"];
    viewList: (query: C["ListBuilderViewsQuery"]) => readonly ["builder", "views", "list", C["ListBuilderViewsQuery"]];
    runtimeForm: (id: string) => readonly ["builder", "runtime", "form", string];
    runtimeFieldOptions: (formId: string, fieldKey: string, query: C["ListBuilderFieldOptionsQuery"]) => readonly ["builder", "runtime", "form", string, "fields", string, "options", C["ListBuilderFieldOptionsQuery"]];
    runtimeFormEntries: (id: string) => readonly ["builder", "runtime", "form", string, "entries"];
    runtimeList: (id: string) => readonly ["builder", "runtime", "list", string];
    runtimeListEntries: (id: string, query: C["ListBuilderViewEntriesQuery"]) => readonly ["builder", "runtime", "list", string, "entries", C["ListBuilderViewEntriesQuery"]];
    runtimeView: (id: string) => readonly ["builder", "runtime", "view", string];
    entries: (id: string, query: C["ListBuilderViewEntriesQuery"]) => readonly ["builder", "runtime", "view", string, "entries", C["ListBuilderViewEntriesQuery"]];
};
declare function createBuilderHooks<C extends BuilderApiContracts>(client: BuilderApiClient<C>): {
    builderKeys: {
        forms: readonly ["builder", "forms"];
        dbTables: () => readonly ["builder", "datasources", "tables"];
        formList: (query: C["ListBuilderFormsQuery"]) => readonly ["builder", "forms", "list", C["ListBuilderFormsQuery"]];
        form: (id: string) => readonly ["builder", "forms", "detail", string];
        formOptions: () => readonly ["builder", "forms", "options"];
        lists: readonly ["builder", "lists"];
        listList: (query: C["ListBuilderListsQuery"]) => readonly ["builder", "lists", "list", C["ListBuilderListsQuery"]];
        list: (id: string) => readonly ["builder", "lists", "detail", string];
        listOptions: () => readonly ["builder", "lists", "options"];
        views: readonly ["builder", "views"];
        viewList: (query: C["ListBuilderViewsQuery"]) => readonly ["builder", "views", "list", C["ListBuilderViewsQuery"]];
        runtimeForm: (id: string) => readonly ["builder", "runtime", "form", string];
        runtimeFieldOptions: (formId: string, fieldKey: string, query: C["ListBuilderFieldOptionsQuery"]) => readonly ["builder", "runtime", "form", string, "fields", string, "options", C["ListBuilderFieldOptionsQuery"]];
        runtimeFormEntries: (id: string) => readonly ["builder", "runtime", "form", string, "entries"];
        runtimeList: (id: string) => readonly ["builder", "runtime", "list", string];
        runtimeListEntries: (id: string, query: C["ListBuilderViewEntriesQuery"]) => readonly ["builder", "runtime", "list", string, "entries", C["ListBuilderViewEntriesQuery"]];
        runtimeView: (id: string) => readonly ["builder", "runtime", "view", string];
        entries: (id: string, query: C["ListBuilderViewEntriesQuery"]) => readonly ["builder", "runtime", "view", string, "entries", C["ListBuilderViewEntriesQuery"]];
    };
    useBuilderDbTables: () => _tanstack_react_query.UseQueryResult<NoInfer<C["BuilderDbTable"][]>, Error>;
    useBuilderForm: (id?: string) => _tanstack_react_query.UseQueryResult<NoInfer<C["BuilderForm"]>, Error>;
    useBuilderFormOptions: () => _tanstack_react_query.UseQueryResult<NoInfer<C["BuilderForm"][]>, Error>;
    useBuilderForms: (query: C["ListBuilderFormsQuery"]) => _tanstack_react_query.UseQueryResult<NoInfer<C["ListBuilderFormsResponse"]>, Error>;
    useBuilderList: (id?: string) => _tanstack_react_query.UseQueryResult<NoInfer<C["BuilderList"]>, Error>;
    useBuilderListOptions: () => _tanstack_react_query.UseQueryResult<NoInfer<C["BuilderList"][]>, Error>;
    useBuilderLists: (query: C["ListBuilderListsQuery"]) => _tanstack_react_query.UseQueryResult<NoInfer<C["ListBuilderListsResponse"]>, Error>;
    useBuilderViewEntries: (id: string, query: C["ListBuilderViewEntriesQuery"]) => _tanstack_react_query.UseQueryResult<NoInfer<C["ListBuilderViewEntriesResponse"]>, Error>;
    useBuilderViews: (query: C["ListBuilderViewsQuery"]) => _tanstack_react_query.UseQueryResult<NoInfer<C["ListBuilderViewsResponse"]>, Error>;
    useDeleteBuilderForm: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useDeleteBuilderList: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useDeleteBuilderView: () => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useDeleteBuilderViewEntry: (id: string) => _tanstack_react_query.UseMutationResult<void, Error, string, unknown>;
    useReplicateBuilderForm: () => _tanstack_react_query.UseMutationResult<C["BuilderForm"], Error, {
        id: string;
        input: C["ReplicateBuilderEntityInput"];
    }, unknown>;
    useReplicateBuilderList: () => _tanstack_react_query.UseMutationResult<C["BuilderList"], Error, {
        id: string;
        input: C["ReplicateBuilderEntityInput"];
    }, unknown>;
    useReplicateBuilderView: () => _tanstack_react_query.UseMutationResult<C["BuilderView"], Error, {
        id: string;
        input: C["ReplicateBuilderEntityInput"];
    }, unknown>;
    useRuntimeBuilderForm: (id: string) => _tanstack_react_query.UseQueryResult<NoInfer<C["BuilderForm"]>, Error>;
    useRuntimeBuilderFormFieldOptions: (formId: string | undefined, fieldKey: string, query: C["ListBuilderFieldOptionsQuery"], enabled?: boolean) => _tanstack_react_query.UseQueryResult<NoInfer<C["ListBuilderFieldOptionsResponse"]>, Error>;
    useRuntimeBuilderList: (id: string) => _tanstack_react_query.UseQueryResult<NoInfer<C["BuilderList"]>, Error>;
    useRuntimeBuilderListEntries: (id: string, query: C["ListBuilderViewEntriesQuery"]) => _tanstack_react_query.UseQueryResult<NoInfer<C["ListBuilderViewEntriesResponse"]>, Error>;
    useRuntimeBuilderView: (id: string) => _tanstack_react_query.UseQueryResult<NoInfer<C["BuilderView"]>, Error>;
    useRunRuntimeBuilderFieldTrigger: () => _tanstack_react_query.UseMutationResult<C["BuilderFieldTriggerResponse"], Error, {
        formId?: string;
        viewId?: string;
        fieldKey: string;
        event: C["BuilderFieldTriggerEvent"];
        input: C["RunBuilderFieldTriggerInput"];
    }, unknown>;
    useSaveBuilderForm: () => _tanstack_react_query.UseMutationResult<C["BuilderForm"], Error, {
        id?: string;
        input: C["UpdateBuilderFormInput"];
    }, unknown>;
    useSaveBuilderList: () => _tanstack_react_query.UseMutationResult<C["BuilderList"], Error, {
        id?: string;
        input: C["UpdateBuilderListInput"];
    }, unknown>;
    useSaveBuilderView: () => _tanstack_react_query.UseMutationResult<C["BuilderView"], Error, {
        id?: string;
        input: C["UpdateBuilderViewInput"];
    }, unknown>;
    useSaveBuilderViewEntry: (viewId: string) => _tanstack_react_query.UseMutationResult<C["BuilderViewEntry"], Error, {
        id?: string;
        input: C["UpdateBuilderViewEntryInput"];
    }, unknown>;
    useSaveRuntimeBuilderFormEntry: (formId: string) => _tanstack_react_query.UseMutationResult<C["BuilderViewEntry"], Error, C["CreateBuilderViewEntryInput"], unknown>;
};
type BuilderHooks<C extends BuilderApiContracts> = ReturnType<typeof createBuilderHooks<C>>;

export { type BuilderHooks, createBuilderHooks, createBuilderKeys };
