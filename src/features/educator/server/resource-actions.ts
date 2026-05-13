"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createFileResourceSchema,
  createLinkResourceSchema,
} from "@/features/educator/schemas/curriculum";

export type ActionResult = { error?: string };

function assertCanAuthor(role: string) {
  if (role !== "educator" && role !== "content_manager" && role !== "admin") {
    throw new Error("Only educators and staff can edit resources");
  }
}

function revalidate(slug: string) {
  revalidatePath(`/educator/tracks/${slug}/curriculum`);
  revalidatePath(`/tracks/${slug}`);
}

async function nextSortOrder(lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("lesson_resources")
    .select("sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: false })
    .limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1;
}

// ----------------------------------------------------------------------------
// Add an external link
// ----------------------------------------------------------------------------
export async function createLinkResourceAction(
  lessonId: string,
  trackSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = createLinkResourceSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const sort_order = await nextSortOrder(lessonId);
  const { error } = await supabase.from("lesson_resources").insert({
    lesson_id: lessonId,
    label: parsed.data.label,
    url: parsed.data.url,
    kind: "link",
    sort_order,
  });
  if (error) return { error: error.message };

  revalidate(trackSlug);
  return {};
}

// ----------------------------------------------------------------------------
// Register an uploaded file (the actual upload happens client-side to Storage;
// this records the row pointing at it).
// ----------------------------------------------------------------------------
export async function createFileResourceAction(
  lessonId: string,
  trackSlug: string,
  payload: { label: string; storage_path: string },
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = createFileResourceSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const sort_order = await nextSortOrder(lessonId);
  const { error } = await supabase.from("lesson_resources").insert({
    lesson_id: lessonId,
    label: parsed.data.label,
    storage_path: parsed.data.storage_path,
    kind: "file",
    sort_order,
  });
  if (error) return { error: error.message };

  revalidate(trackSlug);
  return {};
}

// ----------------------------------------------------------------------------
// Delete a resource (also removes the file from Storage if applicable).
// ----------------------------------------------------------------------------
export async function deleteResourceAction(
  resourceId: string,
  trackSlug: string,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("lesson_resources")
    .select("storage_path")
    .eq("id", resourceId)
    .maybeSingle();

  if (row?.storage_path) {
    await supabase.storage.from("lesson-resources").remove([row.storage_path]);
  }

  const { error } = await supabase.from("lesson_resources").delete().eq("id", resourceId);
  if (error) return { error: error.message };

  revalidate(trackSlug);
  return {};
}
