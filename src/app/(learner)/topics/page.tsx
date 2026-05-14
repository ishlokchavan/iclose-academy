import type { Metadata } from "next";
import { Library } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/features/topics/components/FilterBar";
import { TopicCard } from "@/features/topics/components/TopicCard";
import { getLibraryTopics, getTaxonomy } from "@/features/topics/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Library" };

type Props = {
  searchParams: Promise<{
    area?: string | string[];
    type?: string | string[];
    subtype?: string | string[];
    subarea?: string;
    q?: string;
  }>;
};

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function LibraryPage({ searchParams }: Props) {
  const user = await requireUser();
  const sp = await searchParams;
  const { areas, types, subtypes } = await getTaxonomy();
  const topics = await getLibraryTopics(
    {
      areaSlugs: asArray(sp.area),
      typeSlugs: asArray(sp.type),
      subtypeSlugs: asArray(sp.subtype),
      subareaQuery: sp.subarea,
      q: sp.q,
    },
    user.id,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dubai real estate"
        title="Library"
        description="Niche specialist videos. Filter by area, building, and property type to find what fits your client."
      />

      <FilterBar areas={areas} types={types} subtypes={subtypes} />

      {topics.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No topics match those filters"
          description="Try removing a filter, or post an inquiry and we'll route it to the right specialist."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <TopicCard key={t.id} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}
