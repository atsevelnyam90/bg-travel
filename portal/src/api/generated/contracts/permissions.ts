// ⚠️ АВТОМАТААР ҮҮССЭН ФАЙЛ — ГАРААР БҮҮ ЗАС.
// Эх сурвалж: backend/packages/contracts/src
// Дахин үүсгэх: pnpm gen:contracts
// Эрхийн ГАНЦ жагсаалт — backend болон portal хоёулаа эндээс уншина.
//
// winu-гийн загварыг аваагүй шалтгаан (05-permissions.md §1):
//   домэйны түлхүүр код дотор хатуу, түвшин ердөө NONE/WATCH/EDIT,
//   role код дотор, эрх ба багцын эрх хутгалдсан.
export const PERMISSIONS = [
  "user:read",
  "user:invite",
  "user:update",
  "user:disable",

  "role:read",
  "role:manage",

  "org:read",
  "org:manage",

  "audit:read",

  "product:read",
  "product:write",
  "product:delete",

  "order:read",
  "order:write",
  "order:delete",

  "report:read",
  "report:export",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

// Системийн default role-ууд. Клиент дээрээс өөрийн role нэмнэ (DB мөр).
export const SYSTEM_ROLES = {
  owner: [...PERMISSIONS],
  admin: [
    "product:read",
    "product:write",
    "product:delete",
    "order:read",
    "order:write",
    "order:delete",
    "user:read",
    "user:invite",
    "user:update",
    "user:disable",
    "role:read",
    "role:manage",
    "org:read",
    "org:manage",
    "audit:read",
    "report:read",
    "report:export",
  ],
  member: ["product:read", "product:write", "order:read", "user:read", "org:read", "report:read"],
  viewer: ["product:read", "order:read", "user:read", "org:read"],
} as const satisfies Record<string, readonly Permission[]>;

export type SystemRoleName = keyof typeof SYSTEM_ROLES;
