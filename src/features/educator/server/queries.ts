import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type TrackStatus = Database["public"]["Enums"]["track_status"];

export type EducatorTrackRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  status: TrackStatus;
  cover_url: string | null;
  duration_minutes: number | null;
  published_at: string | null;
  updated_at: string;
  specialty: { id: string; slug: string; name: string } | null;
  level: { id: string; slug: string; name: string } | null;
  lessonCount: number;
};

export type EducatorOverview = {
  total: number;
  byStatus: Record<TrackStatus, number>;
  recent: EducatorTrackRow[];
};

const EMPTY_STATUS: Record<TrackStatus, number> = {
  draft: 0,
  in_review: 0,
  published: 0,
  archived: 0,
};

export async function getEducatorTracks(
  userId: string,
  filter?: TrackStatus,
): Promise<EducatorTrackRow[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("tracks")
    .select(
      `id, slug, title, subtitle, status, cover_url, duration_minutes,
       published_at, updated_at,
       specialty:specialties(id, slug, name),
       level:track_levels(id, slug, name),
       modules(id, lessons(id))`,
    )
    .eq("educator_id", userId)
    .order("updated_at", { ascending: false });

  if (filter) query = query.eq("status", filter);

  const { data } = await query;
  if (!data?.length) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((t: any): EducatorTrackRow => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    status: t.status,
    cover_url: t.cover_url,
    duration_minutes: t.duration_minutes,
    published_at: t.published_at,
    updated_at: t.updated_at,
    specialty: t.specialty,
    level: t.level,
    lessonCount: (t.modules ?? []).reduce(
      (sum: number, m: { lessons: unknown[] }) => sum + (m.lessons?.length ?? 0),
      0,
    ),
  }));
}

export async function getEducatorOverview(userId: string): Promise<EducatorOverview> {
  const all = await getEducatorTracks(userId);
  const byStatus: Record<TrackStatus, number> = { ...EMPTY_STATUS };
  for (const t of all) byStatus[t.status] += 1;
  return {
    total: all.length,
    byStatus,
    recent: all.slice(0, 5),
  };
}

export type EducatorTrackDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  description: string | null;
  status: TrackStatus;
  cover_url: string | null;
  hero_url: string | null;
  duration_minutes: number | null;
  specialty_id: string | null;
  level_id: string | null;
  outcomes: string[];
  prerequisites: string[];
  educator_id: string;
  published_at: string | null;
  archived_at: string | null;
  modules: Array<{
    id: string;
    position: number;
    title: string;
    summary: string | null;
    lessons: Array<{
      id: string;
      position: number;
      title: string;
      summary: string | null;
      duration_seconds: number | null;
      is_preview: boolean;
      youtube_id: string | null;
    }>;
  }>;
};

export async function getEducatorTrackBySlug(
  slug: string,
  userId: string,
  isStaff: boolean,
): Promise<EducatorTrackDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tracks")
    .select(
      `id, slug, title, subtitle, summary, description, status,
       cover_url, hero_url, duration_minutes,
       specialty_id, level_id, outcomes, prerequisites,
       educator_id, published_at, archived_at,
       modules(
         id, position, title, summary,
         lessons(id, position, title, summary, duration_seconds, is_preview, youtube_id)
       )`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = data as any;
  if (!isStaff && r.educator_id !== userId) return null;

  const modules = (r.modules ?? [])
    .map((m: { lessons?: { position: number }[] } & Record<string, unknown>) => ({
      ...m,
      lessons: ((m.lessons ?? []) as { position: number }[]).sort(
        (a, b) => a.position - b.position,
      ),
    }))
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position);

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    summary: r.summary,
    description: r.description,
    status: r.status,
    cover_url: r.cover_url,
    hero_url: r.hero_url,
    duration_minutes: r.duration_minutes,
    specialty_id: r.specialty_id,
    level_id: r.level_id,
    outcomes: Array.isArray(r.outcomes) ? (r.outcomes as string[]) : [],
    prerequisites: Array.isArray(r.prerequisites) ? (r.prerequisites as string[]) : [],
    educator_id: r.educator_id,
    published_at: r.published_at,
    archived_at: r.archived_at,
    modules,
  };
}

export async function getTaxonomies() {
  const supabase = await createSupabaseServerClient();
  const [{ data: specialties }, { data: levels }] = await Promise.all([
    supabase
      .from("specialties")
      .select("id, slug, name, sort_order")
      .is("archived_at", null)
      .order("sort_order"),
    supabase.from("track_levels").select("id, slug, name, sort_order").order("sort_order"),
  ]);
  return {
    specialties: specialties ?? [],
    levels: levels ?? [],
  };
}
