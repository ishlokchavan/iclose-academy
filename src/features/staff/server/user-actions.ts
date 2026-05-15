"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendInviteEmail } from "@/lib/email/send-invite-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireMinRole } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

const STAFF_ROLES = ["manager", "content_manager"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;
}

// ─── Update role (staff only, admin cannot be assigned via UI) ────────────────
export async function setUserRoleAction(
  userId: string,
  role: StaffRole,
): Promise<ActionResult> {
  const caller = await requireMinRole("admin");
  if (caller.id === userId) return { error: "You cannot change your own role." };

  const parsed = z
    .object({ userId: z.string().uuid(), role: z.enum(STAFF_ROLES) })
    .safeParse({ userId, role });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);
  if (error) return { error: error.message };

  // Mirror to JWT app_metadata (best-effort)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc("set_app_metadata_role", {
      p_user_id: parsed.data.userId,
      p_role: parsed.data.role,
    });
  } catch { /* non-fatal */ }

  revalidatePath("/manage/users");
  return {};
}

// ─── Update name ──────────────────────────────────────────────────────────────
export async function updateUserNameAction(
  userId: string,
  fullName: string,
): Promise<ActionResult> {
  await requireMinRole("admin");

  const name = fullName.trim();
  if (!name || name.length > 100) return { error: "Name must be 1–100 characters." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/manage/users");
  return {};
}

// ─── Update lead contact fields ───────────────────────────────────────────────
export async function updateLeadFieldsAction(
  email: string,
  fields: { first_name?: string | null; last_name?: string | null; phone?: string | null },
): Promise<ActionResult> {
  await requireMinRole("admin");

  if (!email) return { error: "No email address for this user." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("leads")
    .update({
      ...(fields.first_name !== undefined && { first_name: fields.first_name?.trim() || null }),
      ...(fields.last_name !== undefined && { last_name: fields.last_name?.trim() || null }),
      ...(fields.phone !== undefined && { phone: fields.phone?.trim() || "" }),
    })
    .eq("email", email);
  if (error) return { error: error.message };

  revalidatePath("/manage/users");
  return {};
}

// ─── Update learner (combined: profile.full_name, lead fields, auth email) ────
export async function updateLearnerAction(
  userId: string,
  currentEmail: string | null,
  fields: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
  },
): Promise<ActionResult> {
  await requireMinRole("admin");

  const first = fields.first_name?.trim() ?? "";
  const last = fields.last_name?.trim() ?? "";
  const phone = fields.phone?.trim();
  const newEmail = fields.email?.trim().toLowerCase();

  // Validate email if provided
  if (newEmail !== undefined) {
    const ok = z.string().email().safeParse(newEmail);
    if (!ok.success) return { error: "Enter a valid email address." };
  }

  const fullName = [first, last].filter(Boolean).join(" ") || null;
  const admin = createSupabaseAdminClient();

  // 1. Update auth email if changed
  if (newEmail && newEmail !== currentEmail?.toLowerCase()) {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email: newEmail,
      email_confirm: true,
    });
    if (error) return { error: error.message };
  }

  // 2. Update profile full_name (computed from first + last)
  if (fullName) {
    const { error } = await admin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);
    if (error) return { error: error.message };
  }

  // 3. Update lead row (match by currentEmail, set new email if changed)
  if (currentEmail) {
    const emailIsChanging = !!newEmail && newEmail !== currentEmail.toLowerCase();
    // Use admin to bypass RLS; ignore "no row" — lead may not exist
    await admin
      .from("leads")
      .update({
        ...(fields.first_name !== undefined && { first_name: first || null }),
        ...(fields.last_name !== undefined && { last_name: last || null }),
        ...(phone !== undefined && { phone: phone || "" }),
        ...(emailIsChanging && { email: newEmail }),
        ...(fullName !== null && { name: fullName }),
      })
      .eq("email", currentEmail);
  }

  revalidatePath("/manage/users");
  return {};
}

// ─── Update staff/admin email (auth only — no lead row) ──────────────────────
export async function updateUserEmailAction(
  userId: string,
  newEmail: string,
): Promise<ActionResult> {
  await requireMinRole("admin");

  const parsed = z.string().email().safeParse(newEmail.trim().toLowerCase());
  if (!parsed.success) return { error: "Enter a valid email address." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email: parsed.data,
    email_confirm: true,
  });
  if (error) return { error: error.message };

  revalidatePath("/manage/users");
  return {};
}

// ─── Delete user ──────────────────────────────────────────────────────────────
export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const caller = await requireMinRole("admin");
  if (caller.id === userId) return { error: "You cannot delete your own account." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/manage/users");
  return {};
}

// ─── Invite new user (staff only — admin not assignable via UI) ───────────────
export async function inviteUserAction(
  email: string,
  fullName: string,
  role: StaffRole,
): Promise<ActionResult> {
  await requireMinRole("admin");

  const parsedEmail = z.string().email().safeParse(email.trim().toLowerCase());
  if (!parsedEmail.success) return { error: "Enter a valid email address." };
  const name = fullName.trim();
  if (!name) return { error: "Name is required." };
  if (!STAFF_ROLES.includes(role)) return { error: "Invalid role." };

  const origin = await getSiteOrigin();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email: parsedEmail.data,
    options: {
      data: { full_name: name },
      redirectTo: `${origin}/auth/accept-invite`,
    },
  });
  if (error) return { error: error.message };

  // Upsert profile with correct role — handles race condition with DB trigger
  if (data.user?.id) {
    await admin
      .from("profiles")
      .upsert({ id: data.user.id, role, full_name: name });
  }

  // Extract token from action_link and send our own invite URL so we control the redirect
  let inviteUrl = data.properties?.action_link ?? "";
  try {
    const actionUrl = new URL(data.properties?.action_link ?? "");
    const token = actionUrl.searchParams.get("token");
    if (token) {
      inviteUrl = `${origin}/auth/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(parsedEmail.data)}`;
    }
  } catch { /* fall back to action_link */ }

  if (inviteUrl) {
    try {
      await sendInviteEmail(parsedEmail.data, name, inviteUrl);
    } catch { /* non-fatal */ }
  }

  revalidatePath("/manage/users");
  return {};
}
