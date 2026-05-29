"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireMinRole } from "@/lib/auth/guards";
import { sendPartnerInviteEmail } from "@/lib/email/send-partner-invite-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createPartnerSchema,
  updatePartnerSchema,
  type CreatePartnerInput,
  type UpdatePartnerInput,
} from "@/features/partner-management/schemas/partner";
import {
  getPartnerReferralTree,
  type PartnerReferralTree,
} from "@/features/partner-management/server/queries";

export type PartnerActionResult = { error?: string; id?: string };

/** Load a partner's referral tree on demand (for the admin drawer). */
export async function loadPartnerReferralsAction(
  code: string,
): Promise<PartnerReferralTree> {
  await requireMinRole("manager");
  return getPartnerReferralTree(code);
}

// Canonical uppercase codes from a confusion-free alphabet (no 0/O/1/I/L).
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function randomCode(): string {
  let body = "";
  for (let i = 0; i < 6; i++) {
    body += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `P-${body}`;
}

/**
 * A code must be unique across BOTH partners and member referral codes so it
 * resolves unambiguously. Returns true if the code is free to use.
 * `excludePartnerId` lets an update keep its own code.
 */
async function isCodeAvailable(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  code: string,
  excludePartnerId?: string,
): Promise<boolean> {
  const [{ data: partnerHit }, { data: leadHit }] = await Promise.all([
    admin.from("partners").select("id").ilike("code", code).maybeSingle(),
    admin.from("leads").select("id").eq("referral_code", code).maybeSingle(),
  ]);
  if (leadHit) return false;
  if (partnerHit && partnerHit.id !== excludePartnerId) return false;
  return true;
}

export async function createPartnerAction(
  fields: CreatePartnerInput,
): Promise<PartnerActionResult> {
  await requireMinRole("manager");
  const parsed = createPartnerSchema.safeParse(fields);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, phone, code } = parsed.data;

  const admin = createSupabaseAdminClient();

  // Email uniqueness — partners.email isn't unique in the schema but we
  // enforce it here so admins don't create dupes by mistake.
  const { data: existing } = await admin
    .from("partners")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (existing) return { error: "A partner with that email already exists." };

  let finalCode = code ?? randomCode();
  // Code must be free across partners AND member codes. Admin-chosen codes
  // fail loudly; auto-generated ones retry.
  for (let attempt = 0; attempt < 5; attempt++) {
    if (await isCodeAvailable(admin, finalCode)) break;
    if (code) return { error: "That code is already taken." };
    finalCode = randomCode();
    if (attempt === 4) return { error: "Could not generate a unique code. Try again." };
  }

  const { data: row, error } = await admin
    .from("partners")
    .insert({ name, email, phone, code: finalCode, status: "active" })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  return { id: row.id };
}

export async function updatePartnerAction(
  id: string,
  fields: UpdatePartnerInput,
): Promise<PartnerActionResult> {
  await requireMinRole("manager");
  const parsed = updatePartnerSchema.safeParse(fields);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const admin = createSupabaseAdminClient();

  // Guard code collisions across partners AND member referral codes.
  if (!(await isCodeAvailable(admin, parsed.data.code, id))) {
    return { error: "That code is already taken." };
  }

  const { error } = await admin
    .from("partners")
    .update({
      name:   parsed.data.name,
      phone:  parsed.data.phone,
      code:   parsed.data.code,
      status: parsed.data.status,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  revalidatePath("/partner/dashboard");
  revalidatePath("/partner/profile");
  return { id };
}

export async function setPartnerStatusAction(
  id: string,
  status: "active" | "inactive",
): Promise<PartnerActionResult> {
  await requireMinRole("manager");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("partners")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  return { id };
}

/**
 * Send (or resend) a partner invite. Mints our own UUID token stored in
 * partners.verification_token (NOT a Supabase invite token), sends the link
 * via Gmail SMTP (NOT Supabase's email), and creates the auth.users row if
 * one doesn't exist yet. Setting the password happens on /partner/accept-invite.
 */
export async function sendPartnerInviteAction(
  partnerId: string,
): Promise<PartnerActionResult> {
  await requireMinRole("manager");
  const admin = createSupabaseAdminClient();

  const { data: partner, error: partnerError } = await admin
    .from("partners")
    .select("id, name, email, user_id")
    .eq("id", partnerId)
    .maybeSingle();
  if (partnerError || !partner) return { error: "Partner not found." };

  // Ensure an auth.users row exists for this email so the password set
  // on /partner/accept-invite has somewhere to land.
  let userId = partner.user_id;
  if (!userId) {
    const { data: existingId } = await admin.rpc("get_auth_user_id_by_email", {
      p_email: partner.email,
    });
    if (typeof existingId === "string" && existingId.length > 0) {
      userId = existingId;
    } else {
      // Random password the user never sees — they'll set their own via
      // the invite link. email_confirm=true so they can sign in straight
      // after setting the password, no Supabase confirmation email.
      const seedPassword = randomUUID() + randomUUID();
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: partner.email,
        password: seedPassword,
        email_confirm: true,
        app_metadata: { role: "partner", provider: "email", providers: ["email"] },
        user_metadata: { full_name: partner.name },
      });
      if (createError || !created?.user) {
        return { error: createError?.message ?? "Could not create auth user." };
      }
      userId = created.user.id;
    }

    // Link the partner row to the auth user.
    const { error: linkError } = await admin
      .from("partners")
      .update({ user_id: userId })
      .eq("id", partner.id);
    if (linkError) return { error: linkError.message };
  }

  // Make sure the profiles row exists with role=partner so the rest of the
  // app's role plumbing (ROLE_LANDING, guards) treats them correctly.
  await admin.from("profiles").upsert(
    { id: userId, role: "partner", full_name: partner.name, email: partner.email },
    { onConflict: "id" },
  );

  // Mint a fresh invite token. Reset is_verified so the partner has to
  // accept the new invite (also invalidates any prior token for them).
  const token = randomUUID();
  const { error: tokenError } = await admin
    .from("partners")
    .update({ verification_token: token, is_verified: false, verified_at: null })
    .eq("id", partner.id);
  if (tokenError) return { error: tokenError.message };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const link = `${baseUrl}/partner/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(partner.email)}`;

  try {
    await sendPartnerInviteEmail(partner.email, partner.name, link);
  } catch {
    return { error: "Could not send the invite email. Please try again." };
  }

  revalidatePath("/manage/partners");
  return { id: partner.id };
}

/**
 * Activity buckets for a partner. We split out clicks because they're not
 * an attribution outcome on their own — if nobody signed up, the clicks are
 * just failed marketing with no record worth preserving, and we can wipe
 * them safely at delete time.
 */
async function getPartnerActivity(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  partner: { id: string; code: string },
): Promise<{ clicks: number; signups: number; conversions: number; commissions: number; blocking: number }> {
  const upper = partner.code.toUpperCase();
  const [clicks, signups, conversions, commissions] = await Promise.all([
    admin.from("referral_clicks").select("id", { count: "exact", head: true }).ilike("code", upper),
    admin.from("leads").select("id", { count: "exact", head: true }).ilike("referred_by_code", upper),
    admin.from("referral_conversions").select("id", { count: "exact", head: true }).eq("partner_id", partner.id),
    admin.from("commissions").select("id", { count: "exact", head: true }).eq("partner_id", partner.id),
  ]);
  const c = clicks.count ?? 0, s = signups.count ?? 0, cv = conversions.count ?? 0, cm = commissions.count ?? 0;
  // "blocking" = anything that would orphan real attribution if we deleted.
  // Clicks alone don't qualify — they're noise, not history.
  return { clicks: c, signups: s, conversions: cv, commissions: cm, blocking: s + cv + cm };
}

/**
 * Archive a partner — the correct way to "stop using" any partner with
 * activity. Preserves historical attribution and the code reservation so
 * past referrals keep resolving and the code can't be reused by mistake.
 *
 * Does NOT scrub PII (that's a separate GDPR/forget-me concern). The data
 * stays on the row; the entity just goes inert: status=archived, auth user
 * banned, profile role demoted so the partner can no longer log in.
 */
export async function archivePartnerAction(
  id: string,
): Promise<PartnerActionResult> {
  await requireMinRole("admin");
  const admin = createSupabaseAdminClient();

  const { data: partner, error: lookupError } = await admin
    .from("partners")
    .select("id, user_id, code, status")
    .eq("id", id)
    .maybeSingle();
  if (lookupError || !partner) return { error: "Partner not found." };

  if (partner.user_id) {
    // Ban the auth user — long-duration ban is the standard Supabase pattern
    // for "this account can't sign in anymore". Failure here isn't fatal:
    // we still mark the row archived so the operational state is consistent.
    await admin.auth.admin
      .updateUserById(partner.user_id, { ban_duration: "876000h" })
      .catch(() => {});
    // Demote the profile so the role plumbing (ROLE_LANDING, role guards)
    // stops treating them as a partner.
    await admin
      .from("profiles")
      .update({ role: "learner" })
      .eq("id", partner.user_id);
  }

  const { error: updateError } = await admin
    .from("partners")
    .update({ status: "archived" })
    .eq("id", id);
  if (updateError) return { error: updateError.message };

  revalidatePath("/manage/partners");
  revalidatePath("/manage/members");
  return { id };
}

/**
 * Hard-delete — allowed when the partner has zero signups, zero referral
 * conversions, and zero commissions. Clicks alone don't block: with no
 * conversion they're failed marketing, not history worth preserving. We
 * wipe the orphaned click rows alongside the partner so the code can be
 * safely reused later without inheriting someone else's traffic.
 *
 * Use this to undo accidental partner creation or to clean up a partner
 * who never managed to convert anyone. Anything with real attribution must
 * be archived instead.
 */
export async function deletePartnerAction(
  id: string,
): Promise<PartnerActionResult> {
  await requireMinRole("admin");
  const admin = createSupabaseAdminClient();

  const { data: partner, error: lookupError } = await admin
    .from("partners")
    .select("id, user_id, code")
    .eq("id", id)
    .maybeSingle();
  if (lookupError || !partner) return { error: "Partner not found." };

  const activity = await getPartnerActivity(admin, partner);
  if (activity.blocking > 0) {
    return {
      error:
        `Can't delete — this partner has ${activity.signups} signup(s). ` +
        `Archive them instead to preserve attribution.`,
    };
  }

  // Safe to fully tear down: no signups, no conversions, no commissions —
  // nothing valuable points at this partner. Wipe orphaned clicks (matched
  // on code, case-insensitive) and the auth account too so the code can
  // be reused without dragging old data into the new partner's stats.
  await admin
    .from("referral_clicks")
    .delete()
    .ilike("code", partner.code.toUpperCase());

  if (partner.user_id) {
    await admin.auth.admin.deleteUser(partner.user_id).catch(() => {});
    // profiles cascades from auth.users in standard Supabase setups; if
    // not, this no-ops harmlessly.
    await admin.from("profiles").delete().eq("id", partner.user_id);
  }

  const { error } = await admin.from("partners").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  return { id };
}
