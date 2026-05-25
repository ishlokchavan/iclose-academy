import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AffiliateRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  referral_code: string | null;
  referral_count: number;
  created_at: string;
  source: string | null;
  referred_by_code: string | null;
  referred_by_lead_id: string | null;
  clicks: number;
  unique_visitors: number;
};

export type AffiliateDetail = {
  lead: AffiliateRow;
  referredLeads: Array<{
    id: string;
    name: string | null;
    email: string;
    created_at: string;
    is_verified: boolean;
  }>;
  referrer: {
    id: string;
    name: string | null;
    email: string;
    referral_code: string | null;
  } | null;
  clicks: Array<{
    id: string;
    created_at: string;
    visitor_id: string | null;
    landing_path: string | null;
    referer: string | null;
    user_agent: string | null;
    country: string | null;
    converted_lead_id: string | null;
  }>;
};

export type AffiliateOverview = {
  totalAffiliates: number;
  totalClicks: number;
  totalReferrals: number;
  activeAffiliates: number; // affiliates with ≥1 referral
};

export async function getAffiliateOverview(): Promise<AffiliateOverview> {
  const admin = createSupabaseAdminClient();

  const [{ count: leadsCount }, { count: clicksCount }, { count: referralsCount }, { count: activeCount }] =
    await Promise.all([
      admin.from("leads").select("id", { count: "exact", head: true }),
      admin.from("referral_clicks").select("id", { count: "exact", head: true }),
      admin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .not("referred_by_code", "is", null),
      admin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gt("referral_count", 0),
    ]);

  return {
    totalAffiliates: leadsCount ?? 0,
    totalClicks: clicksCount ?? 0,
    totalReferrals: referralsCount ?? 0,
    activeAffiliates: activeCount ?? 0,
  };
}

export async function getAllAffiliates(): Promise<AffiliateRow[]> {
  const admin = createSupabaseAdminClient();

  const { data: leads, error } = await admin
    .from("leads")
    .select(
      "id, name, email, phone, referral_code, referral_count, created_at, source, referred_by_code, referred_by_lead_id",
    )
    .order("referral_count", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !leads) return [];

  // Group clicks by code in a single round-trip.
  const codes = leads.map((l) => l.referral_code).filter(Boolean) as string[];
  const clickStats: Record<string, { clicks: number; unique: number }> = {};

  if (codes.length > 0) {
    const { data: clickRows } = await admin
      .from("referral_clicks")
      .select("code, visitor_id")
      .in("code", codes);

    if (Array.isArray(clickRows)) {
      const visitorSetByCode: Record<string, Set<string>> = {};
      for (const row of clickRows) {
        const code = row.code;
        if (!clickStats[code]) clickStats[code] = { clicks: 0, unique: 0 };
        clickStats[code].clicks += 1;
        if (row.visitor_id) {
          if (!visitorSetByCode[code]) visitorSetByCode[code] = new Set();
          visitorSetByCode[code].add(row.visitor_id);
        }
      }
      for (const [code, visitorSet] of Object.entries(visitorSetByCode)) {
        const stats = clickStats[code];
        if (stats) stats.unique = visitorSet.size;
      }
    }
  }

  return leads.map((l) => {
    const stats = l.referral_code ? clickStats[l.referral_code] : undefined;
    return {
      ...l,
      clicks: stats?.clicks ?? 0,
      unique_visitors: stats?.unique ?? 0,
    };
  });
}

export async function getAffiliateById(leadId: string): Promise<AffiliateDetail | null> {
  const admin = createSupabaseAdminClient();

  const { data: lead, error } = await admin
    .from("leads")
    .select(
      "id, name, email, phone, referral_code, referral_count, created_at, source, referred_by_code, referred_by_lead_id",
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error || !lead) return null;

  const [referredLeadsRes, referrerRes, clicksRes] = await Promise.all([
    lead.referral_code
      ? admin
          .from("leads")
          .select("id, name, email, created_at, is_verified")
          .eq("referred_by_code", lead.referral_code)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ id: string; name: string | null; email: string; created_at: string; is_verified: boolean }> }),
    lead.referred_by_lead_id
      ? admin
          .from("leads")
          .select("id, name, email, referral_code")
          .eq("id", lead.referred_by_lead_id)
          .maybeSingle()
      : Promise.resolve({ data: null as { id: string; name: string | null; email: string; referral_code: string | null } | null }),
    lead.referral_code
      ? admin
          .from("referral_clicks")
          .select(
            "id, created_at, visitor_id, landing_path, referer, user_agent, country, converted_lead_id",
          )
          .eq("code", lead.referral_code)
          .order("created_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [] as AffiliateDetail["clicks"] }),
  ]);

  const clickRows = clicksRes.data ?? [];
  const uniqueVisitors = new Set(
    clickRows.map((r) => r.visitor_id).filter(Boolean) as string[],
  ).size;

  return {
    lead: {
      ...lead,
      clicks: clickRows.length,
      unique_visitors: uniqueVisitors,
    },
    referredLeads: referredLeadsRes.data ?? [],
    referrer: referrerRes.data ?? null,
    clicks: clickRows,
  };
}

/** Fetch the current user's affiliate context by email. */
export async function getAffiliateByEmail(email: string): Promise<{
  code: string;
  referralCount: number;
  clicks: number;
  uniqueVisitors: number;
  leadId: string;
} | null> {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("leads")
    .select("id, referral_code, referral_count")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1);

  const lead = data?.[0];
  if (!lead?.referral_code) return null;

  const { data: stats } = await admin
    .rpc("referral_stats_for_code", { p_code: lead.referral_code })
    .maybeSingle();

  return {
    code: lead.referral_code,
    leadId: lead.id,
    referralCount: lead.referral_count ?? 0,
    clicks: Number(stats?.total_clicks ?? 0),
    uniqueVisitors: Number(stats?.unique_visitors ?? 0),
  };
}
