import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Inbox, MapPin, User } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { StatusBadge } from "@/features/topics/components/StatusBadge";
import { getStaffTopics } from "@/features/topics/server/queries";
import type { TopicStatus } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Topics · Staff" };

type Props = { searchParams: Promise<{ status?: string }> };

const FILTERS: Array<{ value: TopicStatus | "all"; label: string }> = [
  { value: "in_review", label: "In Review" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

function parseStatus(raw?: string): TopicStatus | undefined {
  if (raw === "draft" || raw === "in_review" || raw === "published" || raw === "archived") return raw;
  return undefined;
}

export default async function StaffTopicsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = parseStatus(status);
  const topics = await getStaffTopics(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Staff"
        title="Topics"
        description="All topics across all educators. Review submissions, audit published, manage lifecycle."
      />

      <nav className="flex flex-wrap items-center gap-1.5 border-b border-hairline pb-3">
        {FILTERS.map((f) => {
          const active = (filter ?? "in_review") === f.value;
          const href = f.value === "all" ? "/staff/topics" : `/staff/topics?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors duration-200 ease-luxury",
                active
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {topics.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing here" description="No topics for that filter." />
      ) : (
        <ul className="space-y-2">
          {topics.map((t) => {
            const thumb =
              t.cover_url ??
              (t.youtube_id ? `https://i.ytimg.com/vi/${t.youtube_id}/default.jpg` : null);
            return (
              <li key={t.id}>
                <Link
                  href={`/staff/topics/${t.slug}`}
                  className="group flex items-center gap-4 rounded-lg border border-hairline bg-surface-raised p-3 transition-all duration-200 ease-luxury hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-card-hover"
                >
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-surface-subtle">
                    {thumb ? (
                      <Image src={thumb} alt="" fill sizes="120px" className="object-cover" unoptimized />
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
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {t.educator.full_name ?? "Unknown"}
                      </span>
                      {(t.area || t.subarea) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {[t.subarea, t.area?.name].filter(Boolean).join(" · ")}
                        </span>
                      )}
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
