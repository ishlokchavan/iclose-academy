"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMinRole } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EducatorActionResult = { error?: string };

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name:  z.string().min(1, "Last name is required"),
  email:      z.string().email("Enter a valid email").or(z.literal("")).optional(),
  phone:      z.string().optional(),
  bio:        z.string().optional(),
  expertise:  z.string().optional(),
  photo_url:  z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

function buildName(first: string, last: string) {
  return [first, last].filter(Boolean).join(" ");
}

export async function createEducatorAction(fields: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  bio?: string;
  expertise?: string;
  photo_url?: string;
}): Promise<EducatorActionResult> {
  await requireMinRole("manager");

  const parsed = schema.safeParse(fields);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { first_name, last_name, email, phone, bio, expertise, photo_url } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("educators").insert({
    name:       buildName(first_name, last_name),
    first_name: first_name || null,
    last_name:  last_name || null,
    email:      email || null,
    phone:      phone || null,
    bio:        bio || null,
    expertise:  expertise || null,
    photo_url:  photo_url || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/manage/educators");
  return {};
}

export async function updateEducatorAction(
  id: string,
  fields: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    bio?: string;
    expertise?: string;
    photo_url?: string;
  },
): Promise<EducatorActionResult> {
  await requireMinRole("manager");

  const parsed = schema.safeParse(fields);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { first_name, last_name, email, phone, bio, expertise, photo_url } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("educators")
    .update({
      name:       buildName(first_name, last_name),
      first_name: first_name || null,
      last_name:  last_name || null,
      email:      email || null,
      phone:      phone || null,
      bio:        bio || null,
      expertise:  expertise || null,
      photo_url:  photo_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/educators");
  return {};
}

export async function deleteEducatorAction(id: string): Promise<EducatorActionResult> {
  await requireMinRole("manager");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("educators").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/manage/educators");
  return {};
}
