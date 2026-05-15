import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type LeadData = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  source: string | null;
  is_verified: boolean;
  verified_at: string | null;
};

export type StaffUserRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Database["public"]["Enums"]["app_role"];
  plan_key: string | null;
  email: string | null;
  created_at: string;
  lead: LeadData | null;
};

export async function getAllUsers(): Promise<StaffUserRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, plan_key, created_at")
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

  // Fetch lead data keyed by email
  let leadsMap: Record<string, LeadData> = {};
  const allEmails = Object.values(emailMap).filter(Boolean) as string[];
  if (allEmails.length > 0) {
    try {
      const { data: leads } = await supabase
        .from("leads")
        .select("email, first_name, last_name, phone, source, is_verified, verified_at")
        .in("email", allEmails);
      if (Array.isArray(leads)) {
        leadsMap = Object.fromEntries(
          leads.map((l) => [
            l.email,
            {
              first_name: l.first_name,
              last_name: l.last_name,
              phone: l.phone ?? null,
              source: l.source,
              is_verified: l.is_verified,
              verified_at: l.verified_at,
            },
          ]),
        );
      }
    } catch {
      // leads table inaccessible
    }
  }

  return profiles.map((p) => {
    const email = emailMap[p.id] ?? null;
    return {
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      role: p.role,
      plan_key: p.plan_key ?? null,
      email,
      created_at: p.created_at,
      lead: email ? (leadsMap[email] ?? null) : null,
    };
  });
}

export async function getEducators(): Promise<StaffUserRow[]> {
  const all = await getAllUsers();
  return all.filter((u) => u.role !== "learner");
}
