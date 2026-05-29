"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { acceptInviteSchema } from "@/features/partner-auth/schemas/accept-invite";
import { partnerProfileSchema } from "@/features/partner-auth/schemas/partner-profile";

export type PartnerProfileState =
  | { error: string }
  | { success: string }
  | null;

export async function updatePartnerProfileAction(
  _prev: PartnerProfileState,
  formData: FormData,
): Promise<PartnerProfileState> {
  const user = await getSessionUser();
  if (!user || user.role !== "partner") {
    return { error: "Not authorized." };
  }

  const parsed = partnerProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // partners RLS has no UPDATE policy by design — go through admin client
  // and enforce ownership ourselves (user_id must match the session user).
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("partners")
    .update({ name: parsed.data.name, phone: parsed.data.phone })
    .eq("user_id", user.id);
  if (error) return { error: "Could not save your changes." };

  revalidatePath("/partner/profile");
  revalidatePath("/partner/dashboard");
  return { success: "Saved." };
}

export type AcceptInviteState = { error: string } | null;

/**
 * Validate the custom UUID token in partners.verification_token, set the
 * partner's password via Supabase admin, mark them verified, then sign
 * them in with the new password so the session cookies are set before
 * redirecting to /partner/dashboard.
 */
export async function acceptPartnerInviteAction(
  _prev: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const parsed = acceptInviteSchema.safeParse({
    email:    formData.get("email"),
    token:    formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email, token, password } = parsed.data;

  const admin = createSupabaseAdminClient();
  const { data: partner } = await admin
    .from("partners")
    .select("id, user_id, verification_token, email")
    .ilike("email", email)
    .maybeSingle();

  if (
    !partner ||
    !partner.user_id ||
    !partner.verification_token ||
    partner.verification_token !== token
  ) {
    return { error: "This invite link is invalid or has already been used." };
  }

  const { error: pwError } = await admin.auth.admin.updateUserById(partner.user_id, {
    password,
  });
  if (pwError) return { error: pwError.message };

  // One-shot: clear the token so the link can't be replayed; mark verified.
  await admin
    .from("partners")
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      // verification_token is NOT NULL — use a fresh UUID rather than null
      // to invalidate this link without violating the constraint.
      verification_token: crypto.randomUUID(),
    })
    .eq("id", partner.id);

  // Sign the new partner in via the userland client so the session cookies
  // are written. Then redirect server-side to their dashboard.
  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: partner.email,
    password,
  });
  if (signInError) {
    // Password is set; user can sign in normally. Send them to login.
    redirect("/partner/login");
  }

  redirect("/partner/dashboard");
}
