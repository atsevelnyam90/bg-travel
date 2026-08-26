import { z } from "zod";
import { PERMISSIONS } from "./permissions";

export const loginSchema = z.object({
  email: z.email("И-мэйл буруу байна"),
  password: z.string().min(1, "Нууц үгээ оруулна уу"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const meSchema = z.object({
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    name: z.string(),
  }),
  organization: z
    .object({
      id: z.uuid(),
      name: z.string(),
      slug: z.string(),
    })
    .nullable(),
  role: z.object({ id: z.uuid(), name: z.string() }).nullable(),
  permissions: z.array(z.enum(PERMISSIONS)),
});
export type Me = z.infer<typeof meSchema>;

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1, "Нэр оруулна уу"),
  password: z.string().min(8, "Нууц үг дор хаяж 8 тэмдэгт"),
});
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
