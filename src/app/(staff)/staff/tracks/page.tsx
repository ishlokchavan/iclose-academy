import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { StaffTrackRow } from "@/features/staff/components/StaffTrackRow";
import { getStaffTracks, type TrackStatus } from "@/features/staff/server/queries";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Tracks · Staff" };

type Props = { searchParams: Promise<{ status?: string }> };

const FILTERS: Array<{ value: TrackStatus | "all"; label: string }> = [
  { value: "in_review", label: "In Review" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

function parseStatus(raw?: string): TrackStatus | undefined {
  if (raw === "draft" || raw === "in_review" || raw === "published" || raw === "archived") {
    return raw;
  }
  return undefined;
}

export default async function StaffTracksPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = parseStatus(status);
  const tracks = await getStaffTracks(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Staff"
        title="Tracks"
        description="Review submitted tracks, audit published content, and manage the lifecycle."
      />

      <nav className="flex flex-wrap items-center gap-1.5 border-b border-hairline pb-3">
        {FILTERS.map((f) => {
          const active = (filter ?? "in_review") === f.value;
          const href = f.value === "all" ? "/staff/tracks?status=" : `/staff/tracks?status=${f.value}`;
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

      {tracks.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing here"
          description={
            filter
              ? `No ${filter.replace("_", " ")} tracks at the moment.`
              : "No tracks on the platform yet."
          }
        />
      ) : (
        <div className="space-y-2">
          {tracks.map((t) => (
            <StaffTrackRow key={t.id} track={t} />
          ))}
        </div>
      )}
    </div>
  );
}
