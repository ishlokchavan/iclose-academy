import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EducatorRecord = {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  created_at: string;
};

export async function getEducatorList(): Promise<EducatorRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("educators")
    .select("id, name, photo_url, bio, created_at")
    .order("name");
  return (data ?? []) as EducatorRecord[];
}
