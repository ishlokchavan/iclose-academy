"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  name:      z.string().min(1, "Name is required"),
  photo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bio:       z.string().optional(),
});

export type EducatorActionState = { error?: string; success?: boolean } | null;

export async function createEducatorAction(
  _prev: EducatorActionState,
  formData: FormData,
): Promise<EducatorActionState> {
  const parsed = schema.safeParse({
    name:      formData.get("name"),
    photo_url: formData.get("photo_url") || undefined,
    bio:       formData.get("bio") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("educators").insert({
    name:      parsed.data.name,
    photo_url: parsed.data.photo_url || null,
    bio:       parsed.data.bio || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/manage/educators");
  return { success: true };
}

export async function updateEducatorAction(
  id: string,
  _prev: EducatorActionState,
  formData: FormData,
): Promise<EducatorActionState> {
  const parsed = schema.safeParse({
    name:      formData.get("name"),
    photo_url: formData.get("photo_url") || undefined,
    bio:       formData.get("bio") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("educators")
    .update({
      name:       parsed.data.name,
      photo_url:  parsed.data.photo_url || null,
      bio:        parsed.data.bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/educators");
  return { success: true };
}

export async function deleteEducatorAction(id: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("educators").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/manage/educators");
  return {};
}
