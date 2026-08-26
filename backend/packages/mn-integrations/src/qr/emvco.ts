export interface EmvcoQrField {
  tag: string;
  len: number;
  value: string;
}

export interface EmvcoQrSummary {
  bankId?: string;
  accountOrId?: string;
  currency?: string;
  amount?: string;
  country?: string;
  merchantName?: string;
  merchantCity?: string;
  postalCode?: string;
  purpose?: string;
  currencyCode?: string;
}

export interface BuildEmvcoQrInput {
  accountNumber: string;
  accountName: string;
  currency?: string;
  amount?: number | string;
  purpose?: string;
  bankId?: string;
  country?: string;
  merchantCity?: string;
  postalCode?: string;
}

function parseTLV(str: string): EmvcoQrField[] {
  const out: EmvcoQrField[] = [];
  let i = 0;
  while (i < str.length - 3) {
    const tag = str.slice(i, i + 2);
    const lenStr = str.slice(i + 2, i + 4);
    const len = Number.parseInt(lenStr, 10);
    if (Number.isNaN(len) || len < 0 || i + 4 + len > str.length) break;
    const value = str.slice(i + 4, i + 4 + len);
    out.push({ tag, len, value });
    i += 4 + len;
  }
  return out;
}

function toTlv(tag: string, value: string): string {
  const normalized = value ?? "";
  return `${tag}${String(normalized.length).padStart(2, "0")}${normalized}`;
}

function transliterateCyrillic(value: string): string {
  const map: Record<string, string> = {
    А: "A",
    а: "a",
    Б: "B",
    б: "b",
    В: "V",
    в: "v",
    Г: "G",
    г: "g",
    Д: "D",
    д: "d",
    Е: "E",
    е: "e",
    Ё: "Yo",
    ё: "yo",
    Ж: "J",
    ж: "j",
    З: "Z",
    з: "z",
    И: "I",
    и: "i",
    Й: "I",
    й: "i",
    К: "K",
    к: "k",
    Л: "L",
    л: "l",
    М: "M",
    м: "m",
    Н: "N",
    н: "n",
    О: "O",
    о: "o",
    Ө: "U",
    ө: "u",
    П: "P",
    п: "p",
    Р: "R",
    р: "r",
    С: "S",
    с: "s",
    Т: "T",
    т: "t",
    У: "U",
    у: "u",
    Ү: "U",
    ү: "u",
    Ф: "F",
    ф: "f",
    Х: "Kh",
    х: "kh",
    Ц: "Ts",
    ц: "ts",
    Ч: "Ch",
    ч: "ch",
    Ш: "Sh",
    ш: "sh",
    Щ: "Sh",
    щ: "sh",
    Ъ: "",
    ъ: "",
    Ы: "Y",
    ы: "y",
    Ь: "",
    ь: "",
    Э: "E",
    э: "e",
    Ю: "Yu",
    ю: "yu",
    Я: "Ya",
    я: "ya",
  };

  return value
    .split("")
    .map((char) => map[char] ?? char)
    .join("");
}

function sanitizeEmvcoText(value: string, maxLength?: number): string {
  const transliterated = transliterateCyrillic(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .,/\-_:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!maxLength) return transliterated;
  return transliterated.slice(0, maxLength);
}
function currencyToNumeric(currency?: string): string {
  const code = (currency || "MNT").toUpperCase();
  if (code === "MNT") return "496";
  if (code === "USD") return "840";
  if (code === "EUR") return "978";
  return code;
}

function normalizeAmount(amount?: number | string): string | undefined {
  if (amount === undefined || amount === null || amount === "") return undefined;
  const parsed = typeof amount === "number" ? amount : Number.parseFloat(String(amount));
  if (Number.isNaN(parsed)) return undefined;
  return parsed.toFixed(2);
}

function crc16CcittFalse(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i += 1) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function parseEmvcoQr(raw: string): EmvcoQrSummary {
  // ЗАСВАР (winu-гээс зөөх үед илэрсэн):
  // Өмнө нь энд `.replace(/\s/g, "")` байж, payload доторх БҮХ зайг устгадаг байсан.
  // Гэтэл EMVCo-д merchant name (59), city (60), purpose (50) зэрэг талбар зайтай
  // байж болно — `toTlv` нь уртыг зайтай нь тооцож бичсэн байдаг. Зайг устгахад
  // бодит урт нь бичигдсэн уртаас богино болж, тухайн талбараас хойших БҮХ
  // унших байрлал шилжиж, дараагийн тагийн эхний тэмдэгтүүд утга руу цутгадаг.
  // (Жишээ: "TEST MERCHANT" → "TESTMERCHANT6", "6" нь тag 60-ын эхнээс.)
  // Гадна талын зайг л авна.
  const s = (raw || "").trim();
  if (!s) return {};

  const list = parseTLV(s);
  const summary: EmvcoQrSummary = {};

  for (const { tag, value } of list) {
    if (tag === "58") summary.country = value;
    if (tag === "59") summary.merchantName = value;
    if (tag === "60") summary.merchantCity = value;
    if (tag === "61") summary.postalCode = value;
    if (tag === "53") {
      summary.currencyCode = value;
      summary.currency = value === "496" ? "MNT" : value;
    }
    if (tag === "54") summary.amount = value;
    if (tag === "26") {
      const sub = parseTLV(value);
      const gui = sub.find((e) => e.tag === "00");
      const id01 = sub.find((e) => e.tag === "01");
      const id02 = sub.find((e) => e.tag === "02");
      if (id01) summary.bankId = id01.value;
      if (id02) summary.accountOrId = id02.value;
      if (!summary.bankId && gui) summary.bankId = gui.value;
    }
    if (tag === "62" && value.length >= 4) {
      const sub = parseTLV(value);
      const purpose = sub.find((e) => e.tag === "50");
      if (purpose) summary.purpose = purpose.value;
    }
  }

  return summary;
}

export function buildEmvcoQr(input: BuildEmvcoQrInput): string {
  const accountNumber = (input.accountNumber || "").replace(/\s+/g, "").trim();
  const accountName = sanitizeEmvcoText((input.accountName || "").trim(), 25);

  if (!accountNumber) {
    throw new Error("accountNumber is required");
  }
  if (!accountName) {
    throw new Error("accountName is required");
  }

  const amount = normalizeAmount(input.amount);
  const merchantInfo = [
    toTlv("00", input.bankId?.trim() || "A000000727"),
    ...(input.bankId ? [toTlv("01", input.bankId.trim())] : []),
    toTlv("02", accountNumber),
  ].join("");

  const purpose = sanitizeEmvcoText(input.purpose?.trim() || "", 25);

  const additionalData = purpose ? toTlv("62", toTlv("50", purpose)) : "";

  const payloadWithoutCrc = [
    toTlv("00", "01"),
    toTlv("01", amount ? "12" : "11"),
    toTlv("26", merchantInfo),
    toTlv("52", "0000"),
    toTlv("53", currencyToNumeric(input.currency)),
    ...(amount ? [toTlv("54", amount)] : []),
    toTlv("58", (input.country || "MN").toUpperCase()),
    toTlv("59", accountName),
    toTlv("60", sanitizeEmvcoText(input.merchantCity || "Ulaanbaatar", 15)),
    ...(input.postalCode ? [toTlv("61", input.postalCode.trim())] : []),
    additionalData,
    "6304",
  ].join("");

  const crc = crc16CcittFalse(payloadWithoutCrc);
  return `${payloadWithoutCrc}${crc}`;
}
