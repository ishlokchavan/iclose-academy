import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EducatorAssignmentRow = {
  id: string;
  educator: { id: string; full_name: string | null; avatar_url: string | null };
  area: { id: string; slug: string; name: string };
  type: { id: string; slug: string; name: string } | null;
  subarea: string | null;
  created_at: string;
};

export type EducatorWithAssignments = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string;
  assignments: EducatorAssignmentRow[];
};

export async function getEducatorAssignments(): Promise<EducatorAssignmentRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("educator_assignments")
    .select(
      `id, subarea, created_at,
       educator:profiles!educator_assignments_educator_id_fkey(id, full_name, avatar_url),
       area:areas(id, slug, name),
       type:property_types(id, slug, name)`,
    )
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    subarea: r.subarea,
    created_at: r.created_at,
    educator: r.educator ?? { id: "", full_name: null, avatar_url: null },
    area: r.area,
    type: r.type ?? null,
  }));
}
