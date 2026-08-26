import { randomInt } from "node:crypto";

// Хүн уншиж, дуудаж, гараар бичих код тул ойлгомжгүй тэмдэгтүүдийг хассан:
// 0/O, 1/I, 8/B зэрэг андуурагдахгүй. Crockford Base32-тэй ойролцоо.
const ALPHABET = "ACDEFGHJKMNPQRTUVWXY34679";
const LENGTH = 8;

/**
 * QR-ийн "гүйлгээний утга"-д орох код.
 *
 * EMVCo-д аюулгүй: зөвхөн латин том үсэг, тоо — sanitize хийхэд өөрчлөгдөхгүй.
 * 26^8 орчим хувилбар; давхцвал DB-ийн unique алдаа өгнө, дуудагч тал дахин
 * оролдоно (`createPaymentReference` дотор).
 */
export function generateReference(): string {
  let out = "";
  for (let index = 0; index < LENGTH; index += 1) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

export const REFERENCE_PATTERN = new RegExp(`^[${ALPHABET}]{${LENGTH}}$`);
