import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EnrolledTrackSummary = {
  enrollment: { id: string; status: string; enrolled_at: string };
  track: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    cover_url: string | null;
    duration_minutes: number | null;
    specialty: { id: string; slug: string; name: string } | null;
    level: { id: string; slug: string; name: string } | null;
  };
  completedLessons: number;
  totalLessons: number;
  lastLesson: { id: string; title: string; trackSlug: string } | null;
};

export async function getDashboardData(userId: string): Promise<EnrolledTrackSummary[]> {
  const supabase = await createSupabaseServerClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `id, status, enrolled_at, track_id,
       track:tracks!enrollments_track_id_fkey(
         id, slug, title, subtitle, cover_url, duration_minutes,
         specialty:specialties(id, slug, name),
         level:track_levels(id, slug, name)
       )`,
    )
    .eq("user_id", userId)
    .in("status", ["active", "completed"])
    .order("enrolled_at", { ascending: false });

  if (!enrollments?.length) return [];

  const trackIds = enrollments.map((e) => e.track_id);

  // Get total lesson counts per track
  const { data: modules } = await supabase
    .from("modules")
    .select("id, track_id")
    .in("track_id", trackIds);

  const moduleIds = (modules ?? []).map((m) => m.id);
  const allLessonsRes = moduleIds.length > 0
    ? await supabase
        .from("lessons")
        .select("id, module_id, position, title")
        .in("module_id", moduleIds)
    : null;
  const allLessons = allLessonsRes?.data;

  // Build module → track map
  const moduleTrackMap: Record<string, string> = {};
  for (const m of modules ?? []) moduleTrackMap[m.id] = m.track_id;

  // Get completed lessons for user
  const lessonIds = (allLessons ?? []).map((l) => l.id);
  const completedProgressRes = lessonIds.length > 0
    ? await supabase
        .from("progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .not("completed_at", "is", null)
        .in("lesson_id", lessonIds)
    : null;
  const completedProgress = completedProgressRes?.data;

  const completedSet = new Set((completedProgress ?? []).map((p) => p.lesson_id));

  // Most recent progress (for "continue" CTA)
  const { data: recentProgress } = await supabase
    .from("progress")
    .select("lesson_id, updated_at")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds)
    .order("updated_at", { ascending: false })
    .limit(20);

  // Build per-track last-lesson map
  const trackLastLesson: Record<
    string,
    { lessonId: string; title: string }
  > = {};
  for (const p of recentProgress ?? []) {
    const lesson = (allLessons ?? []).find((l) => l.id === p.lesson_id);
    if (!lesson) continue;
    const trackId = moduleTrackMap[lesson.module_id];
    if (trackId && !trackLastLesson[trackId]) {
      trackLastLesson[trackId] = { lessonId: p.lesson_id, title: lesson.title };
    }
  }

  // Build per-track lesson lists
  const trackLessons: Record<string, string[]> = {};
  for (const l of allLessons ?? []) {
    const tid = moduleTrackMap[l.module_id];
    if (!tid) continue;
    trackLessons[tid] = trackLessons[tid] ?? [];
    trackLessons[tid].push(l.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return enrollments.map((e: any): EnrolledTrackSummary => {
    const t = e.track;
    const lessons = trackLessons[e.track_id] ?? [];
    const completed = lessons.filter((id) => completedSet.has(id)).length;
    const lastLesson = trackLastLesson[e.track_id];
    // If no progress yet, point to first lesson
    const firstLesson = (allLessons ?? [])
      .filter((l) => moduleTrackMap[l.module_id] === e.track_id)
      .sort((a, b) => a.position - b.position)[0];

    return {
      enrollment: { id: e.id, status: e.status, enrolled_at: e.enrolled_at },
      track: {
        id: t.id,
        slug: t.slug,
        title: t.title,
        subtitle: t.subtitle,
        cover_url: t.cover_url,
        duration_minutes: t.duration_minutes,
        specialty: t.specialty,
        level: t.level,
      },
      completedLessons: completed,
      totalLessons: lessons.length,
      lastLesson: lastLesson
        ? { id: lastLesson.lessonId, title: lastLesson.title, trackSlug: t.slug }
        : firstLesson
          ? { id: firstLesson.id, title: firstLesson.title, trackSlug: t.slug }
          : null,
    };
  });
}
