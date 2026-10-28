import type { travels } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const listTravels = (query: travels.ListAdminTravelsQuery, signal?: AbortSignal) =>
  api.get<travels.ListAdminTravelsResponse>("/travels", { query, signal });
export const getTravel = (id: string, signal?: AbortSignal) =>
  api.get<travels.AdminTravel>(`/travels/${id}`, { signal });
export const createTravel = (input: travels.CreateAdminTravelInput) =>
  api.post<travels.AdminTravel>("/travels", input);
export const updateTravel = (id: string, input: travels.UpdateAdminTravelInput) =>
  api.patch<travels.AdminTravel>(`/travels/${id}`, input);
export const deleteTravel = (id: string) => api.delete<void>(`/travels/${id}`);
