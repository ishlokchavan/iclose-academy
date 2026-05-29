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

export type PartnerActionResult = { error?: string; id?: string };

function randomCode(prefix = "p"): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${random}`;
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
  // Code is unique in the DB; retry once on collision.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: byCode } = await admin
      .from("partners")
      .select("id")
      .eq("code", finalCode)
      .maybeSingle();
    if (!byCode) break;
    if (code) return { error: "That code is already taken." };
    finalCode = randomCode();
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

  // Guard code collisions for code changes.
  const { data: byCode } = await admin
    .from("partners")
    .select("id")
    .eq("code", parsed.data.code)
    .neq("id", id)
    .maybeSingle();
  if (byCode) return { error: "That code is already taken." };

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

export async function deletePartnerAction(
  id: string,
): Promise<PartnerActionResult> {
  // Restrict deletion to admin only — soft delete via status is safer for managers.
  await requireMinRole("admin");
  const admin = createSupabaseAdminClient();

  // referral_conversions / commissions FK with no cascade — clear them first.
  await admin.from("referral_conversions").delete().eq("partner_id", id);
  await admin.from("commissions").delete().eq("partner_id", id);

  const { error } = await admin.from("partners").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  return { id };
}
