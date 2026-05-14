import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Inbox, MapPin, Plus, User } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/topics/components/StatusBadge";
import { getStaffTopics } from "@/features/topics/server/queries";
import type { TopicStatus } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Topics" };

type Props = { searchParams: Promise<{ status?: string }> };

const FILTERS: Array<{ value: TopicStatus | "all"; label: string }> = [
  { value: "published", label: "Published" },
  { value: "draft",     label: "Drafts" },
  { value: "archived",  label: "Archived" },
  { value: "all",       label: "All" },
];

function parseStatus(raw?: string): TopicStatus | undefined {
  if (raw === "draft" || raw === "published" || raw === "archived" || raw === "in_review") return raw;
  return undefined;
}

export default async function ManageTopicsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = parseStatus(status);
  const topics = await getStaffTopics(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Topics"
        description="All published and draft topics. Create, edit, and manage the content library."
        actions={
          <Button asChild size="sm">
            <Link href="/manage/topics/new"><Plus className="size-3.5" /> New topic</Link>
          </Button>
        }
      />

      <nav className="flex flex-wrap items-center gap-1.5 border-b border-hairline pb-3">
        {FILTERS.map((f) => {
          const active = (filter ?? "published") === f.value || (f.value === "all" && !filter);
          const href = f.value === "all" ? "/manage/topics" : `/manage/topics?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[14px] transition-all duration-150 ease-apple",
                active ? "bg-ink text-white" : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
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
                  href={`/manage/topics/${t.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-hairline bg-surface-raised p-3 shadow-card transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-subtle">
                    {thumb ? (
                      <Image src={thumb} alt="" fill sizes="120px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.status} />
                      {t.type ? (
                        <span className="text-[11px] tracking-wide text-ink-muted">{t.type.name}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-[14px] font-medium text-ink group-hover:text-accent transition-colors">
                      {t.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {t.educator.full_name ?? "—"}
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
