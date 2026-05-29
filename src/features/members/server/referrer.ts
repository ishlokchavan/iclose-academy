import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { normalizeCode } from "../constants";

export type ReferrerKind = "member" | "partner";

export type ResolvedReferrer = {
  kind: ReferrerKind;
  /** lead id (member) or partner id (partner). */
  id: string;
  name: string | null;
  email: string | null;
  /** Canonical (uppercased) code. */
  code: string;
};

/**
 * Resolve a referral code to whoever owns it — a member (lead) or a partner.
 *
 * Member codes are stored uppercase, so an exact match works. Partner codes
 * may be legacy lowercase ("pspl-hiqi"), so we match case-insensitively. A
 * member match wins if a code somehow exists in both namespaces (creation
 * guards prevent that going forward).
 */
export async function resolveReferrerByCode(
  rawCode: string | null | undefined,
): Promise<ResolvedReferrer | null> {
  const code = normalizeCode(rawCode);
  if (!code) return null;

  const admin = createSupabaseAdminClient();

  const { data: lead } = await admin
    .from("leads")
    .select("id, name, email, referral_code")
    .eq("referral_code", code)
    .maybeSingle();
  if (lead) {
    return { kind: "member", id: lead.id, name: lead.name, email: lead.email, code };
  }

  const { data: partner } = await admin
    .from("partners")
    .select("id, name, email, code")
    .ilike("code", code)
    .maybeSingle();
  if (partner) {
    return { kind: "partner", id: partner.id, name: partner.name, email: partner.email, code };
  }

  return null;
}

export type ChainAncestor = ResolvedReferrer & { depth: number };

/**
 * Walk the referrer chain upward from a starting `referred_by_code`, resolving
 * each hop to a member or partner. The chain stops at the first partner (a
 * partner is always the top of a tree) or when a code resolves to nothing.
 *
 * Returns nearest-first: depth 2 is the immediate referrer, 3 its referrer, …
 * (mirrors the old `referral_tree_ancestors` depth convention so the drawer
 * rendering is unchanged).
 */
export async function buildReferrerChain(
  startReferredByCode: string | null | undefined,
  maxDepth = 12,
): Promise<ChainAncestor[]> {
  const admin = createSupabaseAdminClient();
  const chain: ChainAncestor[] = [];
  const seen = new Set<string>();

  let code = normalizeCode(startReferredByCode);
  let depth = 2;

  while (code && depth < maxDepth + 2 && !seen.has(code)) {
    seen.add(code);
    const ref = await resolveReferrerByCode(code);
    if (!ref) break;

    chain.push({ ...ref, depth });
    if (ref.kind === "partner") break; // partner = top of the tree

    const { data: parent } = await admin
      .from("leads")
      .select("referred_by_code")
      .eq("id", ref.id)
      .maybeSingle();
    code = normalizeCode(parent?.referred_by_code ?? null);
    depth += 1;
  }

  return chain;
}
