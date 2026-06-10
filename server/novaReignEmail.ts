/**
 * Nova Reign Vault — Email Helper
 * Sends OTP verification emails from noreply@novareign.ai
 * Uses the paid Resend account (re_aqKz...) for verified sending.
 */
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Nova Reign <noreply@novareign.ai>";
const REPLY_TO = "vault@novareign.ai";

export async function sendNovaReignVerificationEmail(
  toEmail: string,
  code: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    replyTo: REPLY_TO,
    subject: `${code} — Your Nova Reign Vault Access Code`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova Reign Vault Access</title>
</head>
<body style="margin:0;padding:0;background:#0a0008;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0008;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#120010;border-radius:12px;border:1px solid #9B1FFF44;overflow:hidden;max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a0008 0%,#1a0025 50%,#0d0015 100%);padding:36px 40px;text-align:center;border-bottom:2px solid #9B1FFF;">
              <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.4em;color:#9B1FFF;text-transform:uppercase;">Official Video Vault</p>
              <h1 style="margin:0;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:0.05em;">NOVA REIGN</h1>
              <p style="margin:8px 0 0 0;font-size:13px;color:#aa88cc;">novareign.ai · Exclusive Content Access</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#ddc8ee;line-height:1.6;">
                Welcome to the <strong style="color:#9B1FFF;">Nova Reign Vault</strong>. Enter the verification code below to confirm your email and unlock access to weekly updates, exclusive teasers, and first access to new content.
              </p>
              <!-- OTP Box -->
              <div style="background:#0a0008;border:2px solid #9B1FFF;border-radius:10px;padding:28px;text-align:center;margin:24px 0;">
                <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.3em;color:#aa88cc;text-transform:uppercase;">Your Vault Access Code</p>
                <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:0.25em;color:#9B1FFF;font-family:'Courier New',monospace;">${code}</p>
                <p style="margin:12px 0 0 0;font-size:12px;color:#664477;">Expires in 10 minutes</p>
              </div>
              <p style="margin:0 0 16px 0;font-size:14px;color:#aa88cc;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your email will not be added to the vault without verification.
              </p>
              <p style="margin:0;font-size:14px;color:#aa88cc;line-height:1.6;">
                Once verified, you'll receive <strong style="color:#ffffff;">weekly Nova Reign updates</strong> — exclusive music, video teasers, and first-access content drops.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0a0008;padding:24px 40px;border-top:1px solid #2a0035;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#664477;">
                <a href="https://novareign.ai" style="color:#9B1FFF;text-decoration:none;">novareign.ai</a>
              </p>
              <p style="margin:0;font-size:11px;color:#442255;">
                You are receiving this because you requested vault access at novareign.ai
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
    text: `Your Nova Reign Vault access code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.\n\nnovareign.ai`,
  });

  if (error) {
    console.error("[Resend] Failed to send Nova Reign vault email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
