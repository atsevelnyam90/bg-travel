import type { builder as builderContract, Permission } from "@winu/contracts";
import type { BuilderErrors } from "../errors";
import type { BuilderMetadataRepository } from "../metadata";
import { toViewDto } from "../metadata";

export type BuilderViewUseCaseDependencies = {
  metadataRepository: BuilderMetadataRepository;
  errors: Pick<BuilderErrors, "badRequest" | "conflict" | "forbidden" | "notFound">;
  defaultViewPermission: Permission;
};

function assertPermission(
  errors: Pick<BuilderErrors, "forbidden">,
  granted: readonly Permission[],
  permission?: Permission | null,
) {
  if (!permission) {
    throw errors.forbidden("Builder view дээр эрх тохируулагдаагүй байна");
  }
  if (!granted.includes(permission)) throw errors.forbidden();
}

export function createBuilderViewUseCases(deps: BuilderViewUseCaseDependencies) {
  const { defaultViewPermission, errors, metadataRepository } = deps;

  async function assertDefinition(id: string, type: builderContract.BuilderDefinitionType) {
    const definition = await metadataRepository.findDefinitionId({ id, type });
    if (!definition) throw errors.badRequest(type === "form" ? "Form олдсонгүй" : "List олдсонгүй");
  }

  async function normalizeView(input: builderContract.CreateBuilderViewInput) {
    if (!input.formId && !input.listId) {
      throw errors.badRequest("View нь form эсвэл list сонгосон байх ёстой");
    }

    if (input.formId) await assertDefinition(input.formId, "form");
    if (input.listId) await assertDefinition(input.listId, "list");

    return {
      title: input.title,
      description: input.description ?? null,
      formId: input.formId ?? null,
      listId: input.listId ?? null,
      permissionRead: input.permissionRead ?? defaultViewPermission,
      permissionWrite: input.permissionWrite ?? defaultViewPermission,
      triggers: input.triggers ?? [],
    };
  }

  async function listBuilderViews(
    query: builderContract.ListBuilderViewsQuery,
  ): Promise<builderContract.ListBuilderViewsResponse> {
    const { total, rows } = await metadataRepository.listViewRows({
      search: query.search,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
    return { items: rows.map(toViewDto), total, page: query.page, pageSize: query.pageSize };
  }

  async function getBuilderView(id: string): Promise<builderContract.BuilderView> {
    const view = await metadataRepository.findViewRow(id);
    if (!view) throw errors.notFound("View олдсонгүй");
    return toViewDto(view);
  }

  async function createBuilderView(
    input: builderContract.CreateBuilderViewInput,
  ): Promise<builderContract.BuilderView> {
    return toViewDto(await metadataRepository.createViewRow(await normalizeView(input)));
  }

  async function updateBuilderView(
    id: string,
    input: builderContract.UpdateBuilderViewInput,
  ): Promise<builderContract.BuilderView> {
    const existing = await metadataRepository.findViewRow(id);
    if (!existing) throw errors.notFound("View олдсонгүй");
    const { version: _version, ...rest } = input;
    const updated = await metadataRepository.updateViewRow({
      id: existing.id,
      version: input.version,
      data: await normalizeView(rest),
    });
    if (!updated) {
      throw errors.conflict("View өөрчлөгдсөн байна. Хуудас шинэчлээд дахин оролдоно уу.");
    }
    return getBuilderView(existing.id);
  }

  async function deleteBuilderView(id: string): Promise<void> {
    const deleted = await metadataRepository.softDeleteViewRow(id);
    if (!deleted) throw errors.notFound("View олдсонгүй");
  }

  async function replicateBuilderView(
    id: string,
    input: builderContract.ReplicateBuilderEntityInput,
  ): Promise<builderContract.BuilderView> {
    const existing = await metadataRepository.findViewRow(id);
    if (!existing) throw errors.notFound("View олдсонгүй");
    return toViewDto(
      await metadataRepository.createViewRow({
        title: input.title ?? `${existing.title} copy`,
        description: existing.description,
        formId: existing.formId,
        listId: existing.listId,
        permissionRead: existing.permissionRead,
        permissionWrite: existing.permissionWrite,
        triggers: existing.triggers ?? [],
      }),
    );
  }

  async function getRuntimeBuilderView(
    id: string,
    permissions: readonly Permission[],
  ): Promise<builderContract.BuilderView> {
    const view = await getBuilderView(id);
    assertPermission(errors, permissions, view.permissionRead);
    return view;
  }

  return {
    createBuilderView,
    deleteBuilderView,
    getBuilderView,
    getRuntimeBuilderView,
    listBuilderViews,
    replicateBuilderView,
    updateBuilderView,
  };
}

export type BuilderViewUseCases = ReturnType<typeof createBuilderViewUseCases>;
