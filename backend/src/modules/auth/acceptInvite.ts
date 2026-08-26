import { createHash } from "node:crypto";
import type { auth as authContract } from "@winu/contracts";
import { badRequest } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "./passwordService";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Урилга хүлээн авч нууц үгээ тохируулна.
 *
 * Токен нь DB-д зөвхөн hash-аар хадгалагддаг (refresh token-той ижил зарчим),
 * тиймээс энд хайхдаа hash-аар хайна.
 *
 * Алдааны мессежийг НЭГ ижил байлгана — "олдсонгүй", "хугацаа дууссан",
 * "аль хэдийн ашигласан" гэж ялгавал токен тааж шалгах боломж нээгдэнэ.
 */
export async function acceptInvite(input: authContract.AcceptInviteInput): Promise<void> {
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashToken(input.token) },
    select: { id: true, email: true, roleId: true, expiresAt: true, acceptedAt: true },
  });

  const invalid = () => badRequest("Урилга хүчингүй эсвэл хугацаа нь дууссан байна");

  if (!invitation) throw invalid();
  if (invitation.acceptedAt) throw invalid();
  if (invitation.expiresAt.getTime() <= Date.now()) throw invalid();

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: invitation.email },
      data: {
        name: input.name,
        passwordHash,
        status: "ACTIVE",
        roleId: invitation.roleId,
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
    // Тухайн и-мэйлийн бусад хүлээгдэж буй урилгыг хаана.
    prisma.invitation.updateMany({
      where: { email: invitation.email, acceptedAt: null },
      data: { acceptedAt: new Date() },
    }),
  ]);
}
