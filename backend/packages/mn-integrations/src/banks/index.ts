/**
 * Mongolian bank participants — source: Bank of Mongolia Participants List (2024-04-17)
 * https://www.mongolbank.mn/file/977ff330d9f5596c7c3c80637d147b86/files/Participants_List_20240417.pdf
 *
 * Each entry contains:
 *   - code: Bank of Mongolia participant code (used as `to_bank` in KHAN CGW interbank transfer)
 *   - bic:  SWIFT/BIC code (required as `to_bank_bic` for KHAN CGW interbank transfer)
 *   - name: Human-readable Mongolian/English name
 *
 * `code` нь KHAN CGW `to_bank` field-руу, `bic` нь `to_bank_bic` field-руу шууд ордог.
 * Бид payout_destinations.bankCode + bankBic-руу хадгалж interbank transfer үед хэрэглэнэ.
 */

export interface MongolianBank {
  code: string;
  bic: string;
  name: string;
  nameEn: string;
}

export const MN_BANKS: MongolianBank[] = [
  { code: "050000", bic: "AGMOMNUB", name: "Хаан банк", nameEn: "Khan Bank" },
  {
    code: "040000",
    bic: "TDBMMNUB",
    name: "Худалдаа хөгжлийн банк",
    nameEn: "Trade and Development Bank",
  },
  { code: "340000", bic: "STBMMNUB", name: "Төрийн банк", nameEn: "State Bank" },
  { code: "150000", bic: "GLMTMNUB", name: "Голомт банк", nameEn: "Golomt Bank" },
  { code: "210000", bic: "ARGBMNUB", name: "Ариг банк", nameEn: "Arig Bank" },
  { code: "300000", bic: "CPITMNUB", name: "Капитрон банк", nameEn: "Capitron Bank" },
  { code: "320000", bic: "CAXBMNUB", name: "Хас банк", nameEn: "XacBank" },
  { code: "380000", bic: "BOGDMNUB", name: "Богд банк", nameEn: "Bogd Bank" },
  { code: "390000", bic: "MBNKMNUB", name: "М банк", nameEn: "M Bank" },
  { code: "330000", bic: "CHKHMNUB", name: "Чингис Хаан банк", nameEn: "Chinggis Khaan Bank" },
  {
    code: "190000",
    bic: "TRDMMNUB",
    name: "Тээвэр хөгжлийн банк",
    nameEn: "Transport and Development Bank",
  },
  {
    code: "290000",
    bic: "NAIMMNUB",
    name: "Үндэсний хөрөнгө оруулалтын банк",
    nameEn: "National Investment Bank",
  },
];

/**
 * Банкны нэрийг идэвхтэй хэлээр буцаана. mn-ээс өөр хэлэнд nameEn-г ашиглана.
 * Хадгалах утга (bankForm.bankName) нь үргэлж монгол `name` хэвээр үлдэнэ —
 * энэ нь зөвхөн дэлгэцэнд харуулах нэр.
 */
export function getBankDisplayName(
  bank: { name: string; nameEn?: string },
  language: string | undefined,
): string {
  const base = (language || "mn").split("-")[0];
  return base === "mn" ? bank.name : bank.nameEn || bank.name;
}

export function findBankByCode(code: string): MongolianBank | undefined {
  return MN_BANKS.find((b) => b.code === code);
}

export function findBankByBic(bic: string): MongolianBank | undefined {
  return MN_BANKS.find((b) => b.bic === bic);
}
