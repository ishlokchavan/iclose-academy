import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) return Response.json([]);

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: docs } = await supabase
    .from("search_documents")
    .select("entity_type, entity_id, title")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .textSearch("search_vec" as any, q, {
      type: "websearch",
      config: "english",
    })
    .limit(8);

  if (!docs?.length) return Response.json([]);

  const trackIds = docs
    .filter((d) => d.entity_type === "track")
    .map((d) => d.entity_id);

  const tracksRes = trackIds.length > 0
    ? await supabase.from("tracks").select("id, slug").in("id", trackIds)
    : null;
  const tracks = tracksRes?.data;

  const slugMap: Record<string, string> = {};
  for (const t of tracks ?? []) slugMap[t.id] = t.slug;

  const results = docs
    .map((d) => ({
      type: d.entity_type,
      id: d.entity_id,
      title: d.title,
      href:
        d.entity_type === "track" && slugMap[d.entity_id]
          ? `/tracks/${slugMap[d.entity_id]}`
          : null,
    }))
    .filter((r): r is { type: string; id: string; title: string; href: string } => !!r.href);

  return Response.json(results);
}
