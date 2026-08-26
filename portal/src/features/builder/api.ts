import { type BuilderApiContracts, createBuilderApiClient } from "@winu/builder-ui/api";
import type { builder } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export type PortalBuilderApiContracts = BuilderApiContracts & {
  BuilderDbTable: builder.BuilderDbTable;
  BuilderForm: builder.BuilderForm;
  BuilderList: builder.BuilderList;
  BuilderView: builder.BuilderView;
  BuilderViewEntry: builder.BuilderViewEntry;
  ListBuilderFormsQuery: builder.ListBuilderFormsQuery;
  ListBuilderFormsResponse: builder.ListBuilderFormsResponse;
  CreateBuilderFormInput: builder.CreateBuilderFormInput;
  UpdateBuilderFormInput: builder.UpdateBuilderFormInput;
  ListBuilderListsQuery: builder.ListBuilderListsQuery;
  ListBuilderListsResponse: builder.ListBuilderListsResponse;
  CreateBuilderListInput: builder.CreateBuilderListInput;
  UpdateBuilderListInput: builder.UpdateBuilderListInput;
  ListBuilderViewsQuery: builder.ListBuilderViewsQuery;
  ListBuilderViewsResponse: builder.ListBuilderViewsResponse;
  CreateBuilderViewInput: builder.CreateBuilderViewInput;
  UpdateBuilderViewInput: builder.UpdateBuilderViewInput;
  ReplicateBuilderEntityInput: builder.ReplicateBuilderEntityInput;
  CreateBuilderViewEntryInput: builder.CreateBuilderViewEntryInput;
  UpdateBuilderViewEntryInput: builder.UpdateBuilderViewEntryInput;
  ListBuilderFieldOptionsQuery: builder.ListBuilderFieldOptionsQuery;
  ListBuilderFieldOptionsResponse: builder.ListBuilderFieldOptionsResponse;
  RunBuilderFieldTriggerInput: builder.RunBuilderFieldTriggerInput;
  BuilderFieldTriggerEvent: builder.BuilderFieldTriggerEvent;
  BuilderFieldTriggerResponse: builder.BuilderFieldTriggerResponse;
  ListBuilderViewEntriesQuery: builder.ListBuilderViewEntriesQuery;
  ListBuilderViewEntriesResponse: builder.ListBuilderViewEntriesResponse;
};

export const builderApiClient = createBuilderApiClient<PortalBuilderApiContracts>(api);

export const {
  createBuilderForm,
  createBuilderList,
  createBuilderView,
  createBuilderViewEntry,
  createRuntimeBuilderFormEntry,
  deleteBuilderForm,
  deleteBuilderList,
  deleteBuilderView,
  deleteBuilderViewEntry,
  getBuilderForm,
  getBuilderList,
  getBuilderView,
  getRuntimeBuilderForm,
  getRuntimeBuilderList,
  getRuntimeBuilderView,
  listBuilderDbTables,
  listBuilderFormOptions,
  listBuilderForms,
  listBuilderListOptions,
  listBuilderLists,
  listBuilderViewEntries,
  listBuilderViews,
  listRuntimeBuilderFormFieldOptions,
  listRuntimeBuilderListEntries,
  replicateBuilderForm,
  replicateBuilderList,
  replicateBuilderView,
  runRuntimeBuilderFormFieldTrigger,
  runRuntimeBuilderViewFieldTrigger,
  updateBuilderForm,
  updateBuilderList,
  updateBuilderView,
  updateBuilderViewEntry,
} = builderApiClient;
