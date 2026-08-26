import type { organization } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const getOrganization = () => api.get<organization.Organization>("/org");

export const updateOrganization = (input: organization.UpdateOrganizationInput) =>
  api.patch<organization.Organization>("/org", input);

/** Монголбанкны оролцогч банкууд — сервер талын mn-integrations/banks-аас. */
export const listBanks = () => api.get<organization.Bank[]>("/org/banks");

export const buildPaymentQr = (productId: string) =>
  api.post<organization.PaymentQr>(`/org/payment-qr/${productId}`);
