import { createHmac } from "node:crypto";

const BONUM_DEBUG = "true";

function bonumDebugLog(message: string, extra?: unknown): void {
  if (!BONUM_DEBUG) return;
  if (extra === undefined) {
    console.log(`[BONUM_GATEWAY] ${message}`);
    return;
  }
  console.log(`[BONUM_GATEWAY] ${message}`, extra);
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getBonumGatewayEnv(): {
  baseUrl: string;
  appSecret: string;
  terminalId: string;
  checksumKey: string;
  callbackUrl: string;
} {
  const baseUrl = process.env.BONUM_API_BASE_URL?.trim();
  const appSecret = process.env.BONUM_APP_SECRET?.trim();
  const terminalId = process.env.BONUM_TERMINAL_ID?.trim();
  const checksumKey = process.env.BONUM_MERCHANT_CHECKSUM_KEY?.trim() ?? "";
  const callbackUrl = process.env.BONUM_INVOICE_CALLBACK_URL?.trim() ?? "";

  if (!baseUrl || !appSecret || !terminalId) {
    throw new Error(
      "Bonum gateway requires BONUM_API_BASE_URL, BONUM_APP_SECRET, and BONUM_TERMINAL_ID.",
    );
  }
  return { baseUrl: normalizeBaseUrl(baseUrl), appSecret, terminalId, checksumKey, callbackUrl };
}

export function assertBonumInvoiceEnv(): void {
  const { callbackUrl } = getBonumGatewayEnv();
  if (!callbackUrl?.startsWith("https://")) {
    throw new Error(
      "BONUM_INVOICE_CALLBACK_URL must be set to the public HTTPS URL for POST /webhooks/bonum/payment (Bonum invoice callback).",
    );
  }
}

const BONUM_AUTH_PATH = "/bonum-gateway/ecommerce/auth/create";
const BONUM_AUTH_REFRESH_PATH = "/bonum-gateway/ecommerce/auth/refresh";
const BONUM_INVOICES_PATH = "/bonum-gateway/ecommerce/invoices";
const BONUM_QR_CREATE_PATH = "/mpay-service/merchant/transaction/qr/create";
const BONUM_CARD_TOKENIZE_PATH = "/mpay-service/merchant/cards/tokenize/request";
const BONUM_PURCHASE_PATH = "/mpay-service/merchant/transaction/purchase";
const BONUM_ROLLBACK_PATH = "/mpay-service/merchant/transaction/rollback";

/** In-memory token; refresh before expiry (Bonum rate-limits token creation). */
let cachedToken: string | null = null;
let cachedExpiresAt = 0;
let cachedRefreshToken: string | null = null;

function parseTokenResponse(data: unknown): {
  token: string;
  refreshToken: string | null;
  ttlMs: number;
} {
  const o = (data ?? {}) as Record<string, unknown>;
  const nested = o.data && typeof o.data === "object" ? (o.data as Record<string, unknown>) : null;
  const token = String(
    o.accessToken ?? o.token ?? o.access_token ?? nested?.accessToken ?? nested?.token ?? "",
  ).trim();
  if (!token) {
    throw new Error("Bonum auth response did not include a token (accessToken/token).");
  }
  const refreshToken = String(
    o.refreshToken ?? o.refresh_token ?? nested?.refreshToken ?? nested?.refresh_token ?? "",
  ).trim();
  const expiresInSec = Number(
    o.expiresIn ?? o.expires_in ?? nested?.expiresIn ?? nested?.expires_in ?? 1800,
  );
  const ttlMs = Math.max(60_000, Math.min(expiresInSec * 1000, 3_600_000)) - 120_000;
  return { token, refreshToken: refreshToken || null, ttlMs };
}

async function createBonumToken(): Promise<string> {
  const { baseUrl, appSecret, terminalId } = getBonumGatewayEnv();
  const url = `${baseUrl}${BONUM_AUTH_PATH}`;
  bonumDebugLog("Requesting auth token", { url, terminalId });
  const res = await globalThis.fetch(url, {
    method: "GET",
    headers: {
      Authorization: `AppSecret ${appSecret}`,
      AppSecret: appSecret,
      "X-TERMINAL-ID": terminalId,
      Accept: "application/json",
    },
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    bonumDebugLog("Auth token request failed", { status: res.status, body: text.slice(0, 200) });
    throw new Error(`Bonum auth error: ${res.status} ${text}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Bonum auth: expected JSON, got: ${text.slice(0, 200)}`);
  }

  const { token, refreshToken, ttlMs } = parseTokenResponse(json);
  bonumDebugLog("Auth token received", { ttlMs, hasRefreshToken: Boolean(refreshToken) });
  cachedToken = token;
  cachedRefreshToken = refreshToken;
  cachedExpiresAt = Date.now() + ttlMs;
  return token;
}

async function refreshBonumToken(): Promise<string | null> {
  const { baseUrl } = getBonumGatewayEnv();
  if (!cachedRefreshToken) return null;
  const res = await globalThis.fetch(`${baseUrl}${BONUM_AUTH_REFRESH_PATH}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cachedRefreshToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;

  const text = await res.text().catch(() => "");
  if (!text.trim()) return null;

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    return null;
  }

  const { token, refreshToken, ttlMs } = parseTokenResponse(json);
  cachedToken = token;
  cachedRefreshToken = refreshToken ?? cachedRefreshToken;
  cachedExpiresAt = Date.now() + ttlMs;
  return token;
}

export async function getBonumAccessToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedExpiresAt > now) {
    return cachedToken;
  }
  if (!forceRefresh) {
    const refreshed = await refreshBonumToken();
    if (refreshed) return refreshed;
  }
  return createBonumToken();
}

export interface CreateBonumInvoiceInput {
  amount: number;
  transactionId: string;
  callbackUrl: string;
  expiresInSec?: number;
  /** e.g. QPAY, E_COMMERCE — override via BONUM_INVOICE_PROVIDERS JSON array */
  providers?: string[];
}

function defaultProviders(): string[] {
  const raw = process.env.BONUM_INVOICE_PROVIDERS?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        return parsed as string[];
      }
    } catch {
      /* fall through */
    }
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return ["QPAY", "E_COMMERCE"];
}

export interface CreateBonumInvoiceResult {
  raw: unknown;
  invoiceId: string | null;
  followUpLink: string | null;
  qrImage: string | null;
  deeplinks: Array<{ name: string; link: string; description?: string; logo?: string }>;
}

function parseBonumInvoiceLikeResponse(json: unknown): CreateBonumInvoiceResult {
  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;

  const invoiceId = pickString(data, ["invoiceId", "invoice_id", "id"]);
  const followUpLink = pickString(data, [
    "followUpLink",
    "follow_up_link",
    "followuplink",
    "paymentUrl",
    "url",
    "checkoutUrl",
  ]);
  const qrImage = pickString(data, ["qrImage", "qr_image"]);
  const deeplinkRaw = data.links;
  const deeplinks: Array<{ name: string; link: string; description?: string; logo?: string }> = [];
  if (Array.isArray(deeplinkRaw)) {
    for (const entry of deeplinkRaw) {
      if (!entry || typeof entry !== "object") continue;
      const obj = entry as Record<string, unknown>;
      const link = pickString(obj, ["link", "deeplink", "deepLink", "url"]);
      if (!link) continue;
      deeplinks.push({
        name: pickString(obj, ["name", "title"]) ?? "Open app",
        link,
        description: pickString(obj, ["description"]) ?? undefined,
        logo: pickString(obj, ["logo", "icon"]) ?? undefined,
      });
    }
  }

  return { raw: json, invoiceId, followUpLink, qrImage, deeplinks };
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export async function createBonumEcommerceInvoice(
  input: CreateBonumInvoiceInput,
  retriedAfter401 = false,
): Promise<CreateBonumInvoiceResult> {
  const { baseUrl, appSecret, terminalId } = getBonumGatewayEnv();
  const token = await getBonumAccessToken();
  const fromEnv = Number(process.env.BONUM_INVOICE_EXPIRES_SEC ?? "900");
  const expiresIn = input.expiresInSec ?? (Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 900);
  const providers = input.providers?.length ? input.providers : defaultProviders();

  const body = {
    amount: input.amount,
    callback: input.callbackUrl,
    transactionId: input.transactionId,
    expiresIn,
    providers,
  };

  const url = `${baseUrl}${BONUM_INVOICES_PATH}`;
  bonumDebugLog("Creating ecommerce invoice", {
    url,
    transactionId: input.transactionId,
    amount: input.amount,
    providers,
  });
  const res = await globalThis.fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      AppSecret: appSecret,
      "X-TERMINAL-ID": terminalId,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  if (res.status === 401 && !retriedAfter401) {
    bonumDebugLog("Invoice create got 401; refreshing token and retrying");
    await getBonumAccessToken(true);
    return createBonumEcommerceInvoice(input, true);
  }

  if (!res.ok) {
    bonumDebugLog("Invoice create failed", { status: res.status, body: text.slice(0, 300) });
    throw new Error(`Bonum create invoice error: ${res.status} ${text}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Bonum invoice: expected JSON, got: ${text.slice(0, 300)}`);
  }

  bonumDebugLog("Invoice create success", { status: res.status });
  return parseBonumInvoiceLikeResponse(json);
}

export async function createBonumQpayQrCode(
  input: Pick<CreateBonumInvoiceInput, "amount" | "transactionId" | "expiresInSec">,
  retriedAfter401 = false,
): Promise<CreateBonumInvoiceResult> {
  const { baseUrl, appSecret, terminalId } = getBonumGatewayEnv();
  const token = await getBonumAccessToken();
  const fromEnv = Number(process.env.BONUM_INVOICE_EXPIRES_SEC ?? "900");
  const expiresIn = input.expiresInSec ?? (Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 900);

  const res = await globalThis.fetch(`${baseUrl}${BONUM_QR_CREATE_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      AppSecret: appSecret,
      "X-TERMINAL-ID": terminalId,
    },
    body: JSON.stringify({
      amount: input.amount,
      transactionId: input.transactionId,
      expiresIn,
    }),
  });

  const text = await res.text().catch(() => "");
  if (res.status === 401 && !retriedAfter401) {
    bonumDebugLog("QR create got 401; refreshing token and retrying");
    await getBonumAccessToken(true);
    return createBonumQpayQrCode(input, true);
  }
  if (!res.ok) {
    bonumDebugLog("QR create failed", { status: res.status, body: text.slice(0, 300) });
    throw new Error(`Bonum create qr error: ${res.status} ${text}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Bonum create qr: expected JSON, got: ${text.slice(0, 300)}`);
  }

  bonumDebugLog("QR create success", { status: res.status, transactionId: input.transactionId });
  return parseBonumInvoiceLikeResponse(json);
}

/** HMAC-SHA256 over exact raw bytes; compare to x-checksum-v2 (hex, case-insensitive). */
export function computeBonumChecksumHex(rawBody: Buffer, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

// ======================
// Card Tokenization
// ======================

export interface CreateBonumCardTokenInput {
  callbackUrl: string;
  transactionId: string;
  payment?: { amount: number };
  items?: Array<{
    image?: string;
    title: string;
    remark?: string;
    amount: number;
    count: number;
  }>;
}

export interface CreateBonumCardTokenResult {
  raw: unknown;
  followUpLink: string | null;
  id: string | null;
}

export async function createBonumCardTokenRequest(
  input: CreateBonumCardTokenInput,
  retriedAfter401 = false,
): Promise<CreateBonumCardTokenResult> {
  const { baseUrl, appSecret, terminalId } = getBonumGatewayEnv();
  const token = await getBonumAccessToken();

  const body: Record<string, unknown> = {
    callback: input.callbackUrl,
    transactionId: input.transactionId,
  };
  if (input.payment) body.payment = input.payment;
  if (input.items?.length) body.items = input.items;

  const url = `${baseUrl}${BONUM_CARD_TOKENIZE_PATH}`;
  bonumDebugLog("Creating card tokenize request", {
    url,
    transactionId: input.transactionId,
    combinedCharge: Boolean(input.payment),
  });

  const res = await globalThis.fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": "mn",
      Authorization: `Bearer ${token}`,
      AppSecret: appSecret,
      "X-TERMINAL-ID": terminalId,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  if (res.status === 401 && !retriedAfter401) {
    bonumDebugLog("Card tokenize got 401; refreshing token and retrying");
    await getBonumAccessToken(true);
    return createBonumCardTokenRequest(input, true);
  }
  if (!res.ok) {
    bonumDebugLog("Card tokenize failed", { status: res.status, body: text.slice(0, 300) });
    throw new Error(`Bonum card tokenize error: ${res.status} ${text}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Bonum tokenize: expected JSON, got: ${text.slice(0, 300)}`);
  }

  const root = (json ?? {}) as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;
  const followUpLink = typeof data.followUpLink === "string" ? data.followUpLink : null;
  const id = typeof data.id === "string" ? data.id : null;

  bonumDebugLog("Card tokenize success", { hasLink: Boolean(followUpLink) });
  return { raw: json, followUpLink, id };
}

// ======================
// Purchase With Card Token
// ======================

export interface BonumPurchaseInput {
  cardToken: string;
  transactionId: string;
  amount: number;
  currency?: string;
}

export interface BonumPurchaseResult {
  raw: unknown;
  status: "SUCCESS" | "PENDING" | "FAILED" | "UNKNOWN";
  message: string | null;
  bonumTraceId: string | null;
  completedAt: string | null;
  errorCode: string | null;
}

function parsePurchaseStatus(json: unknown): BonumPurchaseResult {
  const root = (json ?? {}) as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null;
  const message = typeof root.message === "string" ? root.message : null;
  const errorCode = typeof root.errorCode === "string" ? root.errorCode : null;
  const bonumTraceId = typeof root.traceId === "string" ? root.traceId : null;
  const completedAt = data && typeof data.completedAt === "string" ? data.completedAt : null;

  const rawStatus = (data && typeof data.status === "string" ? data.status : "").toUpperCase();
  let status: BonumPurchaseResult["status"] = "UNKNOWN";
  if (rawStatus === "SUCCESS" || rawStatus === "COMPLETED" || rawStatus === "PAID") {
    status = "SUCCESS";
  } else if (rawStatus === "PENDING" || rawStatus === "QUEUED" || rawStatus === "PROCESSING") {
    status = "PENDING";
  } else if (rawStatus === "FAILED" || rawStatus === "FAIL") {
    status = "FAILED";
  } else if (typeof root.status === "number" && root.status === 200 && !rawStatus) {
    status = "SUCCESS";
  }

  return { raw: json, status, message, bonumTraceId, completedAt, errorCode };
}

export async function purchaseWithBonumCardToken(
  input: BonumPurchaseInput,
  retriedAfter401 = false,
): Promise<BonumPurchaseResult> {
  const { baseUrl, appSecret, terminalId } = getBonumGatewayEnv();
  const accessToken = await getBonumAccessToken();

  const url = `${baseUrl}${BONUM_PURCHASE_PATH}`;
  bonumDebugLog("Purchase with card token", {
    url,
    transactionId: input.transactionId,
    amount: input.amount,
  });

  const res = await globalThis.fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": "mn",
      Authorization: `Bearer ${accessToken}`,
      AppSecret: appSecret,
      "X-TERMINAL-ID": terminalId,
      "X-CARD-TOKEN": input.cardToken,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency ?? "MNT",
      transactionId: input.transactionId,
    }),
  });

  const text = await res.text().catch(() => "");
  if (res.status === 401 && !retriedAfter401) {
    bonumDebugLog("Purchase got 401; refreshing token and retrying");
    await getBonumAccessToken(true);
    return purchaseWithBonumCardToken(input, true);
  }
  if (!res.ok) {
    bonumDebugLog("Purchase failed", { status: res.status, body: text.slice(0, 300) });
    return {
      raw: text,
      status: "FAILED",
      message: text.slice(0, 200),
      bonumTraceId: null,
      completedAt: null,
      errorCode: String(res.status),
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Bonum purchase: expected JSON, got: ${text.slice(0, 300)}`);
  }

  const result = parsePurchaseStatus(json);
  bonumDebugLog("Purchase response", {
    status: result.status,
    bonumTraceId: result.bonumTraceId,
  });
  return result;
}

// ======================
// Rollback / Refund
// ======================

export interface BonumRollbackInput {
  cardToken: string;
  bonumTransactionId: string;
  amount: number;
}

export async function rollbackBonumPurchase(
  input: BonumRollbackInput,
  retriedAfter401 = false,
): Promise<{ raw: unknown; ok: boolean }> {
  const { baseUrl, appSecret, terminalId } = getBonumGatewayEnv();
  const accessToken = await getBonumAccessToken();

  const url = `${baseUrl}${BONUM_ROLLBACK_PATH}/${encodeURIComponent(input.bonumTransactionId)}`;
  bonumDebugLog("Rollback purchase", { url, amount: input.amount });

  const res = await globalThis.fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      AppSecret: appSecret,
      "X-TERMINAL-ID": terminalId,
      "X-CARD-TOKEN": input.cardToken,
    },
    body: JSON.stringify({ amount: input.amount }),
  });

  const text = await res.text().catch(() => "");
  if (res.status === 401 && !retriedAfter401) {
    await getBonumAccessToken(true);
    return rollbackBonumPurchase(input, true);
  }

  if (!res.ok) {
    bonumDebugLog("Rollback failed", { status: res.status, body: text.slice(0, 200) });
    return { raw: text, ok: false };
  }

  let json: unknown = text;
  try {
    json = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    /* keep raw */
  }
  return { raw: json, ok: true };
}
