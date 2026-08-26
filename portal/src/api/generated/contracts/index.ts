// ⚠️ АВТОМАТААР ҮҮССЭН ФАЙЛ — ГАРААР БҮҮ ЗАС.
// Эх сурвалж: backend/packages/contracts/src
// Дахин үүсгэх: pnpm gen:contracts
// API contract — frontend болон backend ХОЁУЛАА эндээс уншина.
//
// winu-гийн хамгийн том бүтцийн сул тал нь хоёр repo хооронд compile-time
// шалгалт байхгүй байсан явдал: portal дээр 26 DTO файл гараар хуулагдсан,
// backend enum өөрчлөгдвөл зөвхөн runtime-д мэдэгддэг байсан.
//
// Энд schema нэг л удаа бичигдэнэ:
//   backend  → validation (schema.parse)
//   frontend → type (z.infer)

export * as audit from "./audit";
export * as auth from "./auth";
export * as builder from "./builder";
export * as files from "./files";
export * as money from "./money";
export * as organization from "./organization";
export {
  isPermission,
  PERMISSIONS,
  type Permission,
  SYSTEM_ROLES,
  type SystemRoleName,
} from "./permissions";
export * as products from "./products";
export { type Paginated, paginatedSchema, paginationQuerySchema } from "./shared";
export * as users from "./users";
