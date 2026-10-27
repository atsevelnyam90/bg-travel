import type { users } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const listUsers = (query: users.ListUsersQuery) =>
  api.get<users.ListUsersResponse>("/users", { query });
export const listRoles = () => api.get<users.Role[]>("/users/roles");
export const inviteUser = (input: users.InviteUserInput) =>
  api.post<users.InviteUserResponse>("/users/invite", input);
export const updateUser = (id: string, input: users.UpdateUserInput) =>
  api.patch<users.User>(`/users/${id}`, input);
export const disableUser = (id: string) => api.delete<void>(`/users/${id}`);
