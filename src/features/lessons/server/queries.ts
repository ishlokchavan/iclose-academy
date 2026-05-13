import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LessonContext } from "@/features/tracks/types";

export async function getLessonContext({
  lessonId,
  userId,
}: {
  lessonId: string;
  userId: string;
}): Promise<LessonContext | null> {
  const supabase = await createSupabaseServerClient();

  const [{ data: lesson }, { data: progress }] = await Promise.all([
    supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle(),
    supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle(),
  ]);

  if (!lesson) return null;

  const [{ data: resources }, { data: module }] = await Promise.all([
    supabase
      .from("lesson_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("sort_order"),
    supabase.from("modules").select("*").eq("id", lesson.module_id).maybeSingle(),
  ]);

  if (!module) return null;

  const { data: track } = await supabase
    .from("tracks")
    .select("id, slug, title, status")
    .eq("id", module.track_id)
    .maybeSingle();

  if (!track || track.status !== "published") return null;

  const { data: allModules } = await supabase
    .from("modules")
    .select("id, position, title")
    .eq("track_id", track.id)
    .order("position");

  const moduleIds = (allModules ?? []).map((m) => m.id);
  const allLessonsRes = moduleIds.length > 0
    ? await supabase
        .from("lessons")
        .select("id, position, title, duration_seconds, is_preview, module_id")
        .in("module_id", moduleIds)
        .order("position")
    : null;
  const allLessons = allLessonsRes?.data;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("user_id", userId)
    .eq("track_id", track.id)
    .maybeSingle();

  const moduleRail = (allModules ?? []).map((m) => ({
    module: m,
    lessons: (allLessons ?? [])
      .filter((l) => l.module_id === m.id)
      .sort((a, b) => a.position - b.position),
  }));

  return {
    lesson: { ...lesson, resources: resources ?? [] },
    module,
    track,
    moduleRail,
    progress: progress ?? null,
    enrollment: enrollment ?? null,
  };
}
