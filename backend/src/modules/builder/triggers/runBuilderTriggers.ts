import {
  type BuilderTriggerContext,
  type BuilderTriggerHandler,
  createBuilderTriggerRunner,
} from "@duke333/builder-backend/triggers";
import type { builder as builderContract } from "@duke333/builder-contracts";
import { logger } from "@/lib/logger";
import { getAppTriggerRoute, runAppTrigger } from "@/modules/appTriggers/registry";
import { builderBadRequest } from "../shared/builderErrors";

const callAppTriggerHandler: BuilderTriggerHandler = async (trigger, context) => {
  const route = getAppTriggerRoute(trigger.config);
  return runAppTrigger(route, context);
};

const appBuilderTriggerRunner = createBuilderTriggerRunner(
  {
    logger,
    errors: {
      badRequest: builderBadRequest,
    },
  },
  {
    handlers: {
      callApi: callAppTriggerHandler,
    },
  },
);

export async function runBuilderTriggers(
  triggers: readonly builderContract.BuilderTrigger[],
  context: BuilderTriggerContext,
): Promise<void> {
  await appBuilderTriggerRunner(triggers, context);
}
