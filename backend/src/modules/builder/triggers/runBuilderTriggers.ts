import {
  type BuilderTriggerContext,
  createBuilderTriggerRunner,
} from "@winu/builder-backend/triggers";
import type { builder as builderContract } from "@winu/contracts";
import { logger } from "@/lib/logger";
import { builderBadRequest } from "../shared/builderErrors";

const appBuilderTriggerRunner = createBuilderTriggerRunner({
  logger,
  errors: {
    badRequest: builderBadRequest,
  },
});

export async function runBuilderTriggers(
  triggers: readonly builderContract.BuilderTrigger[],
  context: BuilderTriggerContext,
): Promise<void> {
  await appBuilderTriggerRunner(triggers, context);
}
