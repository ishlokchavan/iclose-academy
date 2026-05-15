import "server-only";

import { getFrom, getMailer } from "./mailer";

export async function sendResetEmail(to: string, resetLink: string): Promise<void> {
  await getMailer().sendMail({
    from: getFrom(),
    to,
    subject: "Reset your iClose Academy password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#111">
        <p style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 16px">iClose Academy</p>
        <h1 style="font-size:28px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px">Reset your password</h1>
        <p style="font-size:15px;color:#555;margin:0 0 32px">Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:32px">Reset password</a>
        <p style="font-size:13px;color:#888;margin:0">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}
