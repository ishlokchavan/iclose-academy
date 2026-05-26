import "server-only";

import { getFrom, getMailer } from "./mailer";

export type ReferralSignupEmailInput = {
  /** Referrer's email (the person who shared the link). */
  to: string;
  /** Referrer's name — used for personal greeting. Falls back to "there". */
  referrerName: string | null;
  /** Display name of the new member who just signed up. */
  referredName: string;
  /** Referrer's current total direct referrals (after this signup). */
  totalReferrals: number;
  /** Referrer's own referral code so the email can re-show the link. */
  referralCode: string;
  /** Origin to build the shareable referral link with. */
  marketingUrl: string;
};

function firstName(full: string | null): string {
  if (!full) return "there";
  const part = full.trim().split(/\s+/)[0];
  return part || "there";
}

export async function sendReferralSignupEmail(
  input: ReferralSignupEmailInput,
): Promise<void> {
  const greeting = firstName(input.referrerName);
  const link = `${input.marketingUrl.replace(/\/+$/, "")}/?ref=${encodeURIComponent(input.referralCode)}`;
  const countLine =
    input.totalReferrals === 1
      ? "That's your first referral — well done."
      : `That brings your total to ${input.totalReferrals} direct referrals.`;

  await getMailer().sendMail({
    from: getFrom(),
    to: input.to,
    subject: `${input.referredName} just joined through your link`,
    text: [
      `Hi ${greeting},`,
      ``,
      `${input.referredName} just signed up to iClose using your referral link.`,
      ``,
      countLine,
      ``,
      `Your link: ${link}`,
      `Your code: ${input.referralCode}`,
      ``,
      `Keep sharing — every signup helps us reach more closers across the country.`,
      ``,
      `— iClose`,
    ].join("\n"),
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#111">
        <p style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 16px">iClose</p>
        <h1 style="font-size:26px;font-weight:700;margin:0 0 12px;letter-spacing:-0.5px">${input.referredName} just joined.</h1>
        <p style="font-size:16px;color:#333;margin:0 0 8px;line-height:1.5">
          Hi ${greeting} — someone you shared iClose with just signed up.
        </p>
        <p style="font-size:15px;color:#555;margin:0 0 28px;line-height:1.5">${countLine}</p>

        <div style="background:#f7f7f8;border:1px solid #eee;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin:0 0 8px">Your referral link</p>
          <a href="${link}" style="font-family:ui-monospace,SF-Mono,monospace;font-size:13px;color:#0071e3;text-decoration:none;word-break:break-all">${link}</a>
          <p style="font-size:11px;color:#999;margin:10px 0 0">Code: <code style="font-family:ui-monospace,SF-Mono,monospace;font-size:11px;color:#444">${input.referralCode}</code></p>
        </div>

        <p style="font-size:13px;color:#888;margin:0;line-height:1.6">
          Keep sharing — every signup helps us reach more closers across the country.
        </p>
      </div>
    `,
  });
}
