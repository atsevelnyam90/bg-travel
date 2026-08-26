import {
  type BuilderTriggerContext,
  type BuilderTriggerHandler,
  createBuilderTriggerRunner,
} from "@winu/builder-backend/triggers";
import type { builder as builderContract } from "@winu/contracts";
import { logger } from "@/lib/logger";
import { getAppTriggerRoute, runAppTrigger } from "@/modules/appTriggers/registry";
import { builderBadRequest } from "../shared/builderErrors";

const callAppTriggerHandler: BuilderTriggerHandler = async (trigger, context) => {
  const route = getAppTriggerRoute(trigger.config);
  await runAppTrigger(route, context);
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
