/**
 * Valor 1775 — Email Helper
 * Sends OTP verification emails from noreply@herobase.io
 * Military-themed branded template. Strength. Purpose. Honor.
 */
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Valor 1775 <noreply@herobase.io>";
const REPLY_TO = "info@1775valor.com";

export async function sendValor1775VerificationEmail(
  toEmail: string,
  code: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    replyTo: REPLY_TO,
    subject: `${code} — Your Valor 1775 Verification Code`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Valor 1775 Verification</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:12px;border:1px solid #C9A84444;overflow:hidden;max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a0a0a 0%,#1a1500 50%,#0d0d00 100%);padding:36px 40px;text-align:center;border-bottom:2px solid #C9A844;">
              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.4em;color:#C9A844;text-transform:uppercase;">Est. 1775 · Semper Fidelis</p>
              <h1 style="margin:0;font-size:36px;font-weight:900;color:#ffffff;letter-spacing:0.08em;">VALOR <span style="color:#C9A844;">1775</span></h1>
              <p style="margin:8px 0 0 0;font-size:12px;color:#888866;letter-spacing:0.15em;text-transform:uppercase;">Strength · Purpose · Honor</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#ccccaa;line-height:1.6;">
                You've requested to join the <strong style="color:#C9A844;">Valor 1775 Waitlist</strong>. Enter the verification code below to confirm your email and secure your spot for early access and exclusive research updates.
              </p>
              <!-- OTP Box -->
              <div style="background:#0a0a0a;border:2px solid #C9A844;border-radius:10px;padding:28px;text-align:center;margin:24px 0;">
                <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.3em;color:#888866;text-transform:uppercase;">Your Verification Code</p>
                <p style="margin:0;font-size:52px;font-weight:900;letter-spacing:0.3em;color:#C9A844;font-family:'Courier New',monospace;">${code}</p>
                <p style="margin:12px 0 0 0;font-size:12px;color:#555544;">Expires in 10 minutes · Do not share</p>
              </div>
              <p style="margin:0 0 16px 0;font-size:14px;color:#888866;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your address will not be added to our list without verification.
              </p>
              <p style="margin:0;font-size:14px;color:#888866;line-height:1.6;">
                Once verified, you'll receive <strong style="color:#ffffff;">priority notifications</strong> when new research compounds become available, along with exclusive early-access pricing.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0a0a0a;padding:24px 40px;border-top:1px solid #222211;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#C9A844;letter-spacing:0.1em;">VALOR 1775</p>
              <p style="margin:0 0 8px 0;font-size:12px;color:#555544;">
                <a href="https://1775valor.com" style="color:#C9A844;text-decoration:none;">1775valor.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#333322;">
                For Research Use Only · Not for Human Consumption<br/>
                You are receiving this because you requested waitlist access at 1775valor.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    text: `Your Valor 1775 verification code is: ${code}\n\nThis code expires in 10 minutes. Do not share it.\n\nIf you didn't request this, ignore this email.\n\nStrength. Purpose. Honor.\nValor 1775 — 1775valor.com\nFor Research Use Only. Not for Human Consumption.`,
  });

  if (error) {
    console.error("[Resend] Failed to send Valor 1775 email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
