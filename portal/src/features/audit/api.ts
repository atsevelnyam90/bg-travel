import type { audit } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const listAudit = (query: audit.ListAuditQuery) =>
  api.get<audit.ListAuditResponse>("/audit", { query });
