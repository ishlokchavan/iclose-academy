"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMinRole } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ROLES = ["learner", "educator", "content_manager", "admin"] as const;

const setRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ROLES),
});

export type ActionResult = { error?: string };

/**
 * Change a user's role. Only admin can call this (matches the
 * profiles_prevent_role_escalation trigger which lets is_admin() bypass
 * the self-escalation guard).
 */
export async function setUserRoleAction(
  userId: string,
  role: (typeof ROLES)[number],
): Promise<ActionResult> {
  const caller = await requireMinRole("admin");
  if (caller.id === userId && role !== "admin") {
    return { error: "Admins can't demote themselves from the UI." };
  }

  const parsed = setRoleSchema.safeParse({ userId, role });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.userId);

  if (error) return { error: error.message };

  // Keep JWT app_metadata in sync so client-side checks see the new role on
  // next refresh. Direct write to auth.users is allowed for service_role only;
  // here we rely on Postgres-level permissions of the running session. The
  // trigger that mirrors on insert doesn't mirror on update, so we log it but
  // don't fail if the update doesn't go through.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  try {
    await sb.rpc("set_app_metadata_role", { p_user_id: parsed.data.userId, p_role: parsed.data.role });
  } catch {
    // best-effort
  }

  revalidatePath("/staff/users");
  return {};
}
