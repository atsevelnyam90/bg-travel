import type { BuilderFieldTriggerContext } from "@winu/builder-backend/usecases";
import type { builder as builderContract } from "@winu/contracts";
import { runAppFieldTrigger } from "@/modules/appTriggers/fieldRegistry";

export async function runBuilderFieldTrigger(
  context: BuilderFieldTriggerContext,
): Promise<builderContract.BuilderFieldTriggerResponse> {
  return runAppFieldTrigger(context);
}
