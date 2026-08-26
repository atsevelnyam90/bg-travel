// Timezone-той ажиллах жижиг helper-ууд. Гадаад dependency (luxon, date-fns-tz)
// нэмэхгүй — Node-ийн Intl хүрэлцэнэ.
//
// Яагаад хэрэгтэй: серверийн процессын timezone (dev дээр +08, prod дээр UTC)
// нь бизнесийн "сарын 15-нд шилжүүлэг" гэсэн өдрөөс зөрдөг. Улаанбаатар нь
// UTC+8 тул UTC серверийн `now.getDate()` нь орон нутгийн 15-ны 00:00–07:59
// хооронд 14 гэж хэлнэ. Иймд өдөр/цагийг үргэлж заасан timezone дээр бодно.

export const DEFAULT_TIMEZONE = "Asia/Ulaanbaatar";

export interface ZonedParts {
  year: number;
  /** 0-11 — JS Date-ийн month-той ижил. */
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** `YYYY-MM-DD` — өдрийг харьцуулах тогтмол key. */
  dateKey: string;
  /** Тухайн instant дээрх timezone-ы UTC-ээс зөрүү (ms). УБ = +8 цаг. */
  offsetMs: number;
}

/**
 * Timezone нэр хүчинтэй эсэхийг шалгана. Буруу бол default-руу унана —
 * config-т бичсэн бичгийн алдаанаас болж cron бүхэлдээ унахаас сэргийлнэ.
 */
export function safeTimezone(timezone?: string | null): string {
  const candidate = timezone?.trim();
  if (!candidate) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate });
    return candidate;
  } catch {
    console.warn(`[timezone] Танихгүй timezone "${candidate}" — ${DEFAULT_TIMEZONE} хэрэглэв.`);
    return DEFAULT_TIMEZONE;
  }
}

function formatParts(timezone: string, at: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);

  const out: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") out[part.type] = part.value;
  }
  return out;
}

/** Тухайн instant-ыг заасан timezone дээрх календарын хэсгүүд болгож задлана. */
export function zonedParts(at: Date, timezone?: string | null): ZonedParts {
  const tz = safeTimezone(timezone);
  const p = formatParts(tz, at);

  const year = Number(p.year);
  const month = Number(p.month) - 1;
  const day = Number(p.day);
  const hour = Number(p.hour);
  const minute = Number(p.minute);
  const second = Number(p.second);

  // Орон нутгийн хэсгүүдийг UTC гэж уншаад жинхэнэ instant-аас хасвал offset
  // гарна. Intl нь секундээс доош гаргадаггүй тул instant-ыг секунд болгож
  // дүүрэгсэнэ (эс тэгвэл offset-д ms-ийн хаягдал үлдэнэ).
  const asIfUtc = Date.UTC(year, month, day, hour, minute, second);
  const offsetMs = asIfUtc - Math.floor(at.getTime() / 1000) * 1000;

  return {
    year,
    month,
    day,
    hour,
    minute,
    dateKey: `${p.year}-${p.month}-${p.day}`,
    offsetMs,
  };
}

/**
 * Заасан timezone дээрх тухайн өдрийн 00:00 нь ямар UTC instant болохыг буцаана.
 *
 * NOTE: offset-ыг `at` instant дээр бодно. Улаанбаатар DST хэрэглэдэггүй тул
 * зөрүү үүсэхгүй; DST-тэй timezone-д шилжилтийн өдөр 1 цагийн зөрүү гарч
 * магадгүй (cron-ын "өдөрт нэг" логикт нөлөөлөхөөргүй).
 */
export function zonedStartOfDayUtc(at: Date, timezone?: string | null): Date {
  const parts = zonedParts(at, timezone);
  return new Date(Date.UTC(parts.year, parts.month, parts.day, 0, 0, 0, 0) - parts.offsetMs);
}

/** `HH:MM` (эсвэл `H:MM`) → цаг/минут. Буруу формат бол null. */
export function parseHourMinute(raw?: string | null): { hour: number; minute: number } | null {
  const matched = /^(\d{1,2}):(\d{2})$/.exec(raw?.trim() ?? "");
  if (!matched) return null;
  const hour = Number(matched[1]);
  const minute = Number(matched[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/** Цаг/минутыг `HH:MM` болгож харуулна. */
export function formatHourMinute(value: { hour: number; minute: number }): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(value.hour)}:${pad(value.minute)}`;
}
