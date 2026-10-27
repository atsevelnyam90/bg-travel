import type { orders, travels } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const listPublicTravels = (locale: travels.PublicTravelLocale) =>
  api.get<travels.ListPublicTravelsResponse>(`/public/travels?locale=${locale}`);

export const getPublicTravel = (slug: string, locale: travels.PublicTravelLocale) =>
  api.get<travels.GetPublicTravelResponse>(
    `/public/travels/${encodeURIComponent(slug)}?locale=${locale}`,
  );

export const getPublicPaymentInfo = () => api.get<orders.PublicPaymentInfo>("/public/payment-info");

export const createPublicOrder = (input: orders.CreatePublicOrderInput) =>
  api.post<orders.PublicOrder>("/public/orders", input);
