/**
 * Canonical public referral URL for a partner code. Path-based (`/ref/CODE`)
 * to match what the marketing site serves. Uses the marketing origin when
 * configured, falling back to the production domain.
 */
export function partnerReferralLink(code: string): string {
  const base = (
    process.env.NEXT_PUBLIC_MARKETING_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://iclose.ae"
  ).replace(/\/+$/, "");
  return `${base}/ref/${encodeURIComponent(code)}`;
}

/** A WhatsApp "click to chat" share URL with a prefilled invite message. */
export function whatsappShareLink(referralLink: string, partnerName?: string): string {
  const intro = partnerName ? `${partnerName}, here's your` : "Here's your";
  const message = `${intro} iClose Academy referral link — share it to invite people to join:\n${referralLink}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
