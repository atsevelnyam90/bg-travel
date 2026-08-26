import type { builder as builderContract } from "@winu/contracts";
import type { BuilderErrors } from "../errors";

export type RuntimeEntryAudit = {
  resource: string;
  resourceId: string;
  meta?: Record<string, unknown>;
};

export type RuntimeEntryMutationResult = {
  entry: builderContract.BuilderViewEntry;
  audit: RuntimeEntryAudit;
};

export type BuilderRuntimeAdapters = {
  listEntries(args: {
    tableName: string;
    list: builderContract.BuilderList;
    viewId: string;
    query: builderContract.ListBuilderViewEntriesQuery;
  }): Promise<builderContract.ListBuilderViewEntriesResponse>;
  createEntry(args: {
    tableName: string;
    form: builderContract.BuilderForm;
    viewId: string;
    values: Record<string, unknown>;
  }): Promise<RuntimeEntryMutationResult>;
  updateEntry(args: {
    tableName: string;
    form: builderContract.BuilderForm;
    viewId: string;
    id: string;
    input: builderContract.UpdateBuilderViewEntryInput;
  }): Promise<RuntimeEntryMutationResult>;
  deleteEntry(args: {
    tableName: string;
    list: builderContract.BuilderList;
    viewId: string;
    id: string;
  }): Promise<RuntimeEntryAudit>;
};

export type BuilderRuntimeTableAdapter = Partial<BuilderRuntimeAdapters>;

export type CreateBuilderRuntimeAdaptersDependencies = {
  generic: Pick<BuilderRuntimeAdapters, "createEntry" | "listEntries">;
  errors: Pick<BuilderErrors, "badRequest">;
  tables?: Record<string, BuilderRuntimeTableAdapter>;
};

export function createBuilderRuntimeAdapters(
  deps: CreateBuilderRuntimeAdaptersDependencies,
): BuilderRuntimeAdapters {
  return {
    listEntries(args) {
      return deps.tables?.[args.tableName]?.listEntries?.(args) ?? deps.generic.listEntries(args);
    },

    createEntry(args) {
      return deps.tables?.[args.tableName]?.createEntry?.(args) ?? deps.generic.createEntry(args);
    },

    updateEntry(args) {
      const updateEntry = deps.tables?.[args.tableName]?.updateEntry;
      if (updateEntry) return updateEntry(args);
      throw deps.errors.badRequest(
        `${args.tableName} table-ийн runtime update хараахан холбогдоогүй байна`,
      );
    },

    deleteEntry(args) {
      const deleteEntry = deps.tables?.[args.tableName]?.deleteEntry;
      if (deleteEntry) return deleteEntry(args);
      throw deps.errors.badRequest(
        `${args.tableName} table-ийн runtime delete хараахан холбогдоогүй байна`,
      );
    },
  };
}
