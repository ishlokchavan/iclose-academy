/**
 * Google Tag Manager helpers. The container script is mounted once at the
 * root layout (see GoogleTagManager.tsx) and only renders when
 * NEXT_PUBLIC_GTM_ID is set, so local dev without the env var stays clean.
 *
 * Push custom events from any client component via `dataLayerPush(...)`.
 * Server-side events (API routes, server actions) cannot push directly —
 * they fire when the client re-mounts and reads the new state, or you can
 * surface them via a URL param the client picks up.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type AnalyticsEvent =
  // Auth funnel
  | { event: "signin_complete";  method?: "password" | "otp"; role?: string }
  | { event: "signup_complete";  method?: "password" }
  | { event: "signout" }
  // Referral funnel
  | { event: "referral_link_copied"; code: string; surface: "profile" | "drawer" }
  | { event: "referral_link_shared"; code: string; surface: "profile" | "drawer" }
  | { event: "lead_submitted";       intent?: string | null; referredByCode?: string | null }
  | { event: "referral_conversion";  referrerCode: string; tier: number }
  // Engagement
  | { event: "member_drawer_opened"; memberId: string }
  | { event: "view_mode_changed";    view: "table" | "tree" }
  // Escape hatch
  | { event: string; [k: string]: unknown };

export function dataLayerPush(payload: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload as Record<string, unknown>);
}

export function getGtmId(): string | null {
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  return id && /^GTM-[A-Z0-9]{4,}$/.test(id) ? id : null;
}
