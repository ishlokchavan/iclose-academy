import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SearchResult = {
  entity_type: string;
  entity_id: string;
  title: string;
  body: string | null;
  specialty_id: string | null;
};

export async function searchDocuments(q: string): Promise<SearchResult[]> {
  if (!q || q.trim().length < 2) return [];

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("search_documents")
    .select("entity_type, entity_id, title, body, specialty_id")
    .textSearch("search_vec", q.trim(), {
      type: "websearch",
      config: "english",
    })
    .limit(8);

  return data ?? [];
}
