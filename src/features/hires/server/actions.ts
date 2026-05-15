"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireMinRole } from "@/lib/auth/guards";
import { HIRE_STATUSES, type HireStatus } from "@/features/hires/constants";
import type { HireRemark } from "@/features/hires/server/queries";

export type { HireStatus };
export type { HireRemark };

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

export async function getHireRemarksAction(applicationId: string): Promise<{ remarks?: HireRemark[]; error?: string }> {
  await requireMinRole("manager");

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("hire_remarks")
    .select("id, application_id, content, created_by, created_by_name, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { remarks: data as HireRemark[] };
}

export async function addHireRemarkAction(
  applicationId: string,
  content: string,
): Promise<{ remark?: HireRemark; error?: string }> {
  await requireMinRole("manager");

  const trimmed = content.trim();
  if (!trimmed) return { error: "Remark cannot be empty." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createSupabaseAdminClient();

  let createdByName: string | null = null;
  if (user) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    createdByName = profile?.full_name ?? null;
  }

  const { data, error } = await admin
    .from("hire_remarks")
    .insert({
      application_id: applicationId,
      content: trimmed,
      created_by: user?.id ?? null,
      created_by_name: createdByName,
    })
    .select("id, application_id, content, created_by, created_by_name, created_at")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/manage/hires");
  return { remark: data as HireRemark };
}
