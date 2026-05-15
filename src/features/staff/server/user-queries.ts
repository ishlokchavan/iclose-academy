import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type LeadData = {
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  source: string | null;
  is_verified: boolean;
  verified_at: string | null;
  registered_at: string;
};

export type StaffUserRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Database["public"]["Enums"]["app_role"];
  plan_key: string | null;
  email: string | null;
  created_at: string;
  updated_at: string | null;
  lead: LeadData | null;
};

export async function getAllUsers(): Promise<StaffUserRow[]> {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, plan_key, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (!profiles?.length) return [];

  // Fetch each user's email individually via admin API. Slower than
  // listUsers but resilient to bad rows in auth.users that 500 the bulk endpoint.
  const emailMap: Record<string, string | null> = {};
  const results = await Promise.all(
    profiles.map((p) =>
      admin.auth.admin
        .getUserById(p.id)
        .then(({ data, error }) => {
          if (error) console.error(`[user-queries] getUserById(${p.id}):`, error.message);
          return { id: p.id, email: data?.user?.email ?? null };
        })
        .catch((e) => {
          console.error(`[user-queries] getUserById(${p.id}) threw:`, e);
          return { id: p.id, email: null };
        }),
    ),
  );
  for (const r of results) emailMap[r.id] = r.email;

  // Fetch all leads via admin client (bypasses RLS) and key by email
  let leadsMap: Record<string, LeadData> = {};
  const allEmails = Object.values(emailMap).filter(Boolean) as string[];
  if (allEmails.length > 0) {
    try {
      const { data: leads, error: leadsError } = await admin
        .from("leads")
        .select("email, first_name, last_name, phone, source, is_verified, verified_at, created_at")
        .in("email", allEmails);
      if (leadsError) console.error("[user-queries] leads error:", leadsError);
      if (Array.isArray(leads)) {
        leadsMap = Object.fromEntries(
          leads.map((l) => [
            l.email,
            {
              email: l.email,
              first_name: l.first_name,
              last_name: l.last_name,
              phone: l.phone ?? null,
              source: l.source,
              is_verified: l.is_verified,
              verified_at: l.verified_at,
              registered_at: l.created_at,
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
      updated_at: p.updated_at ?? null,
      lead: email ? (leadsMap[email] ?? null) : null,
    };
  });
}

export async function getEducators(): Promise<StaffUserRow[]> {
  const all = await getAllUsers();
  return all.filter((u) => u.role !== "learner");
}
