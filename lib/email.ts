import nodemailer from "nodemailer";

/*
 * Email sending via SMTP. Configure with env vars:
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * When SMTP isn't configured (e.g. local dev / FYP demo), we log the message
 * to the server console instead of sending, so the reset flow stays testable
 * without real credentials.
 */
function getTransport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendPasswordResetEmail(to: string, link: string) {
  const transport = getTransport();

  if (!transport) {
    console.log(`[email] (SMTP not configured) reset link for ${to}: ${link}`);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? "SmartBasket <no-reply@smartbasket.local>",
    to,
    subject: "Reset your SmartBasket password",
    text: `We received a request to reset your SmartBasket password.\n\nReset it here (valid for 1 hour): ${link}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>We received a request to reset your SmartBasket password.</p>
<p><a href="${link}">Choose a new password</a> — this link is valid for 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}
