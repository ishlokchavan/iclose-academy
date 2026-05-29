/** Single source of truth for referral cookie + URL conventions. */
export const REF_QUERY_PARAM = "ref";
export const REF_COOKIE = "iclose_ref";
export const VISITOR_COOKIE = "iclose_vid";
/** 60 days — typical attribution window. */
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 60;
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Normalize a referral code to its canonical form (uppercase).
 *
 * Both member codes (generated uppercase alphanumeric, e.g. "K7M2QP4R") and
 * partner codes (admin-chosen, may contain dashes, e.g. "PSPL-HIQI") share
 * this single namespace. Member codes are a strict subset of what's accepted
 * here, so existing behaviour is unchanged; partner codes with dashes now
 * survive normalization instead of being silently dropped.
 */
export function normalizeCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  if (!v || !/^[A-Z0-9][A-Z0-9-]{2,39}$/.test(v)) return null;
  return v;
}

export function referralLink(siteUrl: string, code: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}/?${REF_QUERY_PARAM}=${encodeURIComponent(code)}`;
}
