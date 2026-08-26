import type { BuilderTriggerHandler } from "../triggerTypes";

// Audit үндсэндээ controller-level audit-аар аль хэдийн бичигдэж байгаа.
// Trigger pipeline-д audit action-ыг allowlist-д байлгахын тулд одоогоор no-op.
export const auditTriggerHandler: BuilderTriggerHandler = async () => {};
