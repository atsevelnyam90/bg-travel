"use client";

import { BuilderProvider, type ReadyBuilderContracts } from "@duke333/builder-ui";
import { createBuilderAdminPages } from "@duke333/builder-ui/admin";
import { createBuilderIntegration } from "@duke333/builder-ui/integration";
import type { QueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { builder as builderContract, PERMISSIONS } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { createAppBuilderRuntimeComponents } from "./presentation";

export type PortalBuilderApiContracts = ReadyBuilderContracts;

export const builderClient = createBuilderIntegration<ReadyBuilderContracts>({
  transport: api,
  adminBasePath: "/admin/dev/builder",
  runtimeBasePath: "/admin/winu",
});

export const builderRuntimeComponents = createAppBuilderRuntimeComponents(builderClient.hooks);

export function AppBuilderProvider({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <BuilderProvider
      client={builderClient.api}
      components={builderRuntimeComponents}
      queryClient={queryClient}
    >
      {children}
    </BuilderProvider>
  );
}

export const {
  useBuilderViewEntries,
  useCreateCompositeBuilderViewEntry,
  useDeleteBuilderViewEntry,
  useRunRuntimeBuilderFieldTrigger,
  useRuntimeBuilderFormFieldOptions,
  useRuntimeBuilderView,
  useSaveBuilderViewEntry,
  useUpdateCompositeBuilderViewEntry,
} = builderClient.hooks;

const builderAdmin = createBuilderAdminPages<ReadyBuilderContracts>({
  hooks: builderClient.hooks,
  routes: {
    adminBasePath: builderClient.routes.adminBasePath,
    runtimeBasePath: builderClient.routes.runtimeBasePath,
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
