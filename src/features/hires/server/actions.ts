"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireMinRole } from "@/lib/auth/guards";

export const HIRE_STATUSES = ["pending", "reviewing", "shortlisted", "hired", "rejected"] as const;
export type HireStatus = (typeof HIRE_STATUSES)[number];

export async function updateHireStatusAction(
  id: string,
  status: HireStatus,
): Promise<{ error?: string }> {
  await requireMinRole("manager");

  if (!HIRE_STATUSES.includes(status)) return { error: "Invalid status." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("intern_applications")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/hires");
  return {};
}

export async function getResumeSignedUrlAction(path: string): Promise<{ url?: string; error?: string }> {
  await requireMinRole("manager");

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 60); // 1 hour
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
