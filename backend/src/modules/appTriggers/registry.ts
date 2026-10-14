import type {
  BuilderTriggerContext,
  BuilderTriggerResult,
} from "@duke333/builder-backend/triggers";
import { badRequest } from "@/lib/errors";
import { confirmPaidOrderTrigger, ORDER_CONFIRM_PAID_TRIGGER } from "@/modules/orders/triggers";
import {
  testUserBeforeDeleteTrigger,
  USER_TEST_BEFORE_DELETE_TRIGGER,
} from "@/modules/users/triggers";

type AppTriggerHandler = (
  context: BuilderTriggerContext,
) => Promise<BuilderTriggerResult | undefined>;

const appTriggerHandlers: Record<string, AppTriggerHandler> = {
  [ORDER_CONFIRM_PAID_TRIGGER]: confirmPaidOrderTrigger,
  [USER_TEST_BEFORE_DELETE_TRIGGER]: async (context) => {
    await testUserBeforeDeleteTrigger(context);
    return undefined;
  },
};

export function getAppTriggerRoute(config: Record<string, unknown>): string {
  const route = config.route ?? config.path ?? config.url;
  if (typeof route !== "string" || route.trim().length === 0) {
    throw badRequest("Builder trigger route тохируулаагүй байна");
  }
  return route;
}

export async function runAppTrigger(
  route: string,
  context: BuilderTriggerContext,
): Promise<BuilderTriggerResult | undefined> {
  const handler = appTriggerHandlers[route];
  if (!handler) {
    throw badRequest(`Builder trigger route бүртгэлгүй байна: ${route}`);
  }
  return handler(context);
}
