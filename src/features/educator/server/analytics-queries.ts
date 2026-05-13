import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EducatorAnalytics = {
  totals: {
    enrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    publishedTracks: number;
  };
  perTrack: Array<{
    trackId: string;
    trackTitle: string;
    trackSlug: string;
    status: string;
    enrollments: number;
    completedEnrollments: number;
    activeEnrollments: number;
    lessonCount: number;
    completedLessons: number;
    completionRate: number; // % of (completed lessons across enrolled learners) / (enrolled learners × lessons)
  }>;
};

export async function getEducatorAnalytics(userId: string): Promise<EducatorAnalytics> {
  const supabase = await createSupabaseServerClient();

  // Pull this educator's tracks + their lesson counts.
  const { data: tracksRaw } = await supabase
    .from("tracks")
    .select("id, slug, title, status, modules(id, lessons(id))")
    .eq("educator_id", userId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tracks = ((tracksRaw ?? []) as any[]).map((t) => ({
    id: t.id as string,
    slug: t.slug as string,
    title: t.title as string,
    status: t.status as string,
    lessonCount: (t.modules ?? []).reduce(
      (sum: number, m: { lessons: unknown[] }) => sum + (m.lessons?.length ?? 0),
      0,
    ),
    lessonIds: ((t.modules ?? []) as Array<{ lessons?: Array<{ id: string }> }>)
      .flatMap((m) => (m.lessons ?? []).map((l) => l.id)),
  }));

  if (tracks.length === 0) {
    return {
      totals: { enrollments: 0, activeEnrollments: 0, completedEnrollments: 0, publishedTracks: 0 },
      perTrack: [],
    };
  }

  const trackIds = tracks.map((t) => t.id);
  const allLessonIds = tracks.flatMap((t) => t.lessonIds);

  // Enrollments across this educator's tracks
  const { data: enrollmentsRaw } = await supabase
    .from("enrollments")
    .select("track_id, status")
    .in("track_id", trackIds);

  // Completed-lesson progress across all relevant lessons
  const { data: progressRaw } =
    allLessonIds.length > 0
      ? await supabase
          .from("progress")
          .select("lesson_id, user_id")
          .in("lesson_id", allLessonIds)
          .not("completed_at", "is", null)
      : { data: [] as Array<{ lesson_id: string; user_id: string }> };

  const completedByLesson = new Map<string, number>();
  for (const p of progressRaw ?? []) {
    completedByLesson.set(p.lesson_id, (completedByLesson.get(p.lesson_id) ?? 0) + 1);
  }

  const enrollmentsByTrack = new Map<string, { total: number; active: number; completed: number }>();
  for (const e of enrollmentsRaw ?? []) {
    const cur = enrollmentsByTrack.get(e.track_id) ?? { total: 0, active: 0, completed: 0 };
    cur.total += 1;
    if (e.status === "active") cur.active += 1;
    if (e.status === "completed") cur.completed += 1;
    enrollmentsByTrack.set(e.track_id, cur);
  }

  const perTrack = tracks.map((t) => {
    const e = enrollmentsByTrack.get(t.id) ?? { total: 0, active: 0, completed: 0 };
    const completedLessons = t.lessonIds.reduce(
      (sum, lid) => sum + (completedByLesson.get(lid) ?? 0),
      0,
    );
    const denom = e.total * t.lessonCount;
    const completionRate = denom > 0 ? Math.round((completedLessons / denom) * 100) : 0;
    return {
      trackId: t.id,
      trackTitle: t.title,
      trackSlug: t.slug,
      status: t.status,
      enrollments: e.total,
      activeEnrollments: e.active,
      completedEnrollments: e.completed,
      lessonCount: t.lessonCount,
      completedLessons,
      completionRate,
    };
  });

  const totals = perTrack.reduce(
    (acc, t) => ({
      enrollments: acc.enrollments + t.enrollments,
      activeEnrollments: acc.activeEnrollments + t.activeEnrollments,
      completedEnrollments: acc.completedEnrollments + t.completedEnrollments,
      publishedTracks: acc.publishedTracks + (t.status === "published" ? 1 : 0),
    }),
    { enrollments: 0, activeEnrollments: 0, completedEnrollments: 0, publishedTracks: 0 },
  );

  return { totals, perTrack };
}
