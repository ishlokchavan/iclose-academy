import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { buildReferrerChain } from "./referrer";

export type MemberRow = {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  intent: string | null;        // 'closer' | 'buyer' | 'other' | null (free text)
  focus: string[] | null;
  plan_key: string;
  is_verified: boolean;
  verified_at: string | null;
  consent_marketing: boolean;
  consented_at: string | null;
  user_agent: string | null;
  referer: string | null;
  referral_code: string | null;
  referral_count: number;       // direct referrals
  network_size: number;         // total downstream (all tiers)
  created_at: string;
  source: string | null;
  referred_by_code: string | null;
  referred_by_lead_id: string | null;
  clicks: number;
  unique_visitors: number;
  /** Resolved referrer for table display. Null if organic or unresolvable. */
  referred_by_name: string | null;
  referred_by_kind: "member" | "partner" | null;
  /** True if referred_by_kind is "partner" and the partner is archived. */
  referred_by_archived: boolean;
};

// Kept as one literal string so Supabase's generated typings can narrow
// the response shape. Keep both call sites in sync if you edit this.
const LEAD_FIELDS =
  "id, name, first_name, last_name, email, phone, intent, focus, plan_key, is_verified, verified_at, consent_marketing, consented_at, user_agent, referer, referral_code, referral_count, created_at, source, referred_by_code, referred_by_lead_id";

export type TreeNode = {
  id: string;
  name: string | null;
  email: string;
  referral_code: string | null;
  created_at: string;
  is_verified: boolean;
  depth: number;
  children: TreeNode[];
};

/**
 * The minimal shape the <MembersTree> org-chart needs to render a node.
 * `MemberRow` satisfies this; the partner referral tree maps its rows to it
 * too, so both can reuse the same component.
 *
 * `kind` lets a partner appear as a root in the same forest as members — they
 * sit on top of their member networks, so partner-referred members no longer
 * fall into the "Independent" bucket. `archived` dims the partner node and
 * swaps its pill so historical attribution stays visible without making them
 * look operationally live.
 */
export type TreeMember = {
  id: string;
  name: string | null;
  email: string;
  referral_code: string | null;
  referred_by_code: string | null;
  is_verified: boolean;
  intent: string | null;
  kind?: "member" | "partner";
  archived?: boolean;
};

export type AncestorNode = {
  id: string;
  name: string | null;
  email: string;
  referral_code: string | null;
  depth: number; // 2 = direct referrer, 3 = referrer's referrer, ...
  /** Whether this ancestor is a fellow member or a partner. */
  kind: "member" | "partner";
};

export type MemberDetail = {
  lead: MemberRow;
  /** Flat count of direct downstream referrals (depth = 1). */
  directReferralCount: number;
  /** Total nodes in the entire downstream tree. */
  totalDownstreamCount: number;
  /** Forest of direct referrals; each may have nested children. */
  downstreamTree: TreeNode[];
  /** The immediate referrer (member or partner), or null if organic. */
  referredBy: AncestorNode | null;
  /** Upstream chain from immediate referrer (depth 2) up to root. */
  ancestors: AncestorNode[];
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

export type MembersOverview = {
  totalMembers: number;
  totalClicks: number;
  totalReferrals: number;
  activeReferrers: number; // members with ≥1 referral
};

export async function getMembersOverview(): Promise<MembersOverview> {
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
    totalMembers: leadsCount ?? 0,
    totalClicks: clicksCount ?? 0,
    totalReferrals: referralsCount ?? 0,
    activeReferrers: activeCount ?? 0,
  };
}

export async function getAllMembers(): Promise<MemberRow[]> {
  const admin = createSupabaseAdminClient();

  const [{ data: leads, error }, { data: partners }] = await Promise.all([
    admin
      .from("leads")
      .select(LEAD_FIELDS)
      .order("referral_count", { ascending: false })
      .order("created_at", { ascending: false }),
    admin.from("partners").select("id, name, email, code, status"),
  ]);

  if (error || !leads) return [];

  // Build a code → (kind, name) map for resolving each member's referrer
  // ("Referred by" column). Codes are canonical-uppercase; we compare with
  // upper() so legacy lowercase partner codes still match.
  type ReferrerInfo = { name: string; kind: "member" | "partner"; archived: boolean };
  const referrerByCode = new Map<string, ReferrerInfo>();
  for (const l of leads) {
    if (l.referral_code) {
      referrerByCode.set(l.referral_code.toUpperCase(), {
        name: l.name || l.email,
        kind: "member",
        archived: false,
      });
    }
  }
  // Member codes win on collision (shouldn't happen — we guard at write time).
  for (const p of partners ?? []) {
    const key = (p.code ?? "").toUpperCase();
    if (key && !referrerByCode.has(key)) {
      referrerByCode.set(key, {
        name: p.name || p.email,
        kind: "partner",
        archived: p.status === "archived",
      });
    }
  }

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

  // Build a code -> direct-children map once, then DFS to compute total
  // downstream size for each lead. O(N) for the index, O(N) per DFS in the
  // worst case which is fine for the expected dataset size.
  const childrenByCode = new Map<string, string[]>();
  for (const l of leads) {
    if (!l.referred_by_code) continue;
    const parentCode = l.referred_by_code;
    if (!l.referral_code) continue;
    const arr = childrenByCode.get(parentCode) ?? [];
    arr.push(l.referral_code);
    childrenByCode.set(parentCode, arr);
  }
  const directCountByCode = new Map<string, number>();
  for (const l of leads) {
    if (l.referred_by_code) {
      directCountByCode.set(l.referred_by_code, (directCountByCode.get(l.referred_by_code) ?? 0) + 1);
    }
  }
  function networkSize(rootCode: string | null): number {
    if (!rootCode) return 0;
    let total = 0;
    const stack = [rootCode];
    const seen = new Set<string>();
    while (stack.length) {
      const code = stack.pop()!;
      if (seen.has(code)) continue;
      seen.add(code);
      const kids = childrenByCode.get(code) ?? [];
      total += kids.length;
      for (const k of kids) stack.push(k);
    }
    return total;
  }

  return leads.map((l) => {
    const stats = l.referral_code ? clickStats[l.referral_code] : undefined;
    const refKey = l.referred_by_code ? l.referred_by_code.toUpperCase() : null;
    const referrer = refKey ? referrerByCode.get(refKey) : null;
    return {
      ...l,
      clicks: stats?.clicks ?? 0,
      unique_visitors: stats?.unique ?? 0,
      network_size: networkSize(l.referral_code),
      referred_by_name: referrer?.name ?? null,
      referred_by_kind: referrer?.kind ?? null,
      referred_by_archived: referrer?.archived ?? false,
    };
  });
}

export async function getMemberById(leadId: string): Promise<MemberDetail | null> {
  const admin = createSupabaseAdminClient();

  const { data: lead, error } = await admin
    .from("leads")
    .select(
      LEAD_FIELDS,
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error || !lead) return null;

  const [descRes, ancestorChain, clicksRes] = await Promise.all([
    lead.referral_code
      ? admin.rpc("referral_tree_descendants", { p_code: lead.referral_code, p_max_depth: 10 })
      : Promise.resolve({ data: [] }),
    // Walk upward by code (the old referral_tree_ancestors RPC keyed on
    // referred_by_lead_id, which is never populated, so it always returned
    // nothing). This resolves each hop to a member or partner.
    buildReferrerChain(lead.referred_by_code),
    lead.referral_code
      ? admin
          .from("referral_clicks")
          .select(
            "id, created_at, visitor_id, landing_path, referer, user_agent, country, converted_lead_id",
          )
          .eq("code", lead.referral_code)
          .order("created_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [] as MemberDetail["clicks"] }),
  ]);

  const clickRows = clicksRes.data ?? [];
  const uniqueVisitors = new Set(
    clickRows.map((r) => r.visitor_id).filter(Boolean) as string[],
  ).size;

  // Build the downstream forest from the flat depth-ordered rows.
  const descendants = (descRes.data ?? []) as Array<{
    id: string;
    email: string;
    name: string | null;
    referral_code: string | null;
    referred_by_code: string | null;
    referred_by_lead_id: string | null;
    created_at: string;
    is_verified: boolean;
    depth: number;
    parent_id: string | null;
  }>;
  const byId = new Map<string, TreeNode>();
  for (const d of descendants) {
    byId.set(d.id, {
      id: d.id,
      name: d.name,
      email: d.email,
      referral_code: d.referral_code,
      created_at: d.created_at,
      is_verified: d.is_verified,
      depth: d.depth,
      children: [],
    });
  }
  const forest: TreeNode[] = [];
  for (const d of descendants) {
    const node = byId.get(d.id)!;
    if (d.depth === 1) {
      forest.push(node);
    } else if (d.parent_id && byId.has(d.parent_id)) {
      byId.get(d.parent_id)!.children.push(node);
    } else {
      // Parent missing — surface at root rather than dropping the node.
      forest.push(node);
    }
  }

  const ancestors: AncestorNode[] = ancestorChain.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email ?? "",
    referral_code: a.code,
    depth: a.depth,
    kind: a.kind,
  }));

  return {
    lead: {
      ...lead,
      clicks: clickRows.length,
      unique_visitors: uniqueVisitors,
      network_size: descendants.length,
      referred_by_name: ancestors[0]?.name ?? null,
      referred_by_kind: ancestors[0]?.kind ?? null,
      // Drawer doesn't render this flag today; default to false to satisfy
      // the MemberRow shape without an extra DB hop in this path.
      referred_by_archived: false,
    },
    directReferralCount: forest.length,
    totalDownstreamCount: descendants.length,
    downstreamTree: forest,
    referredBy: ancestors[0] ?? null,
    ancestors,
    clicks: clickRows,
  };
}

/** Fetch the current user's affiliate context by email. */
export async function getMemberByEmail(email: string): Promise<{
  code: string;
  referralCount: number;
  networkSize: number;
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

  const [{ data: stats }, { data: tree }] = await Promise.all([
    admin.rpc("referral_stats_for_code", { p_code: lead.referral_code }).maybeSingle(),
    admin.rpc("referral_tree_descendants", { p_code: lead.referral_code, p_max_depth: 10 }),
  ]);

  return {
    code: lead.referral_code,
    leadId: lead.id,
    referralCount: lead.referral_count ?? 0,
    networkSize: Array.isArray(tree) ? tree.length : 0,
    clicks: Number(stats?.total_clicks ?? 0),
    uniqueVisitors: Number(stats?.unique_visitors ?? 0),
  };
}

/**
 * All nodes for the unified referral org-chart: every member, plus every
 * partner that has at least one direct signup. Partners surface as roots
 * (referred_by_code = null), so partner-referred members appear under them
 * instead of being mislabeled as "Independent".
 */
export async function getNetworkTreeNodes(): Promise<TreeMember[]> {
  const admin = createSupabaseAdminClient();

  const [{ data: leads }, { data: partners }] = await Promise.all([
    admin
      .from("leads")
      .select("id, name, email, referral_code, referred_by_code, is_verified, intent"),
    admin.from("partners").select("id, name, email, code, status"),
  ]);

  const memberNodes: TreeMember[] = (leads ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    referral_code: l.referral_code,
    referred_by_code: l.referred_by_code,
    is_verified: l.is_verified,
    intent: l.intent ?? null,
    kind: "member",
  }));

  // Only include partners that actually have a downstream — keeps the tree
  // focused and avoids a "wall of partners with 0 referrals" cluttering it.
  const referredCodes = new Set(
    memberNodes
      .map((m) => m.referred_by_code?.toUpperCase())
      .filter((c): c is string => !!c),
  );

  const partnerNodes: TreeMember[] = (partners ?? [])
    .filter((p) => referredCodes.has((p.code ?? "").toUpperCase()))
    .map((p) => ({
      id: `partner:${p.id}`,
      name: p.name,
      email: p.email,
      referral_code: (p.code ?? "").toUpperCase(),
      referred_by_code: null,
      is_verified: true,
      intent: null,
      kind: "partner",
      archived: p.status === "archived",
    }));

  // Normalize member nodes' codes to uppercase so partner-root matching works
  // against legacy lowercase partner codes too.
  for (const m of memberNodes) {
    if (m.referred_by_code) m.referred_by_code = m.referred_by_code.toUpperCase();
    if (m.referral_code) m.referral_code = m.referral_code.toUpperCase();
  }

  return [...partnerNodes, ...memberNodes];
}
