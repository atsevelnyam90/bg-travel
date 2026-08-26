// Эрхийн жагсаалтын ЭЗЭН нь backend (backend/packages/contracts/src/permissions.ts).
// Энд дахин бичихгүй — эс тэгвэл winu дээрх DTO давхардлын асуудал эргэж ирнэ.
//
// Шинэчлэх: backend-д contract зассны дараа `pnpm gen:contracts`.
export { isPermission, PERMISSIONS, type Permission } from "@/api/generated/contracts/permissions";

import type { Permission } from "@/api/generated/contracts/permissions";

/**
 * Цэвэр функц — React-аас хамааралгүй тул тестлэхэд амархан.
 *
 * ⚠️ Энэ бол ХАРАГДАЦ. Backend талд `requirePermission()` үргэлж заавал
 * (05-permissions.md §3).
 */
export function hasPermission(granted: readonly Permission[], permission: Permission): boolean {
  return granted.includes(permission);
}

export function hasEvery(granted: readonly Permission[], permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(granted, permission));
}

export function hasSome(granted: readonly Permission[], permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(granted, permission));
}
