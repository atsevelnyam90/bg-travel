import type { travels } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const listTravels = (query: travels.ListAdminTravelsQuery) =>
  api.get<travels.ListAdminTravelsResponse>("/travels", { query });
export const getTravel = (id: string) => api.get<travels.AdminTravel>(`/travels/${id}`);
export const createTravel = (input: travels.CreateAdminTravelInput) =>
  api.post<travels.AdminTravel>("/travels", input);
export const updateTravel = (id: string, input: travels.UpdateAdminTravelInput) =>
  api.patch<travels.AdminTravel>(`/travels/${id}`, input);
export const deleteTravel = (id: string) => api.delete<void>(`/travels/${id}`);
