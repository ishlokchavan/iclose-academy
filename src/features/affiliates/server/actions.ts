"use server";

import { revalidatePath } from "next/cache";

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
  await requireMinRole("manager");
  if (!leadId) return { ok: false, error: "Missing affiliate id." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("leads").delete().eq("id", leadId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/manage/affiliates");
  return { ok: true };
}
