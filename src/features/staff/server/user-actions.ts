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
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);
  if (error) return { error: error.message };
  // Best-effort: mirror role to JWT app_metadata.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  try {
    await sb.rpc("set_app_metadata_role", {
      p_user_id: parsed.data.userId,
      p_role: parsed.data.role,
    });
  } catch {
    // non-fatal
  }
  revalidatePath("/staff/users");
  return {};
}
