import type { BuilderTriggerContext } from "@duke333/builder-backend/triggers";
import { badRequest } from "@/lib/errors";

export const USER_TEST_BEFORE_DELETE_TRIGGER = "/api/v1/users/triggers/test-before-delete";

export async function testUserBeforeDeleteTrigger(context: BuilderTriggerContext): Promise<void> {
  throw badRequest(
    `User beforeDelete trigger test алдаа: ${context.entryId ?? "unknown"} мөрийг устгахыг зогсоолоо`,
  );
}
