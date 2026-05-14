import type { Metadata } from "next";
import Link from "next/link";
import { Library, MessageSquarePlus } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import {
  FilterPanel,
  FilterPills,
  FilterProvider,
} from "@/features/topics/components/FilterBar";
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
  const taxonomy = await getTaxonomy();
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
    <FilterProvider taxonomy={taxonomy}>
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="eyebrow">Dubai real estate</p>
          <h1 className="display text-display-lg text-ink">Specialist library</h1>
          <p className="max-w-2xl text-base text-ink-muted">
            Niche videos on the buildings, communities, and asset classes that matter.
            Filter to your client&rsquo;s exact ask.
          </p>
        </header>

        <FilterPills resultCount={topics.length} />

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-2">
            <FilterPanel />
          </div>

          <main>
            {topics.length === 0 ? (
              <EmptyState
                icon={Library}
                title="No topics match those filters"
                description="Try removing a filter, or post an inquiry and the platform will route it to the right specialist."
                action={
                  <Link
                    href="/inquiries/new"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
                  >
                    <MessageSquarePlus className="size-4" />
                    Post an inquiry instead
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {topics.map((t) => (
                  <TopicCard key={t.id} topic={t} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </FilterProvider>
  );
}
