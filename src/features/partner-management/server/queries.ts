import "server-only";

import { normalizeCode } from "@/features/members/constants";
import type { TreeMember } from "@/features/members/server/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PartnerAdminRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  code: string;
  status: string | null;
  is_verified: boolean;
  verified_at: string | null;
  consent_marketing: boolean;
  consented_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  clicks: number;
  signups: number;
};

export type PartnersOverview = {
  totalPartners: number;
  totalActive: number;
  totalClicks: number;
  totalSignups: number;
};

export type PartnerReferralTree = {
  /** Direct signups (leads referred straight by this partner code). */
  directCount: number;
  /** Everyone downstream, all tiers. */
  networkSize: number;
  clicks: number;
  uniqueVisitors: number;
  /** Flat list shaped for <MembersTree>; direct signups surface as roots. */
  nodes: TreeMember[];
};

/**
 * Referral codes live in one namespace (members + partners). Stored member
 * codes and inbound ref codes are uppercase; legacy partner codes may be
 * lowercase, so we compare on the uppercased form everywhere.
 */
function upper(code: string | null | undefined): string {
  return (code ?? "").trim().toUpperCase();
}

export async function getAllPartners(): Promise<PartnerAdminRow[]> {
  const admin = createSupabaseAdminClient();

  const [partnersResult, clicksResult, leadsResult] = await Promise.all([
    admin
      .from("partners")
      .select(
        "id, user_id, name, email, phone, code, status, is_verified, verified_at, consent_marketing, consented_at, created_at, updated_at",
      )
      .order("created_at", { ascending: false }),
    admin.from("referral_clicks").select("code"),
    admin.from("leads").select("referred_by_code").not("referred_by_code", "is", null),
  ]);

  const partners = partnersResult.data ?? [];

  const clicksByCode = new Map<string, number>();
  for (const click of clicksResult.data ?? []) {
    const key = upper(click.code);
    if (!key) continue;
    clicksByCode.set(key, (clicksByCode.get(key) ?? 0) + 1);
  }

  // Signups are derived from leads.referred_by_code — the single source of
  // truth for "who signed up from whom" across both members and partners.
  const signupsByCode = new Map<string, number>();
  for (const lead of leadsResult.data ?? []) {
    const key = upper(lead.referred_by_code);
    if (!key) continue;
    signupsByCode.set(key, (signupsByCode.get(key) ?? 0) + 1);
  }

  return partners.map((p) => {
    const key = upper(p.code);
    return {
      ...p,
      clicks: clicksByCode.get(key) ?? 0,
      signups: signupsByCode.get(key) ?? 0,
    };
  });
}

/**
 * Operational counts exclude archived partners — they exist only as
 * historical tombstones for attribution. Clicks/signups still tally them
 * (the history happened, it should still count toward growth totals).
 */
export async function getPartnersOverview(): Promise<PartnersOverview> {
  const partners = await getAllPartners();
  const live = partners.filter((p) => p.status !== "archived");
  return {
    totalPartners: live.length,
    totalActive: live.filter((p) => p.status !== "inactive").length,
    totalClicks: partners.reduce((sum, p) => sum + p.clicks, 0),
    totalSignups: partners.reduce((sum, p) => sum + p.signups, 0),
  };
}

/**
 * Build a partner's referral tree by reusing the same recursive RPC the
 * Members tree uses. `referral_tree_descendants` roots on
 * `referred_by_code = upper(code)`, so passing the partner code yields its
 * direct signups plus every nested downstream member.
 */
export async function getPartnerReferralTree(code: string): Promise<PartnerReferralTree> {
  const admin = createSupabaseAdminClient();
  const canonical = normalizeCode(code) ?? upper(code);

  // Clicks are matched case-insensitively: the external /ref handler may write
  // codes in their raw (lowercase) form, so we can't rely on an exact match.
  const [descRes, clicksRes] = await Promise.all([
    admin.rpc("referral_tree_descendants", { p_code: canonical, p_max_depth: 10 }),
    admin.from("referral_clicks").select("visitor_id").ilike("code", canonical),
  ]);

  const rows = (descRes.data ?? []) as Array<{
    id: string;
    email: string;
    name: string | null;
    referral_code: string | null;
    referred_by_code: string | null;
    is_verified: boolean;
    depth: number;
  }>;

  const nodes: TreeMember[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    referral_code: r.referral_code,
    referred_by_code: r.referred_by_code,
    is_verified: r.is_verified,
    intent: null, // the RPC doesn't return intent; not needed for the tree
  }));

  const clickRows = clicksRes.data ?? [];
  const uniqueVisitors = new Set(
    clickRows.map((c) => c.visitor_id).filter(Boolean) as string[],
  ).size;

  return {
    directCount: rows.filter((r) => r.depth === 1).length,
    networkSize: rows.length,
    clicks: clickRows.length,
    uniqueVisitors,
    nodes,
  };
}
