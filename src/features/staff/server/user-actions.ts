"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendInviteEmail } from "@/lib/email/send-invite-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireMinRole } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

const STAFF_ROLES = ["manager", "content_manager"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

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

// ─── Invite new user (manager only — admin not assignable via UI) ─────────────
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

  const admin = createSupabaseAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email: parsedEmail.data,
    options: {
      data: { full_name: name },
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  // Set role on the auto-created profile (trigger creates it with role='learner')
  if (data.user?.id) {
    await admin
      .from("profiles")
      .update({ role, full_name: name })
      .eq("id", data.user.id);
  }

  // Send invite email via Gmail SMTP
  if (data.properties?.action_link) {
    try {
      await sendInviteEmail(parsedEmail.data, name, data.properties.action_link);
    } catch { /* email send failure is non-fatal — link was generated */ }
  }

  revalidatePath("/manage/users");
  return {};
}
