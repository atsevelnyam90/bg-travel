"use client";

import { createBuilderHooks } from "@winu/builder-ui/hooks";
import { builderApiClient, type PortalBuilderApiContracts } from "../api";

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
} = createBuilderHooks<PortalBuilderApiContracts>(builderApiClient);
