"use server";

import { revalidatePath } from "next/cache";

import { requireMinRole } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createPartnerSchema,
  updatePartnerSchema,
  type CreatePartnerInput,
  type UpdatePartnerInput,
} from "@/features/partner-management/schemas/partner";

export type PartnerActionResult = { error?: string; id?: string };

function randomCode(prefix = "p"): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${random}`;
}

export async function createPartnerAction(
  fields: CreatePartnerInput,
): Promise<PartnerActionResult> {
  await requireMinRole("manager");
  const parsed = createPartnerSchema.safeParse(fields);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, phone, code } = parsed.data;

  const admin = createSupabaseAdminClient();

  // Email uniqueness — partners.email isn't unique in the schema but we
  // enforce it here so admins don't create dupes by mistake.
  const { data: existing } = await admin
    .from("partners")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (existing) return { error: "A partner with that email already exists." };

  let finalCode = code ?? randomCode();
  // Code is unique in the DB; retry once on collision.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: byCode } = await admin
      .from("partners")
      .select("id")
      .eq("code", finalCode)
      .maybeSingle();
    if (!byCode) break;
    if (code) return { error: "That code is already taken." };
    finalCode = randomCode();
  }

  const { data: row, error } = await admin
    .from("partners")
    .insert({ name, email, phone, code: finalCode, status: "active" })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  return { id: row.id };
}

export async function updatePartnerAction(
  id: string,
  fields: UpdatePartnerInput,
): Promise<PartnerActionResult> {
  await requireMinRole("manager");
  const parsed = updatePartnerSchema.safeParse(fields);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const admin = createSupabaseAdminClient();

  // Guard code collisions for code changes.
  const { data: byCode } = await admin
    .from("partners")
    .select("id")
    .eq("code", parsed.data.code)
    .neq("id", id)
    .maybeSingle();
  if (byCode) return { error: "That code is already taken." };

  const { error } = await admin
    .from("partners")
    .update({
      name:   parsed.data.name,
      phone:  parsed.data.phone,
      code:   parsed.data.code,
      status: parsed.data.status,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  revalidatePath("/partner/dashboard");
  revalidatePath("/partner/profile");
  return { id };
}

export async function setPartnerStatusAction(
  id: string,
  status: "active" | "inactive",
): Promise<PartnerActionResult> {
  await requireMinRole("manager");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("partners")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  return { id };
}

export async function deletePartnerAction(
  id: string,
): Promise<PartnerActionResult> {
  // Restrict deletion to admin only — soft delete via status is safer for managers.
  await requireMinRole("admin");
  const admin = createSupabaseAdminClient();

  // referral_conversions / commissions FK with no cascade — clear them first.
  await admin.from("referral_conversions").delete().eq("partner_id", id);
  await admin.from("commissions").delete().eq("partner_id", id);

  const { error } = await admin.from("partners").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/partners");
  return { id };
}
