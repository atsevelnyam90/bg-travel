import type { BuilderTriggerHandler } from "../triggerTypes";

// Дурын URL/backend route дуудахыг шууд нээхгүй. Дараагийн шатанд allowlist
// endpoint registry нэмээд эндээс зөвшөөрөгдсөн action-уудыг дуудна.
export const callApiTriggerHandler: BuilderTriggerHandler = async (trigger, _context, deps) => {
  if (trigger.enabled) {
    throw deps.errors.badRequest(
      "callApi trigger handler allowlist хараахан тохируулагдаагүй байна",
    );
  }
};
