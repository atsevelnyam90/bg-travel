import type { users } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const listUsers = (query: users.ListUsersQuery, signal?: AbortSignal) =>
  api.get<users.ListUsersResponse>("/users", { query, signal });
export const listRoles = (signal?: AbortSignal) =>
  api.get<users.Role[]>("/users/roles", { signal });
export const inviteUser = (input: users.InviteUserInput) =>
  api.post<users.InviteUserResponse>("/users/invite", input);
export const updateUser = (id: string, input: users.UpdateUserInput) =>
  api.patch<users.User>(`/users/${id}`, input);
export const disableUser = (id: string) => api.delete<void>(`/users/${id}`);
