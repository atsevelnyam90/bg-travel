/**
 * Мөнгөний конвенц.
 *
 * ⚠️ ДҮРЭМ 1 — Мөнгийг ЗӨВХӨН бүхэл тоогоор, хамгийн жижиг нэгжээр.
 * MNT-ийн хувьд мөнгө (1₮ = 100 мөнгө). Float ашиглавал `0.1 + 0.2 !== 0.3`
 * маягийн алдаа мөнгөнд хүрч, тайлан таарахаа болино.
 *
 * ⚠️ ДҮРЭМ 2 — Хуваалт бүрд дугуйруулна. Дугуйруулалтыг НЭГ газар барих
 * зорилготой энэ модуль. Дэлгэц бүрд `Math.round` бичих нь зөрүү үүсгэнэ.
 */

/** Хамгийн жижиг нэгж (мөнгө, cent). Бүхэл тоо. */
export type Minor = number;

export const MINOR_PER_UNIT = 100;

/**
 * Хагасыг дээш дугуйруулна (0.5 → 1).
 *
 * JS-ийн `Math.round` нь сөрөг тоонд тэгш бус ажилладаг:
 * `Math.round(-0.5) === -0` буюу дээш. Буцаалт, хөнгөлөлт зэрэг сөрөг дүн
 * гарах тул тэгш хэмтэй байлгана.
 */
export function roundHalfUp(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

// ─── НӨАТ ───────────────────────────────────────────────────────────────────
// Монголын НӨАТ 10%. Үнэ ихэвчлэн НӨАТ-ТАЙ зарлагддаг тул задлах хэрэгцээ
// түгээмэл.
//
// ⚠️ Тухайн клиентийн салбарт хувь өөр байж болно (0%, чөлөөлөгдсөн).
// Мөн e-Barimt-д илгээхийн өмнө дугуйруулалт нь татварын шаардлагад
// нийцэж байгааг ЗААВАЛ баталгаажуул — энд байгаа нь ерөнхий дүрэм.

export const VAT_RATE_PERCENT = 10;

/** НӨАТ-гүй дүн дээр нэмнэ. */
export function addVat(
  netMinor: Minor,
  ratePercent = VAT_RATE_PERCENT,
): {
  net: Minor;
  vat: Minor;
  gross: Minor;
} {
  const vat = roundHalfUp((netMinor * ratePercent) / 100);
  return { net: netMinor, vat, gross: netMinor + vat };
}

/**
 * НӨАТ-ТАЙ дүнгээс задална.
 *
 * НӨАТ = gross × rate / (100 + rate). Дугуйруулсны дараа net-ийг ХАСАЖ
 * гаргана — эс тэгвэл net + vat нь gross-той таарахгүй болно.
 */
export function extractVat(
  grossMinor: Minor,
  ratePercent = VAT_RATE_PERCENT,
): {
  net: Minor;
  vat: Minor;
  gross: Minor;
} {
  const vat = roundHalfUp((grossMinor * ratePercent) / (100 + ratePercent));
  return { net: grossMinor - vat, vat, gross: grossMinor };
}

// ─── Хувь, хөнгөлөлт ────────────────────────────────────────────────────────

export function applyPercent(amountMinor: Minor, percent: number): Minor {
  return roundHalfUp((amountMinor * percent) / 100);
}

export function multiplyMinor(unitMinor: Minor, quantity: number): Minor {
  const total = unitMinor * quantity;
  if (!Number.isSafeInteger(total)) {
    throw new RangeError("Мөнгөн дүн боловсруулах хэмжээнээс хэтэрсэн байна");
  }
  return total;
}

/**
 * Нийт дүнг хэсгүүдэд ХУВААРИЛНА (хөнгөлөлт, хүргэлтийн зардал г.м).
 *
 * Энгийн хуваалт дугуйруулалтын улмаас нийлбэрийг зөрүүлдэг. Энэ функц
 * үлдэгдлийг эхний хэсгүүдэд тарааж, нийлбэр нь ЯГ таарахыг баталгаажуулна.
 */
export function distribute(totalMinor: Minor, weights: number[]): Minor[] {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum === 0) return weights.map(() => 0);

  const shares = weights.map((weight) => Math.floor((totalMinor * weight) / weightSum));
  let remainder = totalMinor - shares.reduce((sum, share) => sum + share, 0);

  for (let index = 0; remainder > 0 && index < shares.length; index += 1) {
    shares[index] += 1;
    remainder -= 1;
  }
  return shares;
}

// ─── Форматлах ──────────────────────────────────────────────────────────────

export function formatMinor(minor: Minor, currency = "MNT", locale = "mn-MN"): string {
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    roundHalfUp(minor / MINOR_PER_UNIT),
  );
  return currency === "MNT" ? `${formatted}₮` : `${formatted} ${currency}`;
}

export const toMinor = (major: number): Minor => roundHalfUp(major * MINOR_PER_UNIT);
export const toMajor = (minor: Minor): number => minor / MINOR_PER_UNIT;
