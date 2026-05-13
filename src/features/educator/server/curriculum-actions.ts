"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createLessonSchema,
  createModuleSchema,
  updateLessonSchema,
  updateModuleSchema,
} from "@/features/educator/schemas/curriculum";

export type ActionResult = { error?: string };

function assertCanAuthor(role: string) {
  if (role !== "educator" && role !== "content_manager" && role !== "admin") {
    throw new Error("Only educators and staff can author curriculum");
  }
}

function revalidateCurriculum(slug: string) {
  revalidatePath(`/educator/tracks/${slug}/curriculum`);
  revalidatePath(`/educator/tracks/${slug}`);
  revalidatePath(`/tracks/${slug}`);
}

// ============================================================================
// MODULES
// ============================================================================
export async function createModuleAction(
  trackId: string,
  trackSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = createModuleSchema.safeParse({
    trackId,
    title: formData.get("title"),
    summary: formData.get("summary"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();

  // Position: append at the end of existing modules.
  const { data: existing } = await supabase
    .from("modules")
    .select("position")
    .eq("track_id", trackId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPosition = ((existing?.[0]?.position as number | undefined) ?? 0) + 1;

  const { error } = await supabase.from("modules").insert({
    track_id: trackId,
    title: parsed.data.title,
    summary: parsed.data.summary,
    position: nextPosition,
  });
  if (error) return { error: error.message };

  revalidateCurriculum(trackSlug);
  return {};
}

export async function updateModuleAction(
  moduleId: string,
  trackSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = updateModuleSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("modules")
    .update({
      title: parsed.data.title,
      summary: parsed.data.summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId);
  if (error) return { error: error.message };

  revalidateCurriculum(trackSlug);
  return {};
}

export async function deleteModuleAction(
  moduleId: string,
  trackSlug: string,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) return { error: error.message };

  revalidateCurriculum(trackSlug);
  return {};
}

export async function moveModuleAction(
  moduleId: string,
  direction: "up" | "down",
  trackSlug: string,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase
    .from("modules")
    .select("id, position, track_id")
    .eq("id", moduleId)
    .maybeSingle();
  if (!current) return { error: "Module not found" };

  const base = supabase
    .from("modules")
    .select("id, position")
    .eq("track_id", current.track_id);
  const { data: neighbors } =
    direction === "up"
      ? await base
          .lt("position", current.position)
          .order("position", { ascending: false })
          .limit(1)
      : await base
          .gt("position", current.position)
          .order("position", { ascending: true })
          .limit(1);
  const neighbor = neighbors?.[0];
  if (!neighbor) return {}; // already at the end

  // Swap positions.
  const { error: e1 } = await supabase
    .from("modules")
    .update({ position: neighbor.position })
    .eq("id", current.id);
  if (e1) return { error: e1.message };
  const { error: e2 } = await supabase
    .from("modules")
    .update({ position: current.position })
    .eq("id", neighbor.id);
  if (e2) return { error: e2.message };

  revalidateCurriculum(trackSlug);
  return {};
}

// ============================================================================
// LESSONS
// ============================================================================
export async function createLessonAction(
  moduleId: string,
  trackSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = createLessonSchema.safeParse({
    moduleId,
    title: formData.get("title"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("lessons")
    .select("position")
    .eq("module_id", moduleId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPosition = ((existing?.[0]?.position as number | undefined) ?? 0) + 1;

  const { error } = await supabase.from("lessons").insert({
    module_id: moduleId,
    title: parsed.data.title,
    position: nextPosition,
  });
  if (error) return { error: error.message };

  revalidateCurriculum(trackSlug);
  return {};
}

export async function updateLessonAction(
  lessonId: string,
  trackSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = updateLessonSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    youtube_id: formData.get("youtube_id"),
    duration_seconds: formData.get("duration_seconds"),
    is_preview: formData.get("is_preview"),
    chapters: formData.get("chapters"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      title: parsed.data.title,
      summary: parsed.data.summary,
      youtube_id: parsed.data.youtube_id,
      duration_seconds: parsed.data.duration_seconds,
      is_preview: parsed.data.is_preview,
      chapters: parsed.data.chapters,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId);
  if (error) return { error: error.message };

  revalidateCurriculum(trackSlug);
  return {};
}

export async function deleteLessonAction(
  lessonId: string,
  trackSlug: string,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { error: error.message };

  revalidateCurriculum(trackSlug);
  return {};
}

export async function moveLessonAction(
  lessonId: string,
  direction: "up" | "down",
  trackSlug: string,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase
    .from("lessons")
    .select("id, position, module_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!current) return { error: "Lesson not found" };

  const base = supabase
    .from("lessons")
    .select("id, position")
    .eq("module_id", current.module_id);
  const { data: neighbors } =
    direction === "up"
      ? await base
          .lt("position", current.position)
          .order("position", { ascending: false })
          .limit(1)
      : await base
          .gt("position", current.position)
          .order("position", { ascending: true })
          .limit(1);
  const neighbor = neighbors?.[0];
  if (!neighbor) return {};

  const { error: e1 } = await supabase
    .from("lessons")
    .update({ position: neighbor.position })
    .eq("id", current.id);
  if (e1) return { error: e1.message };
  const { error: e2 } = await supabase
    .from("lessons")
    .update({ position: current.position })
    .eq("id", neighbor.id);
  if (e2) return { error: e2.message };

  revalidateCurriculum(trackSlug);
  return {};
}
