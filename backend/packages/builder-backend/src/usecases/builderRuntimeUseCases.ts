import { builder as builderContract, type Permission } from "@winu/contracts";
import type { BuilderErrors } from "../errors";
import type { BuilderMetadataRepository } from "../metadata";
import { toFormDto, toListDto } from "../metadata";
import type {
  BuilderRuntimeAdapters,
  RuntimeEntryAudit,
  RuntimeEntryMutationResult,
} from "../runtime";
import type { BuilderTriggerContext } from "../triggers";

export type BuilderTriggerRunner = (
  triggers: readonly builderContract.BuilderTrigger[],
  context: BuilderTriggerContext,
) => Promise<void>;

export type BuilderFieldTriggerContext = {
  event: builderContract.BuilderFieldTriggerEvent;
  trigger: builderContract.BuilderFieldTrigger;
  form: builderContract.BuilderForm;
  field: builderContract.BuilderField;
  view?: builderContract.BuilderView;
  value: unknown;
  values: Record<string, unknown>;
};

export type BuilderFieldTriggerRunner = (
  context: BuilderFieldTriggerContext,
) => Promise<builderContract.BuilderFieldTriggerResponse>;

export type BuilderFieldOptionsProvider = (
  source: builderContract.BuilderSelectOptionsSource,
  query: builderContract.ListBuilderFieldOptionsQuery,
) => Promise<builderContract.ListBuilderFieldOptionsResponse>;

export type RuntimeBuilderViewProvider = (
  id: string,
  permissions: readonly Permission[],
) => Promise<builderContract.BuilderView>;

export type BuilderRuntimeUseCaseDependencies = {
  metadataRepository: Pick<BuilderMetadataRepository, "findDefinitionRow">;
  errors: Pick<BuilderErrors, "badRequest" | "forbidden" | "notFound">;
  runtimeAdapters: BuilderRuntimeAdapters;
  runTriggers: BuilderTriggerRunner;
  runFieldTrigger: BuilderFieldTriggerRunner;
  listFieldOptions: BuilderFieldOptionsProvider;
  getRuntimeBuilderView: RuntimeBuilderViewProvider;
};

function parseSource(value: unknown): builderContract.BuilderDatasource | null {
  if (!value) return null;
  const parsed = builderContract.builderDatasourceSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function isBlank(value: unknown) {
  return value === null || value === undefined || value === "";
}

export function createBuilderRuntimeUseCases(deps: BuilderRuntimeUseCaseDependencies) {
  const {
    errors,
    getRuntimeBuilderView,
    listFieldOptions,
    metadataRepository,
    runFieldTrigger,
    runTriggers,
  } = deps;

  function assertPermission(granted: readonly Permission[], permission?: Permission | null) {
    if (!permission) {
      throw errors.forbidden("Builder view дээр эрх тохируулагдаагүй байна");
    }
    if (!granted.includes(permission)) throw errors.forbidden();
  }

  function getViewTableName(view: builderContract.BuilderView) {
    const listSource = parseSource(view.list?.source);
    const formSource = parseSource(view.form?.source);

    if (
      listSource?.type === "dbTable" &&
      formSource?.type === "dbTable" &&
      listSource.tableName !== formSource.tableName
    ) {
      throw errors.badRequest("Form болон List-ийн table зөрсөн байна");
    }

    const source = listSource?.type === "dbTable" ? listSource : formSource;
    if (source?.type !== "dbTable") {
      throw errors.badRequest("Энэ view дээр DB table datasource сонгогдоогүй байна");
    }
    return source.tableName;
  }

  function getDefinitionTableName(
    definition: builderContract.BuilderForm | builderContract.BuilderList,
  ) {
    const source = parseSource(definition.source);
    if (source?.type !== "dbTable") {
      throw errors.badRequest("Энэ definition дээр DB table datasource сонгогдоогүй байна");
    }
    return source.tableName;
  }

  function requireForm(view: builderContract.BuilderView) {
    if (!view.form) throw errors.badRequest("Энэ view дээр form сонгогдоогүй байна");
    return view.form;
  }

  function requireList(view: builderContract.BuilderView) {
    if (!view.list) throw errors.badRequest("Энэ view дээр list сонгогдоогүй байна");
    return view.list;
  }

  function assertRequiredFields(
    form: builderContract.BuilderForm,
    values: Record<string, unknown>,
  ) {
    for (const field of form.schema.fields) {
      if (field.required && isBlank(values[field.key])) {
        throw errors.badRequest(`${field.label} талбар заавал бөглөгдөнө`);
      }
    }
  }

  function findFormField(form: builderContract.BuilderForm, fieldKey: string) {
    const field = form.schema.fields.find((item) => item.key === fieldKey);
    if (!field) throw errors.notFound("Field олдсонгүй");
    return field;
  }

  async function runFieldTriggers(args: {
    form: builderContract.BuilderForm;
    fieldKey: string;
    event: builderContract.BuilderFieldTriggerEvent;
    input: builderContract.RunBuilderFieldTriggerInput;
    view?: builderContract.BuilderView;
  }): Promise<builderContract.BuilderFieldTriggerResponse> {
    const field = findFormField(args.form, args.fieldKey);
    const triggers = field.triggers.filter(
      (trigger) => trigger.enabled && trigger.event === args.event,
    );
    let response: builderContract.BuilderFieldTriggerResponse = {
      schema: [],
      valuesPatch: {},
      fieldErrors: {},
    };

    for (const trigger of triggers) {
      const next = builderContract.builderFieldTriggerResponseSchema.parse(
        await runFieldTrigger({
          event: args.event,
          trigger,
          form: args.form,
          field,
          view: args.view,
          value: args.input.value,
          values: args.input.values,
        }),
      );
      response = {
        schema: [...response.schema, ...next.schema],
        valuesPatch: { ...response.valuesPatch, ...next.valuesPatch },
        fieldErrors: { ...response.fieldErrors, ...next.fieldErrors },
        toast: next.toast ?? response.toast,
      };
    }

    return response;
  }

  function resolveAdapters(runtimeAdapters?: BuilderRuntimeAdapters) {
    return runtimeAdapters ?? deps.runtimeAdapters;
  }

  async function getRuntimeBuilderForm(id: string): Promise<builderContract.BuilderForm> {
    const form = await metadataRepository.findDefinitionRow({ id, type: "form" });
    if (!form) throw errors.notFound("Form олдсонгүй");
    return toFormDto(form);
  }

  async function getRuntimeBuilderList(id: string): Promise<builderContract.BuilderList> {
    const list = await metadataRepository.findDefinitionRow({ id, type: "list" });
    if (!list) throw errors.notFound("List олдсонгүй");
    return toListDto(list);
  }

  async function listRuntimeBuilderFormFieldOptions(
    id: string,
    fieldKey: string,
    query: builderContract.ListBuilderFieldOptionsQuery,
  ): Promise<builderContract.ListBuilderFieldOptionsResponse> {
    const form = await getRuntimeBuilderForm(id);
    const field = form.schema.fields.find((item) => item.key === fieldKey);
    if (!field) throw errors.notFound("Field олдсонгүй");
    if (field.type !== "select") throw errors.badRequest("Зөвхөн select field options-той байна");

    if (!field.optionsSource) return field.options ?? [];
    return listFieldOptions(field.optionsSource, query);
  }

  async function runRuntimeBuilderFormFieldTrigger(
    id: string,
    fieldKey: string,
    event: builderContract.BuilderFieldTriggerEvent,
    input: builderContract.RunBuilderFieldTriggerInput,
  ): Promise<builderContract.BuilderFieldTriggerResponse> {
    const form = await getRuntimeBuilderForm(id);
    return runFieldTriggers({ form, fieldKey, event, input });
  }

  async function runRuntimeBuilderViewFieldTrigger(
    id: string,
    fieldKey: string,
    event: builderContract.BuilderFieldTriggerEvent,
    input: builderContract.RunBuilderFieldTriggerInput,
    permissions: readonly Permission[],
  ): Promise<builderContract.BuilderFieldTriggerResponse> {
    const view = await getRuntimeBuilderView(id, permissions);
    assertPermission(permissions, view.permissionWrite);
    const form = requireForm(view);
    return runFieldTriggers({ form, fieldKey, event, input, view });
  }

  async function listRuntimeBuilderListEntries(
    id: string,
    query: builderContract.ListBuilderViewEntriesQuery,
    runtimeAdapters?: BuilderRuntimeAdapters,
  ): Promise<builderContract.ListBuilderViewEntriesResponse> {
    const list = await getRuntimeBuilderList(id);
    const tableName = getDefinitionTableName(list);

    await runTriggers(list.triggers, {
      event: "beforeRead",
      definition: list,
      query,
    });

    const result = await resolveAdapters(runtimeAdapters).listEntries({
      tableName,
      list,
      viewId: list.id,
      query,
    });

    await runTriggers(list.triggers, {
      event: "afterRead",
      definition: list,
      query,
    });
    return result;
  }

  async function createRuntimeBuilderFormEntry(
    id: string,
    input: builderContract.CreateBuilderViewEntryInput,
    runtimeAdapters?: BuilderRuntimeAdapters,
  ): Promise<RuntimeEntryMutationResult> {
    const form = await getRuntimeBuilderForm(id);
    assertRequiredFields(form, input.values);
    const tableName = getDefinitionTableName(form);

    await runTriggers(form.triggers, {
      event: "beforeCreate",
      definition: form,
      values: input.values,
    });

    const result = await resolveAdapters(runtimeAdapters).createEntry({
      tableName,
      form,
      viewId: form.id,
      values: input.values,
    });

    await runTriggers(form.triggers, {
      event: "afterCreate",
      definition: form,
      entryId: result.entry.id,
      values: result.entry.values,
    });
    return result;
  }

  async function listBuilderViewEntries(
    id: string,
    query: builderContract.ListBuilderViewEntriesQuery,
    permissions: readonly Permission[],
    runtimeAdapters?: BuilderRuntimeAdapters,
  ): Promise<builderContract.ListBuilderViewEntriesResponse> {
    const view = await getRuntimeBuilderView(id, permissions);
    const list = requireList(view);
    const tableName = getViewTableName(view);

    await runTriggers(list.triggers, {
      event: "beforeRead",
      definition: list,
      view,
      query,
    });

    const result = await resolveAdapters(runtimeAdapters).listEntries({
      tableName,
      list,
      viewId: view.id,
      query,
    });

    await runTriggers(list.triggers, {
      event: "afterRead",
      definition: list,
      view,
      query,
    });
    return result;
  }

  async function createBuilderViewEntry(
    id: string,
    input: builderContract.CreateBuilderViewEntryInput,
    permissions: readonly Permission[],
    runtimeAdapters?: BuilderRuntimeAdapters,
  ): Promise<RuntimeEntryMutationResult> {
    const view = await getRuntimeBuilderView(id, permissions);
    assertPermission(permissions, view.permissionWrite);
    const form = requireForm(view);
    assertRequiredFields(form, input.values);
    const tableName = getViewTableName(view);

    await runTriggers(form.triggers, {
      event: "beforeCreate",
      definition: form,
      view,
      values: input.values,
    });

    const result = await resolveAdapters(runtimeAdapters).createEntry({
      tableName,
      form,
      viewId: view.id,
      values: input.values,
    });

    await runTriggers(form.triggers, {
      event: "afterCreate",
      definition: form,
      view,
      entryId: result.entry.id,
      values: result.entry.values,
    });
    return result;
  }

  async function updateBuilderViewEntry(
    viewId: string,
    id: string,
    input: builderContract.UpdateBuilderViewEntryInput,
    permissions: readonly Permission[],
    runtimeAdapters?: BuilderRuntimeAdapters,
  ): Promise<RuntimeEntryMutationResult> {
    const view = await getRuntimeBuilderView(viewId, permissions);
    assertPermission(permissions, view.permissionWrite);
    const form = requireForm(view);
    assertRequiredFields(form, input.values);
    const tableName = getViewTableName(view);

    await runTriggers(form.triggers, {
      event: "beforeUpdate",
      definition: form,
      view,
      entryId: id,
      values: input.values,
    });

    const result = await resolveAdapters(runtimeAdapters).updateEntry({
      tableName,
      form,
      viewId: view.id,
      id,
      input,
    });

    await runTriggers(form.triggers, {
      event: "afterUpdate",
      definition: form,
      view,
      entryId: result.entry.id,
      values: result.entry.values,
    });
    return result;
  }

  async function deleteBuilderViewEntry(
    viewId: string,
    id: string,
    permissions: readonly Permission[],
    runtimeAdapters?: BuilderRuntimeAdapters,
  ): Promise<RuntimeEntryAudit> {
    const view = await getRuntimeBuilderView(viewId, permissions);
    assertPermission(permissions, view.permissionWrite);
    const list = requireList(view);
    const tableName = getViewTableName(view);

    await runTriggers(list.triggers, {
      event: "beforeDelete",
      definition: list,
      view,
      entryId: id,
    });

    const audit = await resolveAdapters(runtimeAdapters).deleteEntry({
      tableName,
      list,
      viewId: view.id,
      id,
    });

    await runTriggers(list.triggers, {
      event: "afterDelete",
      definition: list,
      view,
      entryId: id,
    });
    return audit;
  }

  return {
    createBuilderViewEntry,
    createRuntimeBuilderFormEntry,
    deleteBuilderViewEntry,
    getRuntimeBuilderForm,
    getRuntimeBuilderList,
    getRuntimeBuilderView,
    listBuilderViewEntries,
    listRuntimeBuilderFormFieldOptions,
    listRuntimeBuilderListEntries,
    runRuntimeBuilderFormFieldTrigger,
    runRuntimeBuilderViewFieldTrigger,
    updateBuilderViewEntry,
  };
}

export type BuilderRuntimeUseCases = ReturnType<typeof createBuilderRuntimeUseCases>;
