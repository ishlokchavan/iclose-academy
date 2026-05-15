import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EducatorRecord = {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  bio: string | null;
  expertise: string | null;
  status: string;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getEducatorList(): Promise<EducatorRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("educators")
    .select("id, name, first_name, last_name, email, phone, photo_url, bio, expertise, status, is_verified, verified_at, created_at, updated_at")
    .order("name");
  return (data ?? []) as EducatorRecord[];
}
