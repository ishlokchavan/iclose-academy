import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type TrackStatus = Database["public"]["Enums"]["track_status"];

export type StaffTrackRow = {
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
  educator: { id: string; full_name: string | null; avatar_url: string | null };
  lessonCount: number;
  moduleCount: number;
};

export type StaffOverview = {
  total: number;
  byStatus: Record<TrackStatus, number>;
  educators: number;
  recentInReview: StaffTrackRow[];
};

const EMPTY_STATUS: Record<TrackStatus, number> = {
  draft: 0,
  in_review: 0,
  published: 0,
  archived: 0,
};

export async function getStaffTracks(filter?: TrackStatus): Promise<StaffTrackRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("tracks")
    .select(
      `id, slug, title, subtitle, status, cover_url, duration_minutes,
       published_at, updated_at,
       specialty:specialties(id, slug, name),
       level:track_levels(id, slug, name),
       educator:profiles!tracks_educator_id_fkey(id, full_name, avatar_url),
       modules(id, lessons(id))`,
    )
    .order("updated_at", { ascending: false });
  if (filter) query = query.eq("status", filter);

  const { data } = await query;
  if (!data?.length) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((t: any): StaffTrackRow => ({
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
    educator: t.educator ?? { id: "", full_name: null, avatar_url: null },
    moduleCount: (t.modules ?? []).length,
    lessonCount: (t.modules ?? []).reduce(
      (sum: number, m: { lessons: unknown[] }) => sum + (m.lessons?.length ?? 0),
      0,
    ),
  }));
}

export async function getStaffOverview(): Promise<StaffOverview> {
  const supabase = await createSupabaseServerClient();

  const [allTracks, educatorsRes] = await Promise.all([
    getStaffTracks(),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["educator", "content_manager", "admin"]),
  ]);

  const byStatus: Record<TrackStatus, number> = { ...EMPTY_STATUS };
  for (const t of allTracks) byStatus[t.status] += 1;

  return {
    total: allTracks.length,
    byStatus,
    educators: educatorsRes.count ?? 0,
    recentInReview: allTracks.filter((t) => t.status === "in_review").slice(0, 5),
  };
}

export type StaffTrackDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  description: string | null;
  status: TrackStatus;
  cover_url: string | null;
  duration_minutes: number | null;
  outcomes: string[];
  prerequisites: string[];
  published_at: string | null;
  archived_at: string | null;
  specialty: { id: string; slug: string; name: string } | null;
  level: { id: string; slug: string; name: string } | null;
  educator: { id: string; full_name: string | null; avatar_url: string | null };
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

export async function getStaffTrackBySlug(slug: string): Promise<StaffTrackDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tracks")
    .select(
      `id, slug, title, subtitle, summary, description, status,
       cover_url, duration_minutes, outcomes, prerequisites,
       published_at, archived_at,
       specialty:specialties(id, slug, name),
       level:track_levels(id, slug, name),
       educator:profiles!tracks_educator_id_fkey(id, full_name, avatar_url),
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
  type RawLesson = {
    id: string; position: number; title: string; summary: string | null;
    duration_seconds: number | null; is_preview: boolean; youtube_id: string | null;
  };
  const modules = (r.modules ?? [])
    .map((m: { lessons?: RawLesson[] } & Record<string, unknown>) => ({
      ...m,
      lessons: ((m.lessons ?? []) as RawLesson[]).sort((a, b) => a.position - b.position),
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
    duration_minutes: r.duration_minutes,
    outcomes: Array.isArray(r.outcomes) ? (r.outcomes as string[]) : [],
    prerequisites: Array.isArray(r.prerequisites) ? (r.prerequisites as string[]) : [],
    published_at: r.published_at,
    archived_at: r.archived_at,
    specialty: r.specialty,
    level: r.level,
    educator: r.educator ?? { id: "", full_name: null, avatar_url: null },
    modules,
  };
}
