import type { builder as builderContract } from "@winu/contracts";
import type { BuilderErrors } from "../errors";
import type { BuilderMetadataRepository } from "../metadata";
import { toFormDto, toListDto } from "../metadata";

export type BuilderDefinitionUseCaseDependencies = {
  metadataRepository: BuilderMetadataRepository;
  errors: Pick<BuilderErrors, "conflict" | "notFound">;
};

function normalizeForm(input: builderContract.CreateBuilderFormInput) {
  return {
    type: "form" as const,
    title: input.title,
    description: input.description ?? null,
    source: input.source ?? null,
    schema: input.schema,
    triggers: input.triggers ?? [],
  };
}

function normalizeList(input: builderContract.CreateBuilderListInput) {
  return {
    type: "list" as const,
    title: input.title,
    description: input.description ?? null,
    source: input.source ?? null,
    schema: input.schema,
    triggers: input.triggers ?? [],
  };
}

export function createBuilderDefinitionUseCases(deps: BuilderDefinitionUseCaseDependencies) {
  const { errors, metadataRepository } = deps;

  async function listBuilderForms(
    query: builderContract.ListBuilderFormsQuery,
  ): Promise<builderContract.ListBuilderFormsResponse> {
    const { total, rows } = await metadataRepository.listDefinitionRows({
      type: "form",
      search: query.search,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
    return { items: rows.map(toFormDto), total, page: query.page, pageSize: query.pageSize };
  }

  async function listAllBuilderForms(): Promise<builderContract.BuilderForm[]> {
    const rows = await metadataRepository.listAllDefinitionRows("form");
    return rows.map(toFormDto);
  }

  async function getBuilderForm(id: string): Promise<builderContract.BuilderForm> {
    const row = await metadataRepository.findDefinitionRow({ id, type: "form" });
    if (!row) throw errors.notFound("Form олдсонгүй");
    return toFormDto(row);
  }

  async function createBuilderForm(
    input: builderContract.CreateBuilderFormInput,
  ): Promise<builderContract.BuilderForm> {
    return toFormDto(await metadataRepository.createDefinitionRow(normalizeForm(input)));
  }

  async function updateBuilderForm(
    id: string,
    input: builderContract.UpdateBuilderFormInput,
  ): Promise<builderContract.BuilderForm> {
    const existing = await metadataRepository.findDefinitionRow({ id, type: "form" });
    if (!existing) throw errors.notFound("Form олдсонгүй");
    const { version: _version, ...rest } = input;
    const updated = await metadataRepository.updateDefinitionRow({
      id: existing.id,
      type: "form",
      version: input.version,
      data: normalizeForm(rest),
    });
    if (!updated) {
      throw errors.conflict("Form өөрчлөгдсөн байна. Хуудас шинэчлээд дахин оролдоно уу.");
    }
    const row = await metadataRepository.findDefinitionRow({ id: existing.id, type: "form" });
    if (!row) throw errors.notFound("Form олдсонгүй");
    return toFormDto(row);
  }

  async function deleteBuilderForm(id: string): Promise<void> {
    const deleted = await metadataRepository.softDeleteDefinitionRow({ id, type: "form" });
    if (!deleted) throw errors.notFound("Form олдсонгүй");
  }

  async function replicateBuilderForm(
    id: string,
    input: builderContract.ReplicateBuilderEntityInput,
  ): Promise<builderContract.BuilderForm> {
    const existing = await metadataRepository.findDefinitionRow({ id, type: "form" });
    if (!existing) throw errors.notFound("Form олдсонгүй");
    return toFormDto(
      await metadataRepository.createDefinitionRow({
        type: "form",
        title: input.title ?? `${existing.title} copy`,
        description: existing.description,
        source: existing.source,
        schema: existing.schema,
        triggers: existing.triggers ?? [],
      }),
    );
  }

  async function listBuilderLists(
    query: builderContract.ListBuilderListsQuery,
  ): Promise<builderContract.ListBuilderListsResponse> {
    const { total, rows } = await metadataRepository.listDefinitionRows({
      type: "list",
      search: query.search,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
    return { items: rows.map(toListDto), total, page: query.page, pageSize: query.pageSize };
  }

  async function listAllBuilderLists(): Promise<builderContract.BuilderList[]> {
    const rows = await metadataRepository.listAllDefinitionRows("list");
    return rows.map(toListDto);
  }

  async function getBuilderList(id: string): Promise<builderContract.BuilderList> {
    const row = await metadataRepository.findDefinitionRow({ id, type: "list" });
    if (!row) throw errors.notFound("List олдсонгүй");
    return toListDto(row);
  }

  async function createBuilderList(
    input: builderContract.CreateBuilderListInput,
  ): Promise<builderContract.BuilderList> {
    return toListDto(await metadataRepository.createDefinitionRow(normalizeList(input)));
  }

  async function updateBuilderList(
    id: string,
    input: builderContract.UpdateBuilderListInput,
  ): Promise<builderContract.BuilderList> {
    const existing = await metadataRepository.findDefinitionRow({ id, type: "list" });
    if (!existing) throw errors.notFound("List олдсонгүй");
    const { version: _version, ...rest } = input;
    const updated = await metadataRepository.updateDefinitionRow({
      id: existing.id,
      type: "list",
      version: input.version,
      data: normalizeList(rest),
    });
    if (!updated) {
      throw errors.conflict("List өөрчлөгдсөн байна. Хуудас шинэчлээд дахин оролдоно уу.");
    }
    const row = await metadataRepository.findDefinitionRow({ id: existing.id, type: "list" });
    if (!row) throw errors.notFound("List олдсонгүй");
    return toListDto(row);
  }

  async function deleteBuilderList(id: string): Promise<void> {
    const deleted = await metadataRepository.softDeleteDefinitionRow({ id, type: "list" });
    if (!deleted) throw errors.notFound("List олдсонгүй");
  }

  async function replicateBuilderList(
    id: string,
    input: builderContract.ReplicateBuilderEntityInput,
  ): Promise<builderContract.BuilderList> {
    const existing = await metadataRepository.findDefinitionRow({ id, type: "list" });
    if (!existing) throw errors.notFound("List олдсонгүй");
    return toListDto(
      await metadataRepository.createDefinitionRow({
        type: "list",
        title: input.title ?? `${existing.title} copy`,
        description: existing.description,
        source: existing.source,
        schema: existing.schema,
        triggers: existing.triggers ?? [],
      }),
    );
  }

  return {
    createBuilderForm,
    createBuilderList,
    deleteBuilderForm,
    deleteBuilderList,
    getBuilderForm,
    getBuilderList,
    listAllBuilderForms,
    listAllBuilderLists,
    listBuilderForms,
    listBuilderLists,
    replicateBuilderForm,
    replicateBuilderList,
    updateBuilderForm,
    updateBuilderList,
  };
}

export type BuilderDefinitionUseCases = ReturnType<typeof createBuilderDefinitionUseCases>;
