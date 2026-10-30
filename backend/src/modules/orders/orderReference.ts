import { randomUUID } from "node:crypto";

/**
 * Банкны гүйлгээний утгад ашиглах богино, давтагдашгүй захиалгын код.
 * DB sequence ашиглахгүй тул захиалга үүсэхээс өмнө тусдаа write/commit хийхгүй.
 */
export function createOrderReference(): string {
  return `ORD-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
}
