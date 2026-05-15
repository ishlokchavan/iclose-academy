"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";

export type ProfileActionResult = {
  error?: string;
  emailVerificationSent?: boolean;
  newEmail?: string;
};

export async function getOwnLeadData(email: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("leads")
    .select("first_name, last_name, phone")
    .ilike("email", email)
    .maybeSingle();
  return data ?? null;
}

export async function updateOwnProfileAction(fields: {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}): Promise<ProfileActionResult> {
  const user = await requireUser();

  const first = fields.first_name.trim();
  const last = fields.last_name.trim();
  const phone = fields.phone.trim();
  const newEmail = fields.email.trim().toLowerCase();

  // Validate email
  if (newEmail) {
    const ok = z.string().email().safeParse(newEmail);
    if (!ok.success) return { error: "Enter a valid email address." };
  }

  const admin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();

  // Phone duplicate check (skip if same as current or empty)
  if (phone) {
    const { data: phoneTaken } = await admin
      .from("leads")
      .select("email")
      .eq("phone", phone)
      .neq("email", (user.email ?? "").toLowerCase())
      .maybeSingle();
    if (phoneTaken) return { error: "This phone number is already registered to another account." };
  }

  let emailVerificationSent = false;

  // Email change — use user's own session so Supabase sends verification to new address
  if (newEmail && newEmail !== (user.email ?? "").toLowerCase()) {
    // Check email not already taken
    const { data: existing } = await admin.auth.admin.listUsers();
    const taken = existing?.users?.some(
      (u) => u.email?.toLowerCase() === newEmail && u.id !== user.id,
    );
    if (taken) return { error: "This email address is already in use." };

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return { error: error.message };
    emailVerificationSent = true;
  }

  // Update profile full_name
  const fullName = [first, last].filter(Boolean).join(" ") || null;
  if (fullName) {
    await admin.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  }

  // Update lead row (matched by current email, case-insensitive)
  if (user.email) {
    const { data: existingLead } = await admin
      .from("leads")
      .select("email")
      .ilike("email", user.email)
      .maybeSingle();

    if (existingLead) {
      await admin
        .from("leads")
        .update({
          first_name: first || null,
          last_name: last || null,
          phone: phone || "",
          ...(fullName && { name: fullName }),
        })
        .eq("email", existingLead.email);
    }
    // If no lead row exists, we skip — profile.full_name still captures the name.
  }

  revalidatePath("/profile");
  return { emailVerificationSent, newEmail: emailVerificationSent ? newEmail : undefined };
}
