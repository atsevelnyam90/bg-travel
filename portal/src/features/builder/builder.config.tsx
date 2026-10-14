"use client";

import { createBuilderAdminPages } from "@duke333/builder-ui/admin";
import { type BuilderApiContracts, createBuilderApiClient } from "@duke333/builder-ui/api";
import { createBuilderHooks } from "@duke333/builder-ui/hooks";
import { createBuilderIntegration } from "@duke333/builder-ui/integration";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { builder } from "@/api/generated/contracts";
import { builder as builderContract, PERMISSIONS } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";
import { apiErrorMessage } from "@/lib/api/errorMessage";

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
  CreateCompositeBuilderViewEntryInput: builder.CreateCompositeBuilderViewEntryInput;
  UpdateCompositeBuilderViewEntryInput: builder.UpdateCompositeBuilderViewEntryInput;
  UpdateBuilderViewEntryInput: builder.UpdateBuilderViewEntryInput;
  ListBuilderFieldOptionsQuery: builder.ListBuilderFieldOptionsQuery;
  ListBuilderFieldOptionsResponse: builder.ListBuilderFieldOptionsResponse;
  RunBuilderFieldTriggerInput: builder.RunBuilderFieldTriggerInput;
  BuilderFieldTriggerEvent: builder.BuilderFieldTriggerEvent;
  BuilderFieldTriggerResponse: builder.BuilderFieldTriggerResponse;
  ListBuilderViewEntriesQuery: builder.ListBuilderViewEntriesQuery;
  ListBuilderViewEntriesResponse: builder.ListBuilderViewEntriesResponse;
};

export const builderClient = createBuilderIntegration<PortalBuilderApiContracts>({
  transport: api,
  adminBasePath: "/admin/dev/builder",
});

export const builderApiClient = createBuilderApiClient<PortalBuilderApiContracts>(api);

export const {
  createBuilderForm,
  createBuilderList,
  createBuilderView,
  createBuilderViewEntry,
  createCompositeBuilderViewEntry,
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
  updateCompositeBuilderViewEntry,
  updateBuilderView,
  updateBuilderViewEntry,
} = builderApiClient;

export const {
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
  useCreateCompositeBuilderViewEntry,
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
  useUpdateCompositeBuilderViewEntry,
} = createBuilderHooks<PortalBuilderApiContracts>(builderApiClient);

const builderAdmin = createBuilderAdminPages<PortalBuilderApiContracts>({
  hooks: builderClient.hooks,
  routes: {
    adminBasePath: builderClient.routes.adminBasePath,
    runtimeBasePath: "/admin/winu",
  },
  fieldTypeOptions: builderContract.builderFieldTypeSchema.options.map((value) => ({
    value,
    label: value,
  })),
  formTriggerEventOptions: builderContract.builderFormTriggerEventSchema.options.map((value) => ({
    value,
    label: value,
  })),
  listTriggerEventOptions: builderContract.builderListTriggerEventSchema.options.map((value) => ({
    value,
    label: value,
  })),
  fieldTriggerEventOptions: builderContract.builderFieldTriggerEventSchema.options.map((value) => ({
    value,
    label: value,
  })),
  permissionOptions: PERMISSIONS.map((value) => ({ value, label: value })),
  defaultPermission: "org:manage",
  parseViewTriggers: (value) =>
    builderContract.builderTriggerSchema.array().parse(JSON.parse(value)),
  notifySuccess: toast.success,
  notifyError: (error) => toast.error(apiErrorMessage(error)),
});

export function AdminHomePage() {
  const Component = builderAdmin.AdminHomePage;
  return <Component />;
}

export function AdminFormsPage() {
  const Component = builderAdmin.AdminFormsPage;
  return <Component />;
}

export function AdminNewFormPage() {
  const Component = builderAdmin.AdminNewFormPage;
  return <Component />;
}

export function AdminEditFormPage({ formId }: { formId?: string }) {
  const Component = builderAdmin.AdminEditFormPage;
  return <Component formId={formId} />;
}

export function AdminEditFormRoutePage() {
  const formId = useSearchParams().get("id") ?? undefined;
  return <AdminEditFormPage formId={formId} />;
}

export function AdminListsPage() {
  const Component = builderAdmin.AdminListsPage;
  return <Component />;
}

export function AdminNewListPage() {
  const Component = builderAdmin.AdminNewListPage;
  return <Component />;
}

export function AdminEditListPage({ listId }: { listId?: string }) {
  const Component = builderAdmin.AdminEditListPage;
  return <Component listId={listId} />;
}

export function AdminEditListRoutePage() {
  const listId = useSearchParams().get("id") ?? undefined;
  return <AdminEditListPage listId={listId} />;
}

export function AdminViewsPage() {
  const Component = builderAdmin.AdminViewsPage;
  return <Component />;
}

export function AdminNewViewPage() {
  const Component = builderAdmin.AdminNewViewPage;
  return <Component />;
}

export function AdminEditViewPage({ viewId }: { viewId?: string }) {
  const Component = builderAdmin.AdminEditViewPage;
  return <Component viewId={viewId} />;
}

export function AdminEditViewRoutePage() {
  const viewId = useSearchParams().get("id") ?? undefined;
  return <AdminEditViewPage viewId={viewId} />;
}
