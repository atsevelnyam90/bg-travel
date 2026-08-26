import { prisma } from "@/lib/prisma";

/**
 * Баримтын дугаар үүсгэгч.
 *
 * ⚠️ `count() + 1` ашиглаж БОЛОХГҮЙ:
 *   - Хоёр хүсэлт зэрэг ирвэл ижил дугаар авна
 *   - Мөр устгагдвал дугаар давтагдана
 *   - Зөөлөн устгалтай бол тоолол буруу
 *
 * Энд `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` — Postgres нэг мөрийг
 * атомарт өсгөнө. Түгжээ, транзакц, дахин оролдлого шаардахгүй.
 */
export type SequencePeriod = "yearly" | "monthly" | "never";

export type DocumentNumberOptions = {
  /** Дарааллын нэр: "invoice", "order", "receipt" */
  name: string;
  /** Угтвар: "INV" → INV-2026-000001 */
  prefix: string;
  /** Дугаар хэзээ 1-ээс эхлэх вэ. Default: жил бүр. */
  period?: SequencePeriod;
  /** Дараалсан хэсгийн урт. Default 6 → 000001 */
  padding?: number;
  at?: Date;
};

function periodKey(period: SequencePeriod, at: Date): string {
  if (period === "never") return "";
  const year = at.getUTCFullYear();
  if (period === "yearly") return String(year);
  return `${year}-${String(at.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function nextDocumentNumber(options: DocumentNumberOptions): Promise<string> {
  const { name, prefix, period = "yearly", padding = 6, at = new Date() } = options;
  const key = periodKey(period, at);

  const rows = await prisma.$queryRaw<Array<{ counter: number }>>`
    INSERT INTO document_sequences (name, period, counter)
    VALUES (${name}, ${key}, 1)
    ON CONFLICT (name, period)
    DO UPDATE SET counter = document_sequences.counter + 1
    RETURNING counter
  `;

  const counter = rows[0]?.counter ?? 1;
  const serial = String(counter).padStart(padding, "0");

  return key ? `${prefix}-${key}-${serial}` : `${prefix}-${serial}`;
}
