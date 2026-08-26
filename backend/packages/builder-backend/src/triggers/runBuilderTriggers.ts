import type { builder as builderContract } from "@winu/contracts";
import { auditTriggerHandler, callApiTriggerHandler, validateTriggerHandler } from "./handlers";
import type {
  BuilderTriggerContext,
  BuilderTriggerHandlerRegistry,
  BuilderTriggerRuntimeDependencies,
} from "./triggerTypes";

const defaultHandlers = {
  audit: auditTriggerHandler,
  callApi: callApiTriggerHandler,
  validate: validateTriggerHandler,
  notify: async () => {},
  webhook: async () => {},
} satisfies BuilderTriggerHandlerRegistry;

export type BuilderTriggerRunnerOptions = {
  handlers?: Partial<BuilderTriggerHandlerRegistry>;
};

export function createBuilderTriggerRunner(
  deps: BuilderTriggerRuntimeDependencies,
  options: BuilderTriggerRunnerOptions = {},
) {
  const handlers = { ...defaultHandlers, ...options.handlers };

  return async function runBuilderTriggers(
    triggers: readonly builderContract.BuilderTrigger[],
    context: BuilderTriggerContext,
  ): Promise<void> {
    for (const trigger of triggers) {
      if (!trigger.enabled || trigger.event !== context.event) continue;

      try {
        await handlers[trigger.action](trigger, context, deps);
      } catch (error) {
        if (trigger.blocking) throw error;
        deps.logger.warn(
          {
            err: error,
            event: context.event,
            action: trigger.action,
            definitionId: context.definition.id,
            viewId: context.view?.id,
          },
          "Non-blocking builder trigger failed",
        );
      }
    }
  };
}
