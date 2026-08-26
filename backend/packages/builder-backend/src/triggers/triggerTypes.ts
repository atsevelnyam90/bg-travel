import type { builder as builderContract } from "@winu/contracts";

export type BuilderTriggerAction = builderContract.BuilderTrigger["action"];

export type BuilderTriggerContext = {
  event: builderContract.BuilderTriggerEvent;
  definition: builderContract.BuilderForm | builderContract.BuilderList;
  view?: builderContract.BuilderView;
  actorId?: string;
  entryId?: string;
  values?: Record<string, unknown>;
  beforeValues?: Record<string, unknown>;
  query?: builderContract.ListBuilderViewEntriesQuery;
};

export type BuilderTriggerLogPayload = {
  err: unknown;
  event: builderContract.BuilderTriggerEvent;
  action: BuilderTriggerAction;
  definitionId: string;
  viewId?: string;
};

export type BuilderTriggerLogger = {
  warn: (payload: BuilderTriggerLogPayload, message: string) => void;
};

export type BuilderTriggerErrors = {
  badRequest: (message: string, details?: unknown) => Error;
};

export type BuilderTriggerRuntimeDependencies = {
  logger: BuilderTriggerLogger;
  errors: BuilderTriggerErrors;
};

export type BuilderTriggerHandler = (
  trigger: builderContract.BuilderTrigger,
  context: BuilderTriggerContext,
  deps: BuilderTriggerRuntimeDependencies,
) => Promise<void>;

export type BuilderTriggerHandlerRegistry = Record<BuilderTriggerAction, BuilderTriggerHandler>;
