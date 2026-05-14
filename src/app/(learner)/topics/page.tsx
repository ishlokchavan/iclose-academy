import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { MessageSquarePlus, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TopicCard } from "@/features/topics/components/TopicCard";
import {
  FilterProvider,
  FilterPills,
  FilterPanel,
} from "@/features/topics/components/FilterBar";
import { getLibraryTopics, getTaxonomy } from "@/features/topics/server/queries";
import { requireUser } from "@/lib/auth/guards";
import type { TopicCard as TopicCardData } from "@/features/topics/types";

export const metadata: Metadata = { title: "Browse" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function getStrings(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;

  const areaSlugs = getStrings(params.area);
  const typeSlugs = getStrings(params.type);
  const subtypeSlugs = getStrings(params.subtype);
  const subareaQuery = (params.subarea as string) ?? "";
  const q = (params.q as string) ?? "";

  const hasFilters =
    areaSlugs.length > 0 ||
    typeSlugs.length > 0 ||
    subtypeSlugs.length > 0 ||
    !!subareaQuery ||
    !!q;

  const [taxonomy, topics] = await Promise.all([
    getTaxonomy(),
    getLibraryTopics({ areaSlugs, typeSlugs, subtypeSlugs, subareaQuery, q }, user.id),
  ]);

  return (
    <Suspense>
      <FilterProvider taxonomy={taxonomy}>
        <div className="pb-16">
          {/* ── Two-column layout ─────────────────────────────────────── */}
          <div className="flex gap-8">
            {/* Sidebar: hidden on mobile (drawer instead), sticky on desktop */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-6">
                <FilterPanel />
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Active filter pills + mobile "Filters" button + result count */}
              <div className="mb-6">
                <FilterPills resultCount={topics.length} />
              </div>

              {hasFilters ? (
                /* ── Flat filtered grid ─────────────────────────────── */
                topics.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {topics.map((t) => (
                      <TopicCard key={t.id} topic={t} />
                    ))}
                  </div>
                ) : (
                  <EmptyFiltered />
                )
              ) : (
                /* ── Default: hero + rows ───────────────────────────── */
                <DefaultLayout topics={topics} />
              )}
            </div>
          </div>
        </div>
      </FilterProvider>
    </Suspense>
  );
}

/* ── Default layout (no filters) ────────────────────────────────────────── */
function DefaultLayout({ topics }: { topics: TopicCardData[] }) {
  const featuredTopic = topics[0] ?? null;
  const recentTopics = topics.slice(0, 12);

  const byType = new Map<string, { typeName: string; topics: TopicCardData[] }>();
  for (const t of topics) {
    if (!t.type) continue;
    if (!byType.has(t.type.id)) byType.set(t.type.id, { typeName: t.type.name, topics: [] });
    byType.get(t.type.id)!.topics.push(t);
  }

  return (
    <div>
      {/* Hero */}
      {featuredTopic ? (
        <div className="relative mb-10 h-[56vw] max-h-[520px] min-h-[260px] overflow-hidden rounded-3xl">
          {featuredTopic.cover_url || featuredTopic.youtube_id ? (
            <Image
              src={
                featuredTopic.cover_url ??
                `https://i.ytimg.com/vi/${featuredTopic.youtube_id}/maxresdefault.jpg`
              }
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, calc(100vw - 17rem)"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-ink/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-10">
            {featuredTopic.type && (
              <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                {featuredTopic.type.name}
              </span>
            )}
            <h1 className="max-w-lg text-[clamp(1.25rem,3vw,2.25rem)] font-bold leading-tight tracking-tight text-white">
              {featuredTopic.title}
            </h1>
            {featuredTopic.description && (
              <p className="hidden max-w-md text-[15px] leading-relaxed text-white/70 sm:line-clamp-2">
                {featuredTopic.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button asChild size="md">
                <Link href={`/topics/${featuredTopic.slug}`}>
                  <Play className="size-4" /> Watch
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="md"
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Link href="/inquiries/new">
                  <MessageSquarePlus className="size-4" /> Post inquiry
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Latest */}
      {recentTopics.length > 0 && (
        <ContentRow title="Latest">
          {recentTopics.map((t) => (
            <TopicCard key={t.id} topic={t} />
          ))}
        </ContentRow>
      )}

      {/* By type */}
      {Array.from(byType.values()).map(({ typeName, topics: typeTopics }) => (
        <ContentRow key={typeName} title={typeName}>
          {typeTopics.map((t) => (
            <TopicCard key={t.id} topic={t} />
          ))}
        </ContentRow>
      ))}

      {topics.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-[22px] font-bold tracking-tight text-ink">No content yet</p>
          <p className="max-w-sm text-[15px] text-ink-muted">
            The library is being assembled. Have a specific topic in mind?
          </p>
          <Button asChild>
            <Link href="/inquiries/new">
              <MessageSquarePlus className="size-4" /> Post an inquiry
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyFiltered() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-[18px] font-semibold tracking-tight text-ink">No topics match your filters</p>
      <p className="text-[14px] text-ink-muted">Try adjusting or clearing the filters above.</p>
    </div>
  );
}

function ContentRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-[18px] font-bold tracking-tight text-ink">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
