import { env } from "@/lib/env";
import type { MailInput } from "./mailer";

// Энгийн inline HTML — и-мэйл клиентүүд орчин үеийн CSS-ийг дэмждэггүй тул
// table/inline style нь найдвартай. Загвар олшровол MJML руу шилжинэ.
const wrap = (title: string, body: string, cta?: { label: string; url: string }) => `
<!doctype html>
<html lang="mn"><body style="margin:0;padding:24px;background:#f6f6f7;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <tr><td>
      <h1 style="margin:0 0 16px;font-size:20px;color:#111;">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#444;">${body}</div>
      ${
        cta
          ? `<p style="margin:24px 0 0;"><a href="${cta.url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;">${cta.label}</a></p>
             <p style="margin:16px 0 0;font-size:12px;color:#888;word-break:break-all;">Товч ажиллахгүй бол: ${cta.url}</p>`
          : ""
      }
    </td></tr>
  </table>
</body></html>`;

export function inviteEmail(input: {
  to: string;
  inviterName: string;
  organizationName: string;
  token: string;
}): MailInput {
  const url = `${env.APP_URL}/accept-invite?token=${encodeURIComponent(input.token)}`;

  return {
    to: input.to,
    subject: `${input.organizationName} — урилга`,
    text: `${input.inviterName} таныг ${input.organizationName}-д урьж байна.\n\nЭнэ холбоосоор нэвтэрнэ үү: ${url}\n\nХолбоос 7 хоног хүчинтэй.`,
    html: wrap(
      `${input.organizationName} — урилга`,
      `<p><strong>${input.inviterName}</strong> таныг <strong>${input.organizationName}</strong>-д урьж байна.</p>
       <p>Доорх товчийг дарж нууц үгээ тохируулна уу. Холбоос <strong>7 хоног</strong> хүчинтэй.</p>`,
      { label: "Урилгыг хүлээн авах", url },
    ),
  };
}
