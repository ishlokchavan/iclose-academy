import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type HireApplication = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  instagram: string | null;
  message: string | null;
  resume_path: string | null;
  status: string;
  referer: string | null;
  created_at: string;
};

export type HireRemark = {
  id: string;
  application_id: string;
  content: string;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
};

export async function getHireApplications(): Promise<HireApplication[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("intern_applications")
    .select("id, first_name, last_name, email, phone, instagram, message, resume_path, status, referer, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as HireApplication[];
}

export async function getHireRemarks(applicationId: string): Promise<HireRemark[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("hire_remarks")
    .select("id, application_id, content, created_by, created_by_name, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });
  return (data ?? []) as HireRemark[];
}
