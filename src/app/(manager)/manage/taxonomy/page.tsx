import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { AreaCard, NewAreaForm } from "@/features/taxonomy/components/AreaEditor";
import { TypesEditor } from "@/features/taxonomy/components/TypesEditor";
import { getTaxonomy } from "@/features/topics/server/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Categories" };

export default async function ManageCategoriesPage() {
  const supabase = await createSupabaseServerClient();

  const [taxonomy, educatorsRes] = await Promise.all([
    getTaxonomy(),
    supabase
      .from("profiles")
      .select("id, full_name")
      .not("full_name", "is", null)
      .in("role", ["educator", "content_manager", "manager"])
      .order("full_name"),
  ]);

  const educators = (educatorsRes.data ?? []) as { id: string; full_name: string | null }[];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Content"
        title="Categories"
        description="Manage the communities, property types, and specialisations used to classify topics and inquiries."
      />

      {/* ── Communities ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="eyebrow">Communities</h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Geographic areas and neighbourhoods covered by your specialists.
            </p>
          </div>
        </div>

        {taxonomy.areas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-hairline px-6 py-10 text-center">
            <p className="text-[14px] text-ink-muted">No communities yet.</p>
            <p className="mt-1 text-[12px] text-ink-tertiary">Add your first community below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {taxonomy.areas.map((a) => (
              <AreaCard key={a.id} area={a} educators={educators} />
            ))}
          </div>
        )}

        <NewAreaForm educators={educators} />
      </section>

      {/* ── Property Types ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="eyebrow">Property Types</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Top-level property categories, each with optional specialisations.
          </p>
        </div>
        <TypesEditor types={taxonomy.types} subtypes={taxonomy.subtypes} />
      </section>
    </div>
  );
}
