import { createHash, randomBytes } from "node:crypto";
import type { users as usersContract } from "@winu/contracts";
import { badRequest, notFound } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sendMail } from "@/lib/mail/mailer";
import { inviteEmail } from "@/lib/mail/templates";
import { prisma } from "@/lib/prisma";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type InviteResult = {
  user: usersContract.User;
  /** И-мэйл амжилттай яваагүй бол true — UI-д анхааруулга харуулна. */
  mailFailed: boolean;
};

export async function inviteUser(
  input: usersContract.InviteUserInput,
  inviterName: string,
): Promise<InviteResult> {
  const email = input.email.toLowerCase();

  const role = await prisma.role.findUnique({
    where: { id: input.roleId },
    select: { id: true },
  });
  if (!role) throw notFound("Role олдсонгүй");

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, deletedAt: true },
  });

  if (existing && !existing.deletedAt) {
    throw badRequest("Энэ и-мэйл аль хэдийн бүртгэлтэй байна");
  }

  // Refresh token-той ижил зарчим: түүхий токен хадгалагдахгүй.
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.upsert({
      where: { email },
      update: { name: input.name, status: "INVITED", roleId: input.roleId, deletedAt: null },
      create: { email, name: input.name, status: "INVITED", roleId: input.roleId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.invitation.create({
      data: {
        email,
        roleId: input.roleId,
        tokenHash,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
    });

    return created;
  });

  // И-мэйл явахгүй байлаа ч урилга үүссэн — үйлдлийг унагахгүй, тэмдэглэнэ.
  let mailFailed = false;
  try {
    const organization = await prisma.organization.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { name: true },
    });

    await sendMail(
      inviteEmail({
        to: email,
        inviterName,
        organizationName: organization?.name ?? "Байгууллага",
        token,
      }),
    );
  } catch (error) {
    mailFailed = true;
    logger.error({ err: error, email }, "Урилгын и-мэйл илгээгдсэнгүй");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roleId: input.roleId,
      version: user.version,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    mailFailed,
  };
}
