import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Area,
  PropertySubtype,
  PropertyType,
  TopicCard,
  TopicDetail,
  TopicFilters,
  TopicStatus,
} from "@/features/topics/types";

const TOPIC_SELECT = `
  id, slug, title, description, cover_url, youtube_id, status,
  subarea, published_at, updated_at,
  area:areas(id, slug, name),
  type:property_types(id, slug, name),
  topic_subtypes(subtype:property_subtypes(id, slug, name)),
  educator:profiles!topics_educator_id_fkey(id, full_name, avatar_url)
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shapeRow(t: any, savedSet: Set<string>): TopicCard {
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description,
    cover_url: t.cover_url,
    youtube_id: t.youtube_id,
    status: t.status,
    subarea: t.subarea,
    published_at: t.published_at,
    updated_at: t.updated_at,
    area: t.area,
    type: t.type,
    subtypes: ((t.topic_subtypes ?? []) as Array<{ subtype: { id: string; slug: string; name: string } | null }>)
      .map((x) => x.subtype)
      .filter((x): x is { id: string; slug: string; name: string } => !!x),
    educator: t.educator ?? { id: "", full_name: null, avatar_url: null },
    saved: savedSet.has(t.id),
  };
}

// ----------------------------------------------------------------------------
// Filter the public (published) library.
// ----------------------------------------------------------------------------
export async function getLibraryTopics(
  filters: TopicFilters = {},
  userId?: string,
): Promise<TopicCard[]> {
  const supabase = await createSupabaseServerClient();

  // Resolve filter slugs → ids (one round-trip).
  const [areasRes, typesRes, subtypesRes] = await Promise.all([
    filters.areaSlugs?.length
      ? supabase.from("areas").select("id, slug").in("slug", filters.areaSlugs)
      : Promise.resolve({ data: [] as Array<{ id: string; slug: string }> }),
    filters.typeSlugs?.length
      ? supabase.from("property_types").select("id, slug").in("slug", filters.typeSlugs)
      : Promise.resolve({ data: [] as Array<{ id: string; slug: string }> }),
    filters.subtypeSlugs?.length
      ? supabase.from("property_subtypes").select("id, slug").in("slug", filters.subtypeSlugs)
      : Promise.resolve({ data: [] as Array<{ id: string; slug: string }> }),
  ]);

  const areaIds = (areasRes.data ?? []).map((a) => a.id);
  const typeIds = (typesRes.data ?? []).map((t) => t.id);
  const subtypeIds = (subtypesRes.data ?? []).map((s) => s.id);

  let q = supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (areaIds.length) q = q.in("area_id", areaIds);
  if (typeIds.length) q = q.in("type_id", typeIds);
  if (filters.subareaQuery) q = q.ilike("subarea", `%${filters.subareaQuery}%`);
  if (filters.q) {
    q = q.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
  }

  const { data } = await q;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows = (data ?? []) as any[];

  // Subtype filter is post-fetch because subtypes is a M2M join.
  if (subtypeIds.length) {
    const idSet = new Set(subtypeIds);
    rows = rows.filter((t) =>
      (t.topic_subtypes ?? []).some(
        (st: { subtype: { id: string } | null }) => st.subtype && idSet.has(st.subtype.id),
      ),
    );
  }

  const savedSet = new Set<string>();
  if (userId && rows.length) {
    const { data: saved } = await supabase
      .from("saved_items")
      .select("entity_id")
      .eq("user_id", userId)
      .eq("entity_type", "topic")
      .in("entity_id", rows.map((r) => r.id));
    for (const s of saved ?? []) savedSet.add(s.entity_id);
  }

  return rows.map((t) => shapeRow(t, savedSet));
}

// ----------------------------------------------------------------------------
// Topics owned by a single educator (any status).
// ----------------------------------------------------------------------------
export async function getEducatorTopics(
  educatorId: string,
  filter?: TopicStatus,
): Promise<TopicCard[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .eq("educator_id", educatorId)
    .order("updated_at", { ascending: false });
  if (filter) q = q.eq("status", filter);
  const { data } = await q;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((t) => shapeRow(t, new Set()));
}

// ----------------------------------------------------------------------------
// Cross-cutting staff view of all topics.
// ----------------------------------------------------------------------------
export async function getStaffTopics(filter?: TopicStatus): Promise<TopicCard[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .order("updated_at", { ascending: false });
  if (filter) q = q.eq("status", filter);
  const { data } = await q;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((t) => shapeRow(t, new Set()));
}

// ----------------------------------------------------------------------------
// Single topic with resources.
// ----------------------------------------------------------------------------
export async function getTopicBySlug(
  slug: string,
  userId?: string,
): Promise<TopicDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("topics")
    .select(`${TOPIC_SELECT}, resources:topic_resources(id, label, url, storage_path, kind, sort_order)`)
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const savedSet = new Set<string>();
  if (userId) {
    const { data: saved } = await supabase
      .from("saved_items")
      .select("entity_id")
      .eq("user_id", userId)
      .eq("entity_type", "topic")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("entity_id", (data as any).id)
      .maybeSingle();
    if (saved) savedSet.add(saved.entity_id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = data as any;
  const card = shapeRow(r, savedSet);
  return {
    ...card,
    resources: ((r.resources ?? []) as Array<{
      id: string;
      label: string;
      url: string | null;
      storage_path: string | null;
      kind: string;
      sort_order: number;
    }>)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(({ sort_order: _sort_order, ...rest }) => rest),
  };
}

// ----------------------------------------------------------------------------
// Area IDs that have at least one educator owner (via educator_assignments
// or the legacy areas.educator_id fallback). Used to warn learners when they
// pick an area with no specialist yet.
// ----------------------------------------------------------------------------
export async function getCoveredAreaIds(): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();
  const [{ data: assignments }, { data: legacy }] = await Promise.all([
    supabase.from("educator_assignments").select("area_id"),
    supabase
      .from("areas")
      .select("id")
      .not("educator_id", "is", null),
  ]);
  const set = new Set<string>();
  for (const a of assignments ?? []) set.add(a.area_id);
  for (const a of legacy ?? []) set.add(a.id);
  return set;
}

// ----------------------------------------------------------------------------
// Taxonomy lookups for forms + filter UI.
// ----------------------------------------------------------------------------
export async function getTaxonomy() {
  const supabase = await createSupabaseServerClient();
  const [areasRes, typesRes, subtypesRes] = await Promise.all([
    supabase
      .from("areas")
      .select("id, slug, name, educator_id")
      .is("archived_at", null)
      .order("sort_order"),
    supabase
      .from("property_types")
      .select("id, slug, name")
      .is("archived_at", null)
      .order("sort_order"),
    supabase
      .from("property_subtypes")
      .select("id, type_id, slug, name")
      .is("archived_at", null)
      .order("sort_order"),
  ]);
  return {
    areas: (areasRes.data ?? []) as Area[],
    types: (typesRes.data ?? []) as PropertyType[],
    subtypes: (subtypesRes.data ?? []) as PropertySubtype[],
  };
}
