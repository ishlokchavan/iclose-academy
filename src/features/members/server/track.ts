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

/** Insert a click row. Returns true on success. Resolves the lead_id if the code is valid. */
export async function recordReferralClick(input: RecordClickInput): Promise<boolean> {
  const code = normalizeCode(input.code);
  if (!code) return false;

  const admin = createSupabaseAdminClient();

  // Lookup referring lead by code — silently skip unknown codes
  const { data: lead } = await admin
    .from("leads")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();
  if (!lead) return false;

  const { error } = await admin.from("referral_clicks").insert({
    code,
    lead_id: lead.id,
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
