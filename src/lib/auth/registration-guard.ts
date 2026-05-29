import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type FunnelSource =
  | "leads"
  | "educators"
  | "intern_applications"
  | "specialist_applications";

export type FunnelMatch = {
  found: boolean;
  sources: FunnelSource[];
};

/**
 * Checks whether the given email already appears in any of the four
 * registration-intake tables. Used by auth flows to refuse self-signup
 * for anyone who must be onboarded by admin invite instead.
 *
 * Comparison is case-insensitive (ilike) on every table to match the
 * lowercase-on-insert convention used elsewhere.
 */
export async function findEmailInFunnels(email: string): Promise<FunnelMatch> {
  const admin = createSupabaseAdminClient();
  const norm = email.trim().toLowerCase();
  if (!norm) return { found: false, sources: [] };

  const [leads, educators, interns, specialists] = await Promise.all([
    admin.from("leads")                  .select("id", { count: "exact", head: true }).ilike("email", norm),
    admin.from("educators")              .select("id", { count: "exact", head: true }).ilike("email", norm),
    admin.from("intern_applications")    .select("id", { count: "exact", head: true }).ilike("email", norm),
    admin.from("specialist_applications").select("id", { count: "exact", head: true }).ilike("email", norm),
  ]);

  const sources: FunnelSource[] = [];
  if ((leads.count        ?? 0) > 0) sources.push("leads");
  if ((educators.count    ?? 0) > 0) sources.push("educators");
  if ((interns.count      ?? 0) > 0) sources.push("intern_applications");
  if ((specialists.count  ?? 0) > 0) sources.push("specialist_applications");

  return { found: sources.length > 0, sources };
}

/** True when an auth.users row exists for this email (case-insensitive). */
export async function authUserExistsForEmail(email: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const norm = email.trim().toLowerCase();
  if (!norm) return false;
  // Use the SECURITY DEFINER RPC so this works regardless of session context.
  // (The user_emails view is gated by is_staff(), which is false for the
  // service-role client because auth.uid() is null — so a direct view query
  // would always return empty here and falsely block already-registered users.)
  const { data, error } = await admin.rpc("get_auth_user_id_by_email", {
    p_email: norm,
  });
  if (error) return false;
  return typeof data === "string" && data.length > 0;
}

/** Human-readable message returned to the UI when signup is refused. */
export const SIGNUP_BLOCKED_MESSAGE =
  "Your details are already on file. An admin will send you an invite link to complete sign-in.";
