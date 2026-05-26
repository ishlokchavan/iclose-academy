"use server";

import { revalidatePath } from "next/cache";

import { logAudit } from "@/features/audit/server/log";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireMinRole } from "@/lib/auth/guards";

import { getAffiliateById } from "./queries";
import type { AffiliateDetail } from "./queries";

export async function loadAffiliateDetailAction(leadId: string): Promise<AffiliateDetail | null> {
  await requireMinRole("manager");
  return getAffiliateById(leadId);
}

export type DeleteResult = { ok: true } | { ok: false; error: string };

export async function deleteAffiliateAction(leadId: string): Promise<DeleteResult> {
  const user = await requireMinRole("manager");
  if (!leadId) return { ok: false, error: "Missing affiliate id." };

  const admin = createSupabaseAdminClient();
  const { data: snapshot } = await admin
    .from("leads")
    .select("email, name, referral_code, referral_count")
    .eq("id", leadId)
    .maybeSingle();

  const { error } = await admin.from("leads").delete().eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: "affiliate.delete",
    entity_type: "lead",
    entity_id: leadId,
    diff: { deleted: snapshot ?? null },
    actor: { id: user.id, email: user.email, role: user.role },
  });

  revalidatePath("/manage/affiliates");
  return { ok: true };
}
