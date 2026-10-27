import { z } from "zod";
import { paginatedSchema, paginationQuerySchema } from "./shared";

export const userStatusSchema = z.enum(["ACTIVE", "INVITED", "DISABLED"]);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  status: userStatusSchema,
  roleId: z.uuid().nullable(),
  version: z.number().int().min(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type User = z.infer<typeof userSchema>;

export const listUsersQuerySchema = paginationQuerySchema.extend({
  status: userStatusSchema.optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const listUsersResponseSchema = paginatedSchema(userSchema);
export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;

export const inviteUserSchema = z.object({
  email: z.email("И-мэйл буруу байна"),
  name: z.string().min(1, "Нэр оруулна уу"),
  roleId: z.uuid(),
});
export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const roleSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  permissionCount: z.number().int(),
});
export type Role = z.infer<typeof roleSchema>;

export const listRolesResponseSchema = z.array(roleSchema);
export type ListRolesResponse = z.infer<typeof listRolesResponseSchema>;

export const inviteUserResponseSchema = z.object({
  user: userSchema,
  /**
   * Урилга үүссэн ч и-мэйл явсангүй. Токеныг хариунд БУЦААХГҮЙ —
   * зөвхөн и-мэйлээр. UI нь дахин илгээх санал болгоно.
   */
  mailFailed: z.boolean(),
});
export type InviteUserResponse = z.infer<typeof inviteUserResponseSchema>;

export const updateUserSchema = z.object({
  email: z.email("И-мэйл буруу байна"),
  name: z.string().trim().min(1, "Нэр оруулна уу").max(160),
  status: userStatusSchema,
  roleId: z.uuid().nullable(),
  version: z.number().int().min(0),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
