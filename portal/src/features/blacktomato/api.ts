import type { orders, travels } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const listPublicTravels = () =>
  api.get<travels.ListPublicTravelsResponse>("/public/travels");

export const getPublicTravel = (slug: string) =>
  api.get<travels.GetPublicTravelResponse>(`/public/travels/${encodeURIComponent(slug)}`);

export const getPublicPaymentInfo = () => api.get<orders.PublicPaymentInfo>("/public/payment-info");

export const createPublicOrder = (input: orders.CreatePublicOrderInput) =>
  api.post<orders.PublicOrder>("/public/orders", input);
