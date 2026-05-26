"use client";

import Image from "next/image";
import Link from "next/link";
import { Inbox, MapPin, User } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { filterByPeriod, PeriodFilter, type Period } from "@/components/patterns/PeriodFilter";
import { StatusBadge } from "@/features/topics/components/StatusBadge";
import { formatDateTime } from "@/lib/utils/date";

// Minimal shape consumed by this list — kept loose so we don't couple to the
// server query's full Topic type.
export type TopicListItem = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "in_review" | "published" | "archived";
  cover_url: string | null;
  youtube_id: string | null;
  updated_at: string;
  subarea: string | null;
  type: { name: string } | null;
  area: { name: string } | null;
  educator: { full_name: string | null };
};

export function TopicsList({ topics }: { topics: TopicListItem[] }) {
  const [period, setPeriod] = useState<Period>("all");
  const visible = useMemo(
    () => filterByPeriod(topics, (t) => t.updated_at, period),
    [topics, period],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <PeriodFilter value={period} onChange={setPeriod} className="ml-auto" />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing here" description="No topics in this period." />
      ) : (
        <ul className="space-y-2">
          {visible.map((t) => {
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
                        Updated {formatDateTime(t.updated_at)}
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
