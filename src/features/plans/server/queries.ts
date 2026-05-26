import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/db";

export type MembershipPlan = Database["public"]["Tables"]["membership_plans"]["Row"];

export type PlanWithCounts = MembershipPlan & {
  leads_count: number;
  profiles_count: number;
};

export async function getAllPlans(): Promise<PlanWithCounts[]> {
  const admin = createSupabaseAdminClient();

  const { data: plans, error } = await admin
    .from("membership_plans")
    .select("*")
    .order("order", { ascending: true });

  if (error || !plans) return [];

  // Fetch counts in parallel — small N of plans
  const counts = await Promise.all(
    plans.map(async (p) => {
      const [{ count: leads }, { count: profiles }] = await Promise.all([
        admin.from("leads").select("id", { count: "exact", head: true }).eq("plan_key", p.key),
        admin.from("profiles").select("id", { count: "exact", head: true }).eq("plan_key", p.key),
      ]);
      return { key: p.key, leads: leads ?? 0, profiles: profiles ?? 0 };
    }),
  );
  const byKey = new Map(counts.map((c) => [c.key, c]));

  return plans.map((p) => ({
    ...p,
    leads_count: byKey.get(p.key)?.leads ?? 0,
    profiles_count: byKey.get(p.key)?.profiles ?? 0,
  }));
}

export async function getPlan(key: string): Promise<PlanWithCounts | null> {
  const all = await getAllPlans();
  return all.find((p) => p.key === key) ?? null;
}
