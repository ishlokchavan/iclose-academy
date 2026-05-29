import "server-only";

import { getFrom, getMailer } from "./mailer";

export async function sendPartnerInviteEmail(
  to: string,
  name: string,
  inviteLink: string,
): Promise<void> {
  await getMailer().sendMail({
    from: getFrom(),
    to,
    subject: "Your iClose Academy partner access",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#111">
        <p style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 16px">iClose Academy · Partners</p>
        <h1 style="font-size:28px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px">You're invited</h1>
        <p style="font-size:15px;color:#555;margin:0 0 32px">Hi ${name}, your partner account is ready. Click below to set your password and access your dashboard.</p>
        <a href="${inviteLink}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:32px">Set my password</a>
        <p style="font-size:13px;color:#888;margin:0">This link expires in 7 days. If you didn't expect this, you can ignore it.</p>
      </div>
    `,
  });
}
