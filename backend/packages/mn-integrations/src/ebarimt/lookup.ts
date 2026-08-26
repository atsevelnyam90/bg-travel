// Гадны JSON хариу — бүтэц нь баталгаагүй тул `any` биш индекслэх боломжтой
// төрлөөр илэрхийлнэ. Утга бүрийг ашиглахын өмнө нарийвчилж шалгана.
type JsonRecord = Record<string, unknown>;

type LookupMethod = "GET" | "POST";

export type EbarimtTinLookupType = "TIN" | "REGISTRATION_NUMBER" | "CIVIL_ID";

export interface EbarimtLookupClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  tinPath?: string;
  registrationPath?: string;
  bunaPath?: string;
  barcodeListPath?: string;
  tinMethod?: LookupMethod;
  registrationMethod?: LookupMethod;
}

export interface EbarimtTaxpayerRecord {
  tin?: string | null;
  registrationNumber?: string | null;
  name?: string | null;
  vatPayer?: boolean | null;
  found: boolean;
  raw: unknown;
}

export interface EbarimtLookupResponse {
  configured: boolean;
  skipped?: boolean;
  record?: EbarimtTaxpayerRecord | null;
  raw?: unknown;
  message?: string;
}

export interface EbarimtBunaLookupRow {
  code: string;
  name: string | null;
  registeredAt?: string | null;
  raw: unknown;
}

export interface EbarimtBunaLookupResponse {
  configured: boolean;
  skipped?: boolean;
  rows: EbarimtBunaLookupRow[];
  raw?: unknown;
  message?: string;
}

export interface EbarimtBarcodeCatalogRow {
  barCode: string;
  name: string | null;
  registeredAt: string | null;
  classificationCode: string | null;
  flags: string[];
  raw: unknown;
}

export interface EbarimtBarcodeCatalogResponse {
  configured: boolean;
  skipped?: boolean;
  page: number;
  size: number;
  totalPages: number | null;
  totalElements: number | null;
  rows: EbarimtBarcodeCatalogRow[];
  raw?: unknown;
  message?: string;
}

export class EbarimtLookupClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly tinPath: string;
  private readonly registrationPath: string;
  private readonly bunaPath: string;
  private readonly barcodeListPath: string;
  private readonly tinMethod: LookupMethod;
  private readonly registrationMethod: LookupMethod;
  private readonly configured: boolean;
  private readonly catalogConfigured: boolean;

  constructor(options: EbarimtLookupClientOptions = {}) {
    const configuredBaseUrl =
      options.baseUrl ||
      process.env.EBARIMT_LOOKUP_API_BASE_URL ||
      process.env.EBARIMT_SERVICES_API_BASE_URL ||
      "";
    this.baseUrl = normalizeBaseUrl(configuredBaseUrl);
    this.timeoutMs = Number(options.timeoutMs || process.env.EBARIMT_LOOKUP_TIMEOUT_MS || 20000);
    this.tinPath = options.tinPath || process.env.EBARIMT_LOOKUP_TIN_PATH || "";
    this.registrationPath =
      options.registrationPath || process.env.EBARIMT_LOOKUP_REGISTRATION_PATH || "";
    this.bunaPath =
      options.bunaPath || process.env.EBARIMT_LOOKUP_BUNA_PATH || "/api/info/check/barcode/v2";
    this.barcodeListPath =
      options.barcodeListPath ||
      process.env.EBARIMT_LOOKUP_BARCODE_LIST_PATH ||
      "/api/info/check/barcode/all";
    this.tinMethod = normalizeMethod(
      options.tinMethod || process.env.EBARIMT_LOOKUP_TIN_METHOD || "POST",
    );
    this.registrationMethod = normalizeMethod(
      options.registrationMethod || process.env.EBARIMT_LOOKUP_REGISTRATION_METHOD || "POST",
    );
    this.configured =
      Boolean(this.baseUrl) &&
      !this.baseUrl.startsWith("TODO_") &&
      (isConfiguredPath(this.tinPath) || isConfiguredPath(this.registrationPath));
    this.catalogConfigured =
      Boolean(this.baseUrl) &&
      !this.baseUrl.startsWith("TODO_") &&
      (isConfiguredPath(this.bunaPath) || isConfiguredPath(this.barcodeListPath));
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async lookupTin(
    identifier: string,
    lookupType: EbarimtTinLookupType = "TIN",
  ): Promise<EbarimtLookupResponse> {
    if (!this.configured || !isConfiguredPath(this.tinPath)) {
      return skipped("EBarimt TIN lookup endpoint is not configured.");
    }

    const payload = buildTinPayload(identifier, lookupType);
    const raw = await this.request(this.tinMethod, this.tinPath, payload);
    return {
      configured: true,
      raw,
      record: normalizeTaxpayerRecord(raw),
    };
  }

  async lookupRegistration(tin: string): Promise<EbarimtLookupResponse> {
    if (!this.configured || !isConfiguredPath(this.registrationPath)) {
      return skipped("EBarimt registration lookup endpoint is not configured.");
    }

    const raw = await this.request(this.registrationMethod, this.registrationPath, {
      tin: normalizeDigits(tin),
      taxpayerTin: normalizeDigits(tin),
      taxpayerNo: normalizeDigits(tin),
    });
    return {
      configured: true,
      raw,
      record: normalizeTaxpayerRecord(raw),
    };
  }

  async lookupBunaClassification(segments: string[] = []): Promise<EbarimtBunaLookupResponse> {
    if (!this.catalogConfigured || !isConfiguredPath(this.bunaPath)) {
      return {
        configured: false,
        skipped: true,
        rows: [],
        message: "EBarimt BUNA classification lookup endpoint is not configured.",
      };
    }

    const normalizedSegments = segments.map(normalizeSegment).filter(Boolean);
    const path = [
      normalizePath(this.bunaPath),
      ...normalizedSegments.map((segment) => encodeURIComponent(segment)),
    ].join("/");
    const raw = await this.request("GET", path, {});

    return {
      configured: true,
      rows: normalizeBunaRows(raw),
      raw,
    };
  }

  async lookupBarcodeCatalog(
    query: { page?: number; size?: number; date?: string | null } = {},
  ): Promise<EbarimtBarcodeCatalogResponse> {
    const page = Math.max(0, Number.isFinite(Number(query.page)) ? Number(query.page) : 0);
    const configuredMaxSize = Number(process.env.EBARIMT_LOOKUP_BARCODE_LIST_MAX_SIZE || 200);
    const maxSize = Number.isFinite(configuredMaxSize) ? Math.max(1, configuredMaxSize) : 200;
    const size = Math.min(
      maxSize,
      Math.max(1, Number.isFinite(Number(query.size)) ? Number(query.size) : 20),
    );

    if (!this.catalogConfigured || !isConfiguredPath(this.barcodeListPath)) {
      return {
        configured: false,
        skipped: true,
        page,
        size,
        totalPages: null,
        totalElements: null,
        rows: [],
        message: "EBarimt barcode catalog lookup endpoint is not configured.",
      };
    }

    const payload: Record<string, string> = {
      page: String(page),
      size: String(size),
    };
    if (query.date) payload.date = query.date;

    const raw = await this.request("GET", this.barcodeListPath, payload);
    const pageCandidate = firstObjectCandidate(raw);

    return {
      configured: true,
      page: numberField(pageCandidate, "number") ?? page,
      size: numberField(pageCandidate, "size") ?? size,
      totalPages: numberField(pageCandidate, "totalPages"),
      totalElements: numberField(pageCandidate, "totalElements"),
      rows: normalizeBarcodeRows(raw),
      raw,
    };
  }

  private async request(
    method: LookupMethod,
    path: string,
    payload: Record<string, string>,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const url = buildUrl(`${this.baseUrl}${normalizePath(path)}`, method, payload);

    try {
      const response = await globalThis.fetch(url, {
        method,
        headers: buildHeaders(payload),
        body: method === "GET" ? undefined : JSON.stringify(payload),
        signal: controller.signal,
      });

      const text = await response.text().catch(() => "");
      const parsed = parseMaybeJson(text);
      if (!response.ok) {
        throw new Error(
          `EBarimt lookup ${method} ${path} failed: ${response.status} ${shortText(text)}`,
        );
      }
      return parsed;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function buildTinPayload(
  identifier: string,
  lookupType: EbarimtTinLookupType,
): Record<string, string> {
  const value = normalizeLookupValue(identifier);
  if (lookupType === "REGISTRATION_NUMBER") {
    return {
      regNo: value,
      registerNo: value,
      registrationNumber: value,
    };
  }
  if (lookupType === "CIVIL_ID") {
    return {
      civilId: value,
      civil_id: value,
      regNo: value,
    };
  }
  return {
    tin: normalizeDigits(value),
    taxpayerTin: normalizeDigits(value),
    taxpayerNo: normalizeDigits(value),
  };
}

function buildHeaders(payload: Record<string, string>) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const bearerToken = envValue("EBARIMT_LOOKUP_AUTH_TOKEN");
  const apiKey = envValue("EBARIMT_LOOKUP_API_KEY");
  const username = envValue("EBARIMT_LOOKUP_USERNAME");
  const password = envValue("EBARIMT_LOOKUP_PASSWORD");

  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  if (apiKey) headers["x-api-key"] = apiKey;
  if (!bearerToken && username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  }

  const checksum = envValue("EBARIMT_LOOKUP_CHECKSUM");
  if (checksum) headers["x-checksum-v2"] = checksum;

  const tenant = envValue("EBARIMT_LOOKUP_TENANT");
  if (tenant) headers["x-tenant"] = tenant;

  void payload;
  return headers;
}

function buildUrl(url: string, method: LookupMethod, payload: Record<string, string>) {
  if (method !== "GET") return url;
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url;
}

function normalizeTaxpayerRecord(raw: unknown): EbarimtTaxpayerRecord {
  const candidate = firstObjectCandidate(raw);
  const primitiveData = pickPrimitiveData(raw);
  const tin =
    pickString(candidate, [
      "tin",
      "taxpayerTin",
      "taxpayerTIN",
      "taxpayerNo",
      "taxpayerNumber",
      "taxPayerNo",
      "customerTin",
      "ttd",
      "TTD",
    ]) || (primitiveData && /^\d+$/.test(primitiveData) ? primitiveData : null);
  const registrationNumber = pickString(candidate, [
    "regNo",
    "registerNo",
    "registrationNumber",
    "registrationNo",
    "stateRegNo",
    "civilId",
    "civil_id",
    "companyRegNo",
  ]);
  const name = pickString(candidate, [
    "name",
    "taxpayerName",
    "taxPayerName",
    "legalName",
    "companyName",
    "entityName",
    "lastName",
    "firstName",
  ]);
  const vatPayer = pickBoolean(candidate, [
    "vatPayer",
    "isVatPayer",
    "isVatpayer",
    "vatpayer",
    "isVatWithholder",
  ]);
  const found = inferFound(candidate, tin, registrationNumber, name);

  return {
    tin: tin ? normalizeDigits(tin) : null,
    registrationNumber: registrationNumber ? normalizeLookupValue(registrationNumber) : null,
    name: name || null,
    vatPayer,
    found,
    raw,
  };
}

function normalizeBunaRows(raw: unknown): EbarimtBunaLookupRow[] {
  return extractRows(raw)
    .filter(Array.isArray)
    .map((row) => {
      const values = row as unknown[];
      return {
        code: stringValue(values[0]),
        name: nullableString(values[1]),
        registeredAt: nullableString(values[2]),
        raw: row,
      };
    })
    .filter((row) => row.code);
}

function normalizeBarcodeRows(raw: unknown): EbarimtBarcodeCatalogRow[] {
  return extractRows(raw)
    .filter(Array.isArray)
    .map((row) => {
      const values = row as unknown[];
      return {
        barCode: stringValue(values[0]),
        name: nullableString(values[1]),
        registeredAt: nullableString(values[2]),
        classificationCode: nullableString(values[3]),
        flags: values
          .slice(4)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .map(stringValue)
          .filter(Boolean),
        raw: row,
      };
    })
    .filter((row) => row.barCode);
}

function extractRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];

  const root = raw as Record<string, unknown>;
  if (Array.isArray(root.content)) return root.content;
  if (Array.isArray(root.data)) return root.data;
  if (root.data && typeof root.data === "object") {
    const data = root.data as Record<string, unknown>;
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.rows)) return data.rows;
  }
  if (Array.isArray(root.rows)) return root.rows;
  if (Array.isArray(root.result)) return root.result;

  return [];
}

function numberField(candidate: JsonRecord | null | undefined, key: string): number | null {
  const value = candidate?.[key];
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function nullableString(value: unknown): string | null {
  const string = stringValue(value);
  return string || null;
}

function pickPrimitiveData(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const data = (value as Record<string, unknown>).data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data === "number") return String(data);
  return null;
}

function firstObjectCandidate(value: unknown): JsonRecord {
  if (Array.isArray(value))
    return (value.find((item) => item && typeof item === "object") as JsonRecord) ?? {};
  if (!value || typeof value !== "object") return {};

  const root = value as Record<string, unknown>;
  const preferredKeys = ["data", "result", "response", "taxpayer", "taxPayer", "body", "payload"];
  for (const key of preferredKeys) {
    const nested = root[key];
    if (Array.isArray(nested)) {
      const first = nested.find((item) => item && typeof item === "object");
      if (first) return first as JsonRecord;
    }
    if (nested && typeof nested === "object") return nested as JsonRecord;
  }

  return root;
}

function pickString(candidate: JsonRecord | null | undefined, keys: string[]) {
  for (const key of keys) {
    const value = candidate?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function pickBoolean(candidate: JsonRecord | null | undefined, keys: string[]) {
  for (const key of keys) {
    const value = candidate?.[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "1", "y", "тийм"].includes(normalized)) return true;
      if (["false", "no", "0", "n", "үгүй"].includes(normalized)) return false;
    }
  }
  return null;
}

function inferFound(
  candidate: JsonRecord,
  tin: string | null,
  registrationNumber: string | null,
  name: string | null,
) {
  const status = pickString(candidate, ["status", "resultCode", "code", "message"])?.toLowerCase();
  if (status && ["not_found", "not found", "404", "empty"].some((item) => status.includes(item))) {
    return false;
  }
  if (candidate?.success === false || candidate?.found === false) return false;
  return Boolean(
    tin || registrationNumber || name || candidate?.success === true || candidate?.found === true,
  );
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function normalizePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function normalizeMethod(value: string): LookupMethod {
  return value.toUpperCase() === "GET" ? "GET" : "POST";
}

function isConfiguredPath(value: string): boolean {
  const trimmed = value.trim();
  return Boolean(trimmed) && !trimmed.startsWith("TODO_");
}

function normalizeLookupValue(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function normalizeSegment(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function parseMaybeJson(text: string): unknown {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function shortText(text: string): string {
  return text.length > 240 ? `${text.slice(0, 240)}...` : text;
}

function skipped(message: string): EbarimtLookupResponse {
  return {
    configured: false,
    skipped: true,
    record: null,
    message,
  };
}

function envValue(name: string) {
  const value = process.env[name]?.trim();
  return value && !value.startsWith("TODO_") ? value : "";
}
