import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TrackCardData, TrackWithContent } from "../types";

export async function getSpecialties() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("specialties")
    .select("id, slug, name, sort_order, description, icon")
    .is("archived_at", null)
    .order("sort_order");
  return data ?? [];
}

export async function getTracks({
  specialtySlug,
  userId,
}: { specialtySlug?: string; userId?: string } = {}) {
  const supabase = await createSupabaseServerClient();

  let baseQuery = supabase
    .from("tracks")
    .select(
      `id, slug, title, subtitle, summary, cover_url, duration_minutes,
       specialty:specialties(id, slug, name),
       level:track_levels(id, slug, name),
       educator:profiles!tracks_educator_id_fkey(full_name, avatar_url),
       modules(id, lessons(id))`,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (specialtySlug) {
    const { data: specialty } = await supabase
      .from("specialties")
      .select("id")
      .eq("slug", specialtySlug)
      .maybeSingle();
    if (specialty) {
      baseQuery = baseQuery.eq("specialty_id", specialty.id);
    }
  }

  const { data: rawTracks } = await baseQuery;
  if (!rawTracks?.length) return [];

  const trackIds = rawTracks.map((t) => t.id);
  const enrollmentMap: Record<string, { id: string; status: string }> = {};
  const savedSet = new Set<string>();

  if (userId) {
    const [{ data: enrollments }, { data: saved }] = await Promise.all([
      supabase
        .from("enrollments")
        .select("id, track_id, status")
        .eq("user_id", userId)
        .in("track_id", trackIds),
      supabase
        .from("saved_items")
        .select("entity_id")
        .eq("user_id", userId)
        .eq("entity_type", "track")
        .in("entity_id", trackIds),
    ]);
    for (const e of enrollments ?? []) {
      enrollmentMap[e.track_id] = { id: e.id, status: e.status };
    }
    for (const s of saved ?? []) savedSet.add(s.entity_id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawTracks.map((t: any): TrackCardData => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    summary: t.summary,
    cover_url: t.cover_url,
    duration_minutes: t.duration_minutes,
    specialty: t.specialty,
    level: t.level,
    educator: t.educator,
    enrollment: enrollmentMap[t.id] ?? null,
    saved: savedSet.has(t.id),
    lessonCount: (t.modules ?? []).reduce(
      (sum: number, m: { lessons: unknown[] }) => sum + (m.lessons?.length ?? 0),
      0,
    ),
  }));
}

export async function getTrackWithContent({
  slug,
  userId,
}: {
  slug: string;
  userId?: string;
}): Promise<TrackWithContent | null> {
  const supabase = await createSupabaseServerClient();

  const { data: raw } = await supabase
    .from("tracks")
    .select(
      `id, slug, title, subtitle, summary, description, cover_url, hero_url,
       duration_minutes, outcomes, prerequisites,
       specialty:specialties(id, slug, name),
       level:track_levels(id, slug, name),
       educator:profiles!tracks_educator_id_fkey(full_name, avatar_url),
       modules(
         id, position, title, summary, track_id, created_at, updated_at,
         lessons(id, position, title, summary, duration_seconds, is_preview, youtube_id, module_id, chapters, created_at, updated_at)
       )`,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!raw) return null;

  let enrollment: { id: string; status: string } | null = null;
  let saved = false;
  if (userId) {
    const [{ data: e }, { data: s }] = await Promise.all([
      supabase
        .from("enrollments")
        .select("id, status")
        .eq("user_id", userId)
        .eq("track_id", raw.id)
        .maybeSingle(),
      supabase
        .from("saved_items")
        .select("id")
        .eq("user_id", userId)
        .eq("entity_type", "track")
        .eq("entity_id", raw.id)
        .maybeSingle(),
    ]);
    enrollment = e;
    saved = !!s;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  const modules = (r.modules ?? [])
    .sort(
      (a: { position: number }, b: { position: number }) =>
        a.position - b.position,
    )
    .map((m: { lessons: { position: number }[] }) => ({
      ...m,
      lessons: (m.lessons ?? []).sort(
        (a: { position: number }, b: { position: number }) =>
          a.position - b.position,
      ),
    }));

  const lessonCount = modules.reduce(
    (sum: number, m: { lessons: unknown[] }) => sum + m.lessons.length,
    0,
  );

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    summary: r.summary,
    description: r.description,
    cover_url: r.cover_url,
    duration_minutes: r.duration_minutes,
    specialty: r.specialty,
    level: r.level,
    educator: r.educator,
    outcomes: Array.isArray(r.outcomes) ? (r.outcomes as string[]) : [],
    prerequisites: Array.isArray(r.prerequisites)
      ? (r.prerequisites as string[])
      : [],
    modules,
    enrollment,
    saved,
    lessonCount,
  };
}
