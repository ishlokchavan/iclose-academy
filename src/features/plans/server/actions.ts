"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAudit } from "@/features/audit/server/log";
import { requireRole } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/db";

export type PlanActionResult = { ok: true } | { ok: false; error: string };

const billingSchema = z.enum(["free", "monthly", "yearly"]);

const updateSchema = z.object({
  label: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(400).nullable(),
  billing_cycle: billingSchema,
  price_monthly_aed: z.number().nullable(),
  price_yearly_aed: z.number().nullable(),
  agent_split_pct: z.number().int().min(0).max(100),
  is_star: z.boolean(),
  is_active: z.boolean(),
  features: z.array(z.string().trim().min(1).max(200)).max(50),
  order: z.number().int().min(0).max(999),
});

export type UpdatePlanInput = z.input<typeof updateSchema>;

export async function updatePlanAction(
  planKey: string,
  raw: UpdatePlanInput,
): Promise<PlanActionResult> {
  const caller = await requireRole("admin");
  if (!planKey) return { ok: false, error: "Missing plan key." };

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const admin = createSupabaseAdminClient();

  const { data: before } = await admin
    .from("membership_plans")
    .select("*")
    .eq("key", planKey)
    .maybeSingle();
  if (!before) return { ok: false, error: "Plan not found." };

  const update = {
    label: parsed.data.label,
    tagline: parsed.data.tagline,
    billing_cycle: parsed.data.billing_cycle,
    price_monthly_aed: parsed.data.price_monthly_aed,
    price_yearly_aed: parsed.data.price_yearly_aed,
    agent_split_pct: parsed.data.agent_split_pct,
    is_star: parsed.data.is_star,
    is_active: parsed.data.is_active,
    features_json: parsed.data.features as unknown as Json,
    order: parsed.data.order,
  };

  const { error } = await admin
    .from("membership_plans")
    .update(update)
    .eq("key", planKey);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: "platform.plan_update",
    entity_type: "membership_plan",
    entity_id: planKey,
    diff: {
      before: {
        label: before.label,
        tagline: before.tagline,
        billing_cycle: before.billing_cycle,
        price_monthly_aed: before.price_monthly_aed,
        price_yearly_aed: before.price_yearly_aed,
        agent_split_pct: before.agent_split_pct,
        is_star: before.is_star,
        is_active: before.is_active,
        features_json: before.features_json,
        order: before.order,
      },
      after: update,
    },
    actor: { id: caller.id, email: caller.email, role: caller.role },
  });

  revalidatePath("/manage/plans");
  return { ok: true };
}
