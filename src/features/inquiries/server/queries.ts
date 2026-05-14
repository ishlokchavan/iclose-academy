import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];

export type InquiryRow = {
  id: string;
  description: string;
  email: string;
  phone: string | null;
  status: InquiryStatus;
  subarea: string | null;
  created_at: string;
  resolved_at: string | null;
  area: { id: string; slug: string; name: string } | null;
  type: { id: string; slug: string; name: string } | null;
  subtypes: Array<{ id: string; slug: string; name: string }>;
  learner: { id: string; full_name: string | null; avatar_url: string | null };
  source_topic: { id: string; slug: string; title: string } | null;
};

const SELECT = `
  id, description, email, phone, status, subarea, created_at, resolved_at,
  area:areas(id, slug, name),
  type:property_types(id, slug, name),
  inquiry_subtypes(subtype:property_subtypes(id, slug, name)),
  learner:profiles!inquiries_learner_id_fkey(id, full_name, avatar_url),
  source_topic:topics(id, slug, title)
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(row: any): InquiryRow {
  return {
    id:           row.id,
    description:  row.description,
    email:        row.email,
    phone:        row.phone,
    status:       row.status,
    subarea:      row.subarea,
    created_at:   row.created_at,
    resolved_at:  row.resolved_at,
    area:         row.area,
    type:         row.type,
    subtypes:     ((row.inquiry_subtypes ?? []) as Array<{ subtype: { id: string; slug: string; name: string } | null }>)
                    .map((x) => x.subtype)
                    .filter((x): x is { id: string; slug: string; name: string } => !!x),
    learner:      row.learner ?? { id: "", full_name: null, avatar_url: null },
    source_topic: row.source_topic ?? null,
  };
}

export async function getInquiriesForLearner(userId: string): Promise<InquiryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inquiries")
    .select(SELECT)
    .eq("learner_id", userId)
    .order("created_at", { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(shape);
}

export async function getAllInquiriesForStaff(status?: InquiryStatus): Promise<InquiryRow[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from("inquiries").select(SELECT).order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(shape);
}

export async function getInquiryStats(): Promise<Record<InquiryStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("inquiries").select("status");
  const stats: Record<InquiryStatus, number> = { open: 0, assigned: 0, in_progress: 0, closed: 0 };
  for (const r of data ?? []) stats[r.status as InquiryStatus] += 1;
  return stats;
}
