import type { orders } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const listOrders = (query: orders.ListAdminOrdersQuery, signal?: AbortSignal) =>
  api.get<orders.ListAdminOrdersResponse>("/orders", { query, signal });

export const listOrderDepartureOptions = (signal?: AbortSignal) =>
  api.get<orders.ListAdminOrderDepartureOptionsResponse>("/orders/departure-options", { signal });

export const getOrderDashboard = (days: orders.OrderDashboard["days"], signal?: AbortSignal) =>
  api.get<orders.OrderDashboard>("/orders/dashboard", { query: { days }, signal });

export const createOrder = (input: orders.CreateAdminOrderInput) =>
  api.post<orders.AdminOrder>("/orders", input);

export const updateOrder = (id: string, input: orders.UpdateAdminOrderInput) =>
  api.patch<orders.AdminOrder>(`/orders/${id}`, input);

export const confirmOrder = (id: string, input: orders.ConfirmAdminOrderInput) =>
  api.post<orders.AdminOrder>(`/orders/${id}/confirm`, input);

export const deleteOrder = (id: string) => api.delete<void>(`/orders/${id}`);
