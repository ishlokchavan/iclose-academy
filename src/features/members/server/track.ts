import "server-only";

import { createHash, randomUUID } from "crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { normalizeCode } from "../constants";

const hashIp = (ip: string | null) =>
  ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null;

export type RecordClickInput = {
  code: string;
  visitorId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  referer?: string | null;
  landingPath?: string | null;
  country?: string | null;
};

/**
 * Insert a click row. Returns true on success.
 *
 * A code belongs to either a member (lead) or a partner — both share the
 * referral namespace. We record clicks for either; the `lead_id` FK is set
 * only for member codes (partner clicks carry a null lead_id but the `code`
 * column still identifies them). Unknown codes are silently skipped so bots
 * hitting random `?ref=` values don't fill the table.
 */
export async function recordReferralClick(input: RecordClickInput): Promise<boolean> {
  const code = normalizeCode(input.code);
  if (!code) return false;

  const admin = createSupabaseAdminClient();

  // Member code → resolve lead_id. Partner code → record with null lead_id.
  const { data: lead } = await admin
    .from("leads")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();

  const leadId: string | null = lead?.id ?? null;
  if (!leadId) {
    const { data: partner } = await admin
      .from("partners")
      .select("id")
      .ilike("code", code)
      .maybeSingle();
    if (!partner) return false; // unknown code — skip
  }

  const { error } = await admin.from("referral_clicks").insert({
    code,
    lead_id: leadId,
    visitor_id: input.visitorId ?? null,
    ip_hash: hashIp(input.ip ?? null),
    user_agent: input.userAgent ?? null,
    referer: input.referer ?? null,
    landing_path: input.landingPath ?? null,
    country: input.country ?? null,
  });

  return !error;
}

export function newVisitorId(): string {
  return randomUUID();
}
