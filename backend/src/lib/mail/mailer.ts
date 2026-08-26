import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * SMTP-ээр и-мэйл илгээх.
 *
 * SMTP сонгосон шалтгаан: ямар ч үйлчилгээ (Resend, SendGrid, Postmark,
 * клиентийн өөрийн Exchange) SMTP дэмждэг. Тодорхой SaaS-д баригдахгүй —
 * handoff-д чухал.
 *
 * Хөгжүүлэлтэд `docker compose`-ийн Mailpit (localhost:1025) — и-мэйл
 * ГАДАГШ явахгүй, http://localhost:8025 дээр хуримтлагдана.
 */
export type MailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } } : {}),
  });
  return transporter;
}

/**
 * И-мэйл илгээнэ.
 *
 * ⚠️ Энэ нь ХҮСЭЛТИЙН ЗАМД ажилладаг. SMTP удаашрах/унах нь хэрэглэгчийн
 * үйлдлийг блоклоно. Тоо нэмэгдэхэд queue (Redis + BullMQ) руу зөөнө —
 * docker compose-д Redis бэлэн байгаа.
 */
export async function sendMail(input: MailInput): Promise<void> {
  if (env.NODE_ENV === "test") return; // тестэд SMTP руу хандахгүй

  try {
    const info = await getTransporter().sendMail({
      from: env.MAIL_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    logger.info({ messageId: info.messageId, to: input.to }, "И-мэйл илгээгдлээ");
  } catch (error) {
    // И-мэйл явахгүй бол үндсэн үйлдлийг унагахгүй — лог руу бичээд үргэлжлүүлнэ.
    // (Урилга үүссэн, зөвхөн мэдэгдэл яваагүй.)
    logger.error({ err: error, to: input.to }, "И-мэйл илгээхэд алдаа");
    throw error;
  }
}
