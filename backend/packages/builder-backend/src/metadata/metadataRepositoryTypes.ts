import type { builder as builderContract } from "@winu/contracts";
import type { DefinitionRow, ViewRow } from "./builderMapper";

export type BuilderDefinitionKind = builderContract.BuilderDefinitionType;

export type ListBuilderDefinitionRowsArgs = {
  type: BuilderDefinitionKind;
  search?: string;
  sort?: string;
  page: number;
  pageSize: number;
};

export type BuilderDefinitionData = {
  type: BuilderDefinitionKind;
  title: string;
  description: string | null;
  source: unknown;
  schema: unknown;
  triggers: unknown;
};

export type UpdateBuilderDefinitionRowArgs = {
  id: string;
  type: BuilderDefinitionKind;
  version: number;
  data: BuilderDefinitionData;
};

export type ListBuilderViewRowsArgs = {
  search?: string;
  sort?: string;
  page: number;
  pageSize: number;
};

export type BuilderViewData = {
  title: string;
  description: string | null;
  formId: string | null;
  listId: string | null;
  permissionRead: string | null;
  permissionWrite: string | null;
  triggers: unknown;
};

export type UpdateBuilderViewRowArgs = {
  id: string;
  version: number;
  data: BuilderViewData;
};

export type BuilderMetadataRepository = {
  listDefinitionRows(
    args: ListBuilderDefinitionRowsArgs,
  ): Promise<{ total: number; rows: DefinitionRow[] }>;
  listAllDefinitionRows(type: BuilderDefinitionKind): Promise<DefinitionRow[]>;
  findDefinitionRow(args: {
    id: string;
    type: BuilderDefinitionKind;
  }): Promise<DefinitionRow | null>;
  findDefinitionId(args: {
    id: string;
    type: BuilderDefinitionKind;
  }): Promise<{ id: string } | null>;
  createDefinitionRow(data: BuilderDefinitionData): Promise<DefinitionRow>;
  updateDefinitionRow(args: UpdateBuilderDefinitionRowArgs): Promise<boolean>;
  softDeleteDefinitionRow(args: { id: string; type: BuilderDefinitionKind }): Promise<boolean>;
  listViewRows(args: ListBuilderViewRowsArgs): Promise<{ total: number; rows: ViewRow[] }>;
  findViewRow(id: string): Promise<ViewRow | null>;
  createViewRow(data: BuilderViewData): Promise<ViewRow>;
  updateViewRow(args: UpdateBuilderViewRowArgs): Promise<boolean>;
  softDeleteViewRow(id: string): Promise<boolean>;
};
