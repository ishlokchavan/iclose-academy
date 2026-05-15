import "server-only";

import { FROM, mailer } from "./mailer";

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await mailer.sendMail({
    from: FROM,
    to,
    subject: `${code} — your iClose Academy sign-in code`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#111">
        <p style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 16px">iClose Academy</p>
        <h1 style="font-size:28px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px">Your sign-in code</h1>
        <p style="font-size:15px;color:#555;margin:0 0 32px">Use the code below to sign in. It expires in 10 minutes.</p>
        <div style="background:#f5f5f5;border-radius:12px;padding:24px;text-align:center;letter-spacing:0.5em;font-size:36px;font-weight:700;font-family:monospace;color:#111;margin-bottom:32px">${code}</div>
        <p style="font-size:13px;color:#888;margin:0">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
