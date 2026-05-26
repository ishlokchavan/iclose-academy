"use server";

import { revalidatePath } from "next/cache";

import { logAudit } from "@/features/audit/server/log";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireMinRole } from "@/lib/auth/guards";

import { getMemberById } from "./queries";
import type { MemberDetail } from "./queries";

export async function loadMemberDetailAction(leadId: string): Promise<MemberDetail | null> {
  await requireMinRole("manager");
  return getMemberById(leadId);
}

export type DeleteResult = { ok: true } | { ok: false; error: string };

export async function deleteMemberAction(leadId: string): Promise<DeleteResult> {
  const user = await requireMinRole("manager");
  if (!leadId) return { ok: false, error: "Missing member id." };

  const admin = createSupabaseAdminClient();
  const { data: snapshot } = await admin
    .from("leads")
    .select("email, name, referral_code, referral_count")
    .eq("id", leadId)
    .maybeSingle();

  const { error } = await admin.from("leads").delete().eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: "member.delete",
    entity_type: "lead",
    entity_id: leadId,
    diff: { deleted: snapshot ?? null },
    actor: { id: user.id, email: user.email, role: user.role },
  });

  revalidatePath("/manage/members");
  return { ok: true };
}
