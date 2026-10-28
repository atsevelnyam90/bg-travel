// mn-integrations — winu-гээс гаргаж авсан Монголын интеграц багц.

import type { organization as orgContract } from "@winu/contracts";
import { banks, qr } from "@winu/mn-integrations";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { generateReference } from "./paymentReference";

const SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  bankCode: true,
  bankAccount: true,
  bankAccountName: true,
  version: true,
} as const;

/**
 * Байгууллага бол ГАНЦ МӨР (tenant биш, тохиргоо).
 * Бүх уншилт үүгээр — id-г хаанаас ч дамжуулахгүй.
 */
export async function getOrganization(): Promise<orgContract.Organization> {
  const org = await prisma.organization.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: SELECT,
  });
  if (!org) throw notFound("Байгууллага тохируулаагүй байна. `pnpm db:seed` ажиллуулна уу.");
  return org;
}

export async function updateOrganization(
  input: orgContract.UpdateOrganizationInput,
): Promise<orgContract.Organization> {
  // Банкны кодыг жагсаалттай тулгана — буруу код QR-ыг чимээгүй эвдэнэ.
  if (input.bankCode && !banks.findBankByCode(input.bankCode)) {
    throw badRequest("Банкны код буруу байна");
  }

  const current = await getOrganization();

  const result = await prisma.organization.updateMany({
    where: { id: current.id, version: input.version },
    data: {
      name: input.name,
      logoUrl: input.logoUrl ?? null,
      bankCode: input.bankCode ?? null,
      bankAccount: input.bankAccount ?? null,
      bankAccountName: input.bankAccountName ?? null,
      version: { increment: 1 },
    },
  });
  if (result.count === 0) {
    throw conflict("Тохиргоог өөр хэрэглэгч зэрэг заслаа. Дахин ачаална уу.");
  }
  return prisma.organization.findFirstOrThrow({ where: { id: current.id }, select: SELECT });
}

/** Монголбанкны оролцогч банкууд — сонгох жагсаалтад. */
export function listBanks(): orgContract.Bank[] {
  return banks.MN_BANKS;
}

const REFERENCE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Барааны үнээр EMVCo төлбөрийн QR үүсгэнэ.
 *
 * `buildEmvcoQr` нь winu-backend-ээс зөөгдсөн — банкны аппууд уншдаг стандарт
 * формат. Кирилл нэрийг өөрөө латинчилж, урт нь хэтэрвэл тайрдаг.
 *
 * ⚠️ ХЯЗГААР: энэ нь мөнгийг заасан данс руу очих ЗААВАР л мөн. Төлбөр
 * орсныг систем МЭДЭХГҮЙ — webhook ч, хуулга тулгах ч хэрэгжээгүй.
 * Тиймээс "гүйлгээний утга"-д давтагдашгүй лавлагаа тавьж, хожим гараар
 * эсвэл автоматаар тулгах боломжтой болгож байна. Барааны нэр тавьвал
 * хоёр худалдан авагчийг ялгах боломжгүй.
 */
export async function buildProductPaymentQr(productId: string): Promise<orgContract.PaymentQr> {
  const [org, product] = await Promise.all([
    getOrganization(),
    prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { name: true, priceMinor: true, currency: true },
    }),
  ]);

  if (!product) throw notFound("Бараа олдсонгүй");

  if (!org.bankAccount || !org.bankCode) {
    throw badRequest("Эхлээд тохиргоо хэсэгт банкны данс бүртгүүлнэ үү");
  }

  const bank = banks.findBankByCode(org.bankCode);
  if (!bank) throw badRequest("Банкны код буруу байна");

  const reference = await createReference(productId, product.priceMinor, product.currency);

  const payload = qr.buildEmvcoQr({
    accountNumber: org.bankAccount,
    accountName: org.bankAccountName ?? org.name,
    // EMVCo дүнг үндсэн нэгжээр (₮) хүлээж авдаг, бид minor-оор хадгалдаг.
    amount: product.priceMinor / 100,
    currency: product.currency,
    // Барааны нэр БИШ — давтагдашгүй лавлагаа. Тулгалт үүн дээр тогтоно.
    purpose: reference,
    bankId: bank.bic,
    merchantCategoryCode: "5999",
    transactionType: "03",
  });

  return {
    payload,
    reference,
    amountMinor: product.priceMinor,
    currency: product.currency,
    bankName: bank.name,
  };
}

/** Давхцвал дахин оролдоно — DB-ийн unique хязгаар эцсийн шүүлтүүр. */
async function createReference(
  productId: string,
  amountMinor: number,
  currency: string,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = generateReference();
    try {
      await prisma.paymentReference.create({
        data: {
          reference,
          productId,
          amountMinor,
          currency,
          expiresAt: new Date(Date.now() + REFERENCE_TTL_MS),
        },
      });
      return reference;
    } catch {
      // Unique зөрчил — дахин үүсгэнэ.
    }
  }
  throw badRequest("Лавлагаа үүсгэж чадсангүй, дахин оролдоно уу");
}
