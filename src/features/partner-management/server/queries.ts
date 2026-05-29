import "server-only";

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
  clicks: number;
  signups: number;
};

export type PartnersOverview = {
  totalPartners: number;
  totalActive: number;
  totalClicks: number;
  totalSignups: number;
};

export async function getAllPartners(): Promise<PartnerAdminRow[]> {
  const admin = createSupabaseAdminClient();

  const [partnersResult, clicksResult, signupsResult] = await Promise.all([
    admin
      .from("partners")
      .select(
        "id, user_id, name, email, phone, code, status, is_verified, verified_at, consent_marketing, consented_at, created_at",
      )
      .order("created_at", { ascending: false }),
    admin.from("referral_clicks").select("code"),
    admin.from("referral_conversions").select("partner_id"),
  ]);

  const partners = partnersResult.data ?? [];

  const clicksByCode = new Map<string, number>();
  for (const click of clicksResult.data ?? []) {
    if (!click.code) continue;
    clicksByCode.set(click.code, (clicksByCode.get(click.code) ?? 0) + 1);
  }

  const signupsByPartner = new Map<string, number>();
  for (const conv of signupsResult.data ?? []) {
    if (!conv.partner_id) continue;
    signupsByPartner.set(conv.partner_id, (signupsByPartner.get(conv.partner_id) ?? 0) + 1);
  }

  return partners.map((p) => ({
    ...p,
    clicks: clicksByCode.get(p.code) ?? 0,
    signups: signupsByPartner.get(p.id) ?? 0,
  }));
}

export async function getPartnersOverview(): Promise<PartnersOverview> {
  const admin = createSupabaseAdminClient();

  const [
    { count: totalPartners },
    { count: totalActive },
    { count: totalClicks },
    { count: totalSignups },
  ] = await Promise.all([
    admin.from("partners").select("id", { count: "exact", head: true }),
    admin.from("partners").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("referral_clicks").select("id", { count: "exact", head: true }),
    admin.from("referral_conversions").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalPartners: totalPartners ?? 0,
    totalActive: totalActive ?? 0,
    totalClicks: totalClicks ?? 0,
    totalSignups: totalSignups ?? 0,
  };
}
