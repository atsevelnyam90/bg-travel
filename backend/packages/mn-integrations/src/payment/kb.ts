// Хаан банк Corporate Gateway (CG001).
//
// winu-гээс зөөгдсөн. Хийсэн өөрчлөлт:
//   - node-fetch хамаарлыг хассан (Node 18+ дээр fetch нь global)
//   - тохиргоог модуль ачаалагдах үед биш, дуудагдах үед уншдаг болгосон
//     (энэ нь dotenv-ийг import-ын дараа ачаалдаг орчинд чухал)
//   - `any` default-уудыг `unknown` болгосон

type KbConfig = {
  baseUrl: string;
  username: string;
  password: string;
  /** Шилжүүлгийн эх банкны код. Хаан банк = "050000" */
  sourceBankCode: string;
};

let overrides: Partial<KbConfig> = {};

/** Env-ийн оронд тохиргоог шууд өгөх (тест, олон тенант). */
export function configureKb(config: Partial<KbConfig>): void {
  overrides = { ...overrides, ...config };
}

function kbConfig(): KbConfig {
  const baseUrl = overrides.baseUrl ?? process.env.KB_BASE_URL;
  const username = overrides.username ?? process.env.KB_USERNAME;
  const password = overrides.password ?? process.env.KB_PASSWORD;

  if (!baseUrl) throw new Error("KB_BASE_URL тохируулаагүй байна");
  if (!username || !password) throw new Error("KB_USERNAME / KB_PASSWORD тохируулаагүй байна");

  return {
    baseUrl,
    username,
    password,
    sourceBankCode:
      overrides.sourceBankCode ?? process.env.WINU_PAYOUT_SOURCE_BANK_CODE ?? "050000",
  };
}

/** Эх банкны код — тохиргоог уншсаны дараа авна. */
export function getSourceBankCode(): string {
  return kbConfig().sourceBankCode;
}

// Simple in-memory token cache (per Node process)
let cachedToken: string | null = null;
let cachedTokenExpiresAt = 0; // epoch ms

interface KbTokenResponse {
  access_token: string;
  access_token_expires_in?: number;
  developer_email: string;
}

/**
 * Fetch one-time token from Khaan Bank Corporate Gateway (CG001).
 * Token lifetime: 1799 seconds (according to docs).
 * We cache it in memory and reuse until ~5 seconds before expiry.
 *
 * IMPORTANT:
 * - KB_USERNAME / KB_PASSWORD must be provided via environment variables.
 */
export async function getKbToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedTokenExpiresAt > now) {
    return cachedToken;
  }

  const { username, password } = kbConfig();

  if (!username || !password) {
    throw new Error("KB_USERNAME / KB_PASSWORD env vars are required");
  }

  const res = await fetch(`${kbConfig().baseUrl}/auth/token?grant_type=client_credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`KB token error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as KbTokenResponse;

  // 1799 секунд ~ 30 минут. Жаахан buffer авч 1790 секундээр тооцно.
  const ttlSeconds = data.access_token_expires_in ?? 1790;
  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + ttlSeconds * 1000;

  return data.access_token;
}

/**
 * Helper to call KB GET endpoints (CG002–CG006) with Bearer token.
 */
export async function kbGet<T = unknown>(path: string): Promise<T> {
  let token = await getKbToken();
  console.log("token", token);
  let res = await fetch(`${kbConfig().baseUrl}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // If token is invalid/expired on KB side, force refresh token and retry once.
  if (res.status === 401) {
    token = await getKbToken(true);
    res = await fetch(`${kbConfig().baseUrl}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  if (!res.ok) {
    throw new Error(await extractKbErrorMessage(res));
  }

  return (await res.json()) as T;
}

/**
 * Parse KB error response body. Prefer JSON `message` field; fall back to raw text or status.
 */
async function extractKbErrorMessage(res: {
  status: number;
  text: () => Promise<string>;
}): Promise<string> {
  const text = await res.text().catch(() => "");
  if (!text) return `KB API error: ${res.status}`;
  try {
    const json = JSON.parse(text);
    if (json && typeof json.message === "string" && json.message.trim()) {
      return json.message.trim();
    }
    if (json && typeof json.error === "string" && json.error.trim()) {
      return json.error.trim();
    }
  } catch {
    // not JSON
  }
  return text;
}

/**
 * Helper to call KB POST endpoints (CG007/CG008) with Bearer token.
 * Body is JSON. Returns parsed response + raw text for audit storage.
 */
export async function kbPost<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<{ data: T; raw: string; status: number }> {
  let token = await getKbToken();
  const payload = JSON.stringify(body);

  const doCall = async (tkn: string) =>
    fetch(`${kbConfig().baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tkn}`,
      },
      body: payload,
    });

  let res = await doCall(token);
  if (res.status === 401) {
    token = await getKbToken(true);
    res = await doCall(token);
  }

  const raw = await res.text();
  if (!res.ok) {
    let msg = raw;
    try {
      const json = JSON.parse(raw);
      if (json && typeof json.message === "string" && json.message.trim())
        msg = json.message.trim();
      else if (json && typeof json.error === "string" && json.error.trim()) msg = json.error.trim();
    } catch {
      // not JSON
    }
    throw new Error(msg || `KB API error: ${res.status}`);
  }

  let data: T;
  try {
    data = JSON.parse(raw) as T;
  } catch {
    throw new Error(`KB API returned non-JSON response: ${raw}`);
  }

  return { data, raw, status: res.status };
}

// ---------- Transfer-specific wrappers ----------

/**
 * CG006 account name inquiry response (KHAN CGW manual page 12).
 * Field names are PascalCase as documented.
 */
export interface KbAccountInquiryResponse {
  // KHAN CGW нь camelCase/lowercase ашиглан буцаадаг (manual нь PascalCase
  // байгаа ч production response нь {iban, alias, name, msgId}).
  iban?: string;
  alias?: string | null;
  name?: string;
  msgId?: string | null;
  // PascalCase aliases — environment эсвэл версийн ялгаатай үед fallback.
  IBAN?: string;
  Alias?: string;
  Name?: string;
  MSGID?: string;
  [k: string]: unknown;
}

const IBAN_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;

/**
 * CG006 — account name inquiry. KHAN CGW manual:
 *   - Variant 1: `?acct={accountNumber}&bank_code={bankCode}` — account number-ээр хайх.
 *   - Variant 2: `?iban={IBAN}` — IBAN-аар хайх (bank_code хэрэггүй).
 * Хэрэглэгчийн input-аас format-ыг таниад зөв variant-г сонгоно.
 */
export async function kbAccountInquiry(
  acct: string,
  bankCode: string,
): Promise<KbAccountInquiryResponse> {
  const trimmed = acct.trim().toUpperCase();
  const isIban = IBAN_PATTERN.test(trimmed);
  const params = isIban
    ? new URLSearchParams({ iban: trimmed })
    : new URLSearchParams({ acct: trimmed, bank_code: bankCode });
  const path = `/accounts/cam?${params.toString()}`;
  console.log("[KB CG006] cam inquiry request", {
    url: `${kbConfig().baseUrl}${path}`,
    mode: isIban ? "iban" : "acct",
    acct: trimmed,
    bank_code: isIban ? undefined : bankCode,
  });
  try {
    const res = await kbGet<KbAccountInquiryResponse>(path);
    console.log("[KB CG006] cam inquiry response", {
      mode: isIban ? "iban" : "acct",
      response: res,
    });
    return res;
  } catch (err) {
    console.error("[KB CG006] cam inquiry error", {
      mode: isIban ? "iban" : "acct",
      acct: trimmed,
      error: (err as Error).message,
    });
    throw err;
  }
}

export interface KbTransferRequest {
  sourceAccount: string;
  destinationAccount: string;
  destinationBankCode: string;
  /** Required by CG008 interbank when toAccount is not an IBAN. */
  destinationBankBic?: string | null;
  /** Required by CG008 interbank — beneficiary name on file at the receiving bank. */
  recipientName?: string;
  amount: number;
  /** ISO currency code of the source account. */
  currency?: string;
  /** ISO currency code of the destination account (FX). For MNT→MNT same as currency. */
  toCurrency?: string;
  description?: string;
  /** Unique transfer ID — used for idempotency. Map to PayoutRequest.id. */
  referenceId: string;
  /** KHAN CGW login name (per-environment env var). */
  loginName: string;
  /** KHAN CGW encrypted transaction password. */
  tranPassword: string;
}

/**
 * CG007/CG008 success response. Fields per KHAN CGW manual.
 * - `uuid`: KHAN-side reference / idempotency key
 * - `journalNo`: settlement journal number
 * Failures are signaled via non-2xx HTTP status (handled in kbPost).
 */
export interface KbTransferResponse {
  uuid?: string;
  journalNo?: string;
  systemDate?: string;
  toRate?: number;
  fromRate?: number;
  baseAmount?: number;
  [k: string]: unknown;
}

/**
 * CG007 — domestic (intra-Khan) transfer.
 * Body keys are camelCase per KHAN CGW manual page 15.
 */
export async function kbDomesticTransfer(
  req: KbTransferRequest,
): Promise<{ data: KbTransferResponse; raw: string; sentRequest: Record<string, unknown> }> {
  const currency = req.currency ?? "MNT";
  const body: Record<string, unknown> = {
    fromAccount: req.sourceAccount,
    toAccount: req.destinationAccount,
    toCurrency: req.toCurrency ?? currency,
    amount: req.amount,
    description: req.description ?? "WinU payout",
    currency,
    loginName: req.loginName,
    tranPassword: req.tranPassword,
    transferid: req.referenceId,
  };
  const { data, raw } = await kbPost<KbTransferResponse>("/transfer/domestic", body);
  return { data, raw, sentRequest: body };
}

/**
 * CG008 — interbank transfer.
 * Adds three extra fields vs CG007: toAccountName, toBank, toBankBic.
 * Body keys are camelCase per KHAN CGW manual page 16.
 */
export async function kbInterbankTransfer(
  req: KbTransferRequest,
): Promise<{ data: KbTransferResponse; raw: string; sentRequest: Record<string, unknown> }> {
  if (!req.destinationBankBic) {
    throw new Error(
      "kbInterbankTransfer: destinationBankBic is required (toBankBic) when toAccount is not an IBAN.",
    );
  }
  if (!req.recipientName) {
    throw new Error(
      "kbInterbankTransfer: recipientName is required (toAccountName) for interbank transfer.",
    );
  }
  const currency = req.currency ?? "MNT";
  const body: Record<string, unknown> = {
    fromAccount: req.sourceAccount,
    toAccount: req.destinationAccount,
    toCurrency: req.toCurrency ?? currency,
    toAccountName: req.recipientName,
    toBank: req.destinationBankCode,
    toBankBic: req.destinationBankBic,
    amount: req.amount,
    description: req.description ?? "WinU payout",
    currency,
    loginName: req.loginName,
    tranPassword: req.tranPassword,
    transferid: req.referenceId,
  };
  const { data, raw } = await kbPost<KbTransferResponse>("/transfer/interbank", body);
  return { data, raw, sentRequest: body };
}

/**
 * KHAN bank code — used to route intra vs interbank.
 * Override via env var WINU_PAYOUT_SOURCE_BANK_CODE if needed.
 */
// KHAN_BANK_CODE -> getSourceBankCode() (дээрх). Модуль ачаалах үед env уншихаа больсон.
