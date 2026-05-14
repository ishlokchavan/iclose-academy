import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { AreaRow, NewAreaForm } from "@/features/taxonomy/components/AreaEditor";
import { TypesEditor } from "@/features/taxonomy/components/TypesEditor";
import { getTaxonomy } from "@/features/topics/server/queries";
import { getEducators } from "@/features/staff/server/user-queries";

export const metadata: Metadata = { title: "Taxonomy · Staff" };

export default async function StaffTaxonomyPage() {
  const [taxonomy, educators] = await Promise.all([getTaxonomy(), getEducators()]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Staff"
        title="Taxonomy"
        description="Areas, property types, and sub-types. Assign an educator to each area to route inquiries."
      />

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
            Areas (community)
          </h2>
          <NewAreaForm />
        </div>
        {taxonomy.areas.length === 0 ? (
          <p className="text-sm italic text-ink-muted">No areas yet.</p>
        ) : (
          <ul className="space-y-2">
            {taxonomy.areas.map((a) => (
              <AreaRow key={a.id} area={a} educators={educators} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
          Property types &amp; sub-types
        </h2>
        <TypesEditor types={taxonomy.types} subtypes={taxonomy.subtypes} />
      </section>
    </div>
  );
}
