import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, MapPin, Plus } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { StatusBadge } from "@/features/topics/components/StatusBadge";
import { getEducatorTopics } from "@/features/topics/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "My topics" };

export default async function EducatorTopicsPage() {
  const user = await requireUser();
  const topics = await getEducatorTopics(user.id);

  const counts = { draft: 0, in_review: 0, published: 0, archived: 0 };
  for (const t of topics) counts[t.status] += 1;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Educator"
        title="My topics"
        description="One video per topic. Filter-first content for the niche you cover."
        actions={
          <Link
            href="/educator/topics/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
          >
            <Plus className="size-4" /> New topic
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Drafts" value={counts.draft} />
        <Tile label="In Review" value={counts.in_review} />
        <Tile label="Published" value={counts.published} />
        <Tile label="Archived" value={counts.archived} />
      </section>

      {topics.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No topics yet"
          description="Create your first specialist video to put it in front of operators."
          action={
            <Link
              href="/educator/topics/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              <Plus className="size-4" /> Create your first topic
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {topics.map((t) => {
            const thumb =
              t.cover_url ??
              (t.youtube_id ? `https://i.ytimg.com/vi/${t.youtube_id}/default.jpg` : null);
            return (
              <li key={t.id}>
                <Link
                  href={`/educator/topics/${t.slug}/edit`}
                  className="group flex items-center gap-4 rounded-lg border border-hairline bg-surface-raised p-3 transition-all duration-200 ease-luxury hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-card-hover"
                >
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-surface-subtle">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.status} />
                      {t.type ? (
                        <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                          {t.type.name}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-ink group-hover:text-accent transition-colors">
                      {t.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                      {(t.area || t.subarea) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {[t.subarea, t.area?.name].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {t.subtypes.length > 0 ? (
                        <span>{t.subtypes.map((s) => s.name).join(", ")}</span>
                      ) : null}
                      <span className="ml-auto">
                        Updated {new Date(t.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-raised p-4">
      <p className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
