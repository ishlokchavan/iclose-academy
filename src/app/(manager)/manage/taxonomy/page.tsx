import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { AreaRow, NewAreaForm } from "@/features/taxonomy/components/AreaEditor";
import { TypesEditor } from "@/features/taxonomy/components/TypesEditor";
import { getTaxonomy } from "@/features/topics/server/queries";

export const metadata: Metadata = { title: "Taxonomy" };

export default async function ManageTaxonomyPage() {
  const taxonomy = await getTaxonomy();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Content"
        title="Taxonomy"
        description="Areas, property types, and sub-types used to classify topics and inquiries."
      />

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="eyebrow">Areas / Communities</h2>
          <NewAreaForm />
        </div>
        {taxonomy.areas.length === 0 ? (
          <p className="text-[14px] italic text-ink-muted">No areas yet.</p>
        ) : (
          <ul className="space-y-2">
            {taxonomy.areas.map((a) => (
              <AreaRow key={a.id} area={a} educators={[]} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="eyebrow">Property types &amp; sub-types</h2>
        <TypesEditor types={taxonomy.types} subtypes={taxonomy.subtypes} />
      </section>
    </div>
  );
}
