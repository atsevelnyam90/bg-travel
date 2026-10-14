import type { BuilderFieldTriggerContext } from "@duke333/builder-backend/usecases";
import type { builder as builderContract } from "@duke333/builder-contracts";
import { runAppFieldTrigger } from "@/modules/appTriggers/fieldRegistry";

export async function runBuilderFieldTrigger(
  context: BuilderFieldTriggerContext,
): Promise<builderContract.BuilderFieldTriggerResponse> {
  return runAppFieldTrigger(context);
}
