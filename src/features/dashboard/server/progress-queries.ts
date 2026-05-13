import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProgressEntry = {
  lessonId: string;
  lessonTitle: string;
  trackSlug: string;
  trackTitle: string;
  moduleTitle: string;
  positionSeconds: number;
  durationSeconds: number | null;
  completedAt: string | null;
  updatedAt: string;
};

export async function getRecentProgress(
  userId: string,
  limit = 40,
): Promise<ProgressEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("progress")
    .select(
      `lesson_id, position_seconds, completed_at, updated_at,
       lesson:lessons!inner(
         id, title, duration_seconds,
         module:modules!inner(
           id, title,
           track:tracks!inner(slug, title)
         )
       )`,
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[])
    .filter((p) => p.lesson?.module?.track)
    .map((p): ProgressEntry => ({
      lessonId: p.lesson_id,
      lessonTitle: p.lesson.title,
      trackSlug: p.lesson.module.track.slug,
      trackTitle: p.lesson.module.track.title,
      moduleTitle: p.lesson.module.title,
      positionSeconds: p.position_seconds ?? 0,
      durationSeconds: p.lesson.duration_seconds ?? null,
      completedAt: p.completed_at,
      updatedAt: p.updated_at,
    }));
}
