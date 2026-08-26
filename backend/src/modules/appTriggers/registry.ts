import type { BuilderTriggerContext } from "@winu/builder-backend/triggers";
import { badRequest } from "@/lib/errors";
import {
  testUserBeforeDeleteTrigger,
  USER_TEST_BEFORE_DELETE_TRIGGER,
} from "@/modules/users/triggers";

type AppTriggerHandler = (context: BuilderTriggerContext) => Promise<void>;

const appTriggerHandlers: Record<string, AppTriggerHandler> = {
  [USER_TEST_BEFORE_DELETE_TRIGGER]: testUserBeforeDeleteTrigger,
};

export function getAppTriggerRoute(config: Record<string, unknown>): string {
  const route = config.route ?? config.path ?? config.url;
  if (typeof route !== "string" || route.trim().length === 0) {
    throw badRequest("Builder trigger route тохируулаагүй байна");
  }
  return route;
}

export async function runAppTrigger(route: string, context: BuilderTriggerContext): Promise<void> {
  const handler = appTriggerHandlers[route];
  if (!handler) {
    throw badRequest(`Builder trigger route бүртгэлгүй байна: ${route}`);
  }
  await handler(context);
}
