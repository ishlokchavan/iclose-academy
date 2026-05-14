import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type StaffUserRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Database["public"]["Enums"]["app_role"];
  email: string | null;
  created_at: string;
};

export async function getAllUsers(): Promise<StaffUserRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at")
    .order("created_at", { ascending: false });
  if (!profiles?.length) return [];

  let emailMap: Record<string, string | null> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  try {
    const { data } = await sb.from("user_emails").select("id, email");
    if (Array.isArray(data)) {
      emailMap = Object.fromEntries(
        (data as Array<{ id: string; email: string | null }>).map((r) => [r.id, r.email]),
      );
    }
  } catch {
    // view missing — leave emails null
  }

  return profiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    role: p.role,
    email: emailMap[p.id] ?? null,
    created_at: p.created_at,
  }));
}

export async function getEducators(): Promise<StaffUserRow[]> {
  const all = await getAllUsers();
  return all.filter((u) => u.role !== "learner");
}
