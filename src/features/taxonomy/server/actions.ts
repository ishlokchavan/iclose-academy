"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMinRole } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const name = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : ""),
  z.string().min(1, "Name is required").max(120),
);

const slug = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : ""),
  z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(80)
    .regex(slugRegex, "Lowercase letters, numbers, hyphens only"),
);

const optionalString = (max: number) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string") return null;
      const t = v.trim();
      return t.length > 0 ? t : null;
    },
    z.union([z.null(), z.string().max(max)]),
  );

const optionalUuid = z.preprocess(
  (v) => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  },
  z.union([z.null(), z.string().uuid()]),
);

export type ActionResult = { error?: string };

function revalidate() {
  revalidatePath("/staff/taxonomy");
  revalidatePath("/topics");
  revalidatePath("/educator");
  revalidatePath("/inquiries/new");
}

// ============================================================================
// AREAS
// ============================================================================
const createAreaSchema = z.object({ name, slug, description: optionalString(280) });

export async function createAreaAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireMinRole("manager");
  const parsed = createAreaSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("areas").insert(parsed.data);
  if (error) {
    if (error.code === "23505") return { error: "Slug already exists" };
    return { error: error.message };
  }
  revalidate();
  return {};
}

export async function updateAreaAction(
  areaId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireMinRole("manager");
  const parsed = createAreaSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("areas").update(parsed.data).eq("id", areaId);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteAreaAction(areaId: string): Promise<ActionResult> {
  await requireMinRole("manager");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("areas").delete().eq("id", areaId);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function setAreaEducatorAction(
  areaId: string,
  educatorId: string | null,
): Promise<ActionResult> {
  await requireMinRole("manager");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("areas")
    .update({ educator_id: educatorId })
    .eq("id", areaId);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ============================================================================
// PROPERTY TYPES
// ============================================================================
const typeSchema = z.object({ name, slug });

export async function createTypeAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireMinRole("manager");
  const parsed = typeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("property_types").insert(parsed.data);
  if (error) {
    if (error.code === "23505") return { error: "Slug already exists" };
    return { error: error.message };
  }
  revalidate();
  return {};
}

export async function updateTypeAction(
  typeId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireMinRole("manager");
  const parsed = typeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("property_types").update(parsed.data).eq("id", typeId);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteTypeAction(typeId: string): Promise<ActionResult> {
  await requireMinRole("manager");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("property_types").delete().eq("id", typeId);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

// ============================================================================
// PROPERTY SUBTYPES
// ============================================================================
const subtypeSchema = z.object({ name, slug, type_id: optionalUuid });

export async function createSubtypeAction(
  typeId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireMinRole("manager");
  const parsed = subtypeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    type_id: typeId,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (!parsed.data.type_id) return { error: "Type id required" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("property_subtypes").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    type_id: parsed.data.type_id,
  });
  if (error) {
    if (error.code === "23505") return { error: "Slug already exists under this type" };
    return { error: error.message };
  }
  revalidate();
  return {};
}

export async function deleteSubtypeAction(subtypeId: string): Promise<ActionResult> {
  await requireMinRole("manager");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("property_subtypes").delete().eq("id", subtypeId);
  if (error) return { error: error.message };
  revalidate();
  return {};
}
