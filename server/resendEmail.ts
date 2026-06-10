import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// novareign.ai is the verified Resend sending domain (herobase.io requires plan upgrade)
// Emails come from noreply@novareign.ai with reply-to herobase.io
const FROM_EMAIL = "$HERO NFT <noreply@novareign.ai>";
const REPLY_TO = "noreply@herobase.io";

export async function sendVerificationEmail(
  toEmail: string,
  code: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    replyTo: REPLY_TO,
    subject: `${code} — Your $HERO NFT Waitlist Verification Code`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$HERO NFT Verification</title>
</head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#12192a;border-radius:12px;border:1px solid #C9A84C33;overflow:hidden;max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d1a2e 0%,#1a2a45 100%);padding:36px 40px;text-align:center;border-bottom:2px solid #C9A84C;">
              <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.4em;color:#C9A84C;text-transform:uppercase;">Heroes Hall of Honor</p>
              <h1 style="margin:0;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:0.05em;">$HERO NFT</h1>
              <p style="margin:8px 0 0 0;font-size:13px;color:#8899aa;">Animated NFT Collection · PulseChain &amp; BASE</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px 0;font-size:16px;color:#ccd6e0;line-height:1.6;">
                You're one step away from joining the <strong style="color:#C9A84C;">$HERO NFT waitlist</strong>. Enter the verification code below to confirm your email address.
              </p>
              <!-- OTP Box -->
              <div style="background:#0d1117;border:2px solid #C9A84C;border-radius:10px;padding:28px;text-align:center;margin:0 0 28px 0;">
                <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.3em;color:#8899aa;text-transform:uppercase;">Your Verification Code</p>
                <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:0.25em;color:#C9A84C;font-family:'Courier New',monospace;">${code}</p>
                <p style="margin:12px 0 0 0;font-size:12px;color:#556677;">Expires in 10 minutes</p>
              </div>
              <p style="margin:0 0 16px 0;font-size:14px;color:#8899aa;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your email will not be added to the waitlist without verification.
              </p>
              <p style="margin:0;font-size:14px;color:#8899aa;line-height:1.6;">
                Once verified, you'll be among the first to receive <strong style="color:#ffffff;">$HERO launch updates</strong>, exclusive mint access, and Hero Letters.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0d1117;padding:24px 40px;border-top:1px solid #1e2d40;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#556677;">
                <a href="https://herobase.io" style="color:#C9A84C;text-decoration:none;">herobase.io</a>
                &nbsp;·&nbsp;
                <a href="https://herobase.io/nft" style="color:#C9A84C;text-decoration:none;">NFT Collection</a>
              </p>
              <p style="margin:0;font-size:11px;color:#3a4a5a;">
                Honoring first responders and military heroes worldwide.
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
    text: `Your $HERO NFT waitlist verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.\n\nherobase.io`,
  });

  if (error) {
    console.error("[Resend] Failed to send verification email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
