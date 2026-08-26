type EbarimtHttpMethod = "GET" | "POST" | "DELETE";

export interface EbarimtClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

export class EbarimtClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly configured: boolean;

  constructor(options: EbarimtClientOptions = {}) {
    const configuredBaseUrl = options.baseUrl || process.env.EBARIMT_POS_API_BASE_URL || "";
    this.configured = Boolean(configuredBaseUrl.trim()) && !configuredBaseUrl.startsWith("TODO_");
    this.baseUrl = this.configured ? normalizeBaseUrl(configuredBaseUrl) : "";
    this.timeoutMs = Number(options.timeoutMs || process.env.EBARIMT_TIMEOUT_MS || 8000);
  }

  getInfo(): Promise<unknown> {
    return this.request("GET", "/rest/info");
  }

  createReceipt(payload: unknown): Promise<unknown> {
    return this.request("POST", "/rest/receipt", payload);
  }

  deleteReceipt(payload: unknown): Promise<unknown> {
    return this.request("DELETE", "/rest/receipt", payload);
  }

  sendData(): Promise<unknown> {
    return this.request("GET", "/rest/sendData");
  }

  private async request(
    method: EbarimtHttpMethod,
    path: string,
    payload?: unknown,
  ): Promise<unknown> {
    if (!this.configured) {
      return {
        success: true,
        skipped: true,
        method,
        path,
        message: "EBarimt POS API is not configured; request was skipped.",
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await globalThis.fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          ...(payload === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: payload === undefined ? undefined : JSON.stringify(payload),
        signal: controller.signal,
      });

      const text = await response.text().catch(() => "");
      const parsed = parseMaybeJson(text);
      if (!response.ok) {
        throw new Error(
          `EBarimt POS ${method} ${path} failed: ${response.status} ${shortText(text)}`,
        );
      }
      return parsed;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
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
