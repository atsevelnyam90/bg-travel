// CosoLine / CallPro SMS.
//
// winu дээрх хувилбар нь тохиргоог модуль ачаалагдах үед process.env-ээс уншиж,
// winu-гийн утасны дугаар, sender ID-г default болгож байсан. Package-д тэр
// болохгүй тул тохиргоог ЗААВАЛ дамжуулна.

export type SmsConfig = {
  /** Жишээ: "https://api-text.callpro.mn/v1/sms" */
  baseUrl: string;
  apiKey: string;
  /** Илгээгчийн дугаар / sender ID */
  from: string;
  timeoutMs?: number;
};

export type SendSmsInput = {
  to: string;
  text: string;
};

export type SendSmsResult = {
  status?: string;
  messageId?: string;
};

export class SmsError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "SmsError";
    this.status = status;
  }
}

type CosoResponse = {
  status?: string;
  message_id?: string;
  error?: string;
  reason?: string;
};

export function createSmsClient(config: SmsConfig) {
  if (!config.apiKey) throw new SmsError("SMS apiKey тохируулаагүй байна");
  if (!config.from) throw new SmsError("SMS from (sender) тохируулаагүй байна");

  const timeoutMs = config.timeoutMs ?? 15_000;

  return {
    async send({ to, text }: SendSmsInput): Promise<SendSmsResult> {
      const response = await fetch(`${config.baseUrl}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
        },
        body: JSON.stringify({ from: config.from, to, text }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      const raw = (await response.json().catch(() => ({}))) as CosoResponse;

      if (!response.ok) {
        throw new SmsError(raw.error ?? raw.reason ?? "SMS илгээхэд алдаа гарлаа", response.status);
      }

      return { status: raw.status, messageId: raw.message_id };
    },
  };
}

export type SmsClient = ReturnType<typeof createSmsClient>;
