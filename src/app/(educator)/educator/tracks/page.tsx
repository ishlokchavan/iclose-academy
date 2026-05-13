import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Plus } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { EducatorTrackCard } from "@/features/educator/components/EducatorTrackCard";
import {
  getEducatorTracks,
  type TrackStatus,
} from "@/features/educator/server/queries";
import { requireUser } from "@/lib/auth/guards";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "My tracks" };

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const FILTERS: Array<{ value: TrackStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "in_review", label: "In Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function parseStatus(raw?: string): TrackStatus | undefined {
  if (raw === "draft" || raw === "in_review" || raw === "published" || raw === "archived") {
    return raw;
  }
  return undefined;
}

export default async function EducatorTracksPage({ searchParams }: Props) {
  const user = await requireUser();
  const { status } = await searchParams;
  const filter = parseStatus(status);
  const tracks = await getEducatorTracks(user.id, filter);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Educator"
        title="My tracks"
        description="Drafts, in review, published, and archived — all in one place."
        actions={
          <Link
            href="/educator/tracks/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            <Plus className="size-4" /> New track
          </Link>
        }
      />

      <nav className="flex flex-wrap items-center gap-1.5 border-b border-hairline pb-3">
        {FILTERS.map((f) => {
          const active = (filter ?? "all") === f.value;
          const href = f.value === "all" ? "/educator/tracks" : `/educator/tracks?status=${f.value}`;
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
          icon={GraduationCap}
          title={filter ? "Nothing here yet" : "No tracks yet"}
          description={
            filter
              ? `You don't have any ${filter.replace("_", " ")} tracks.`
              : "Start by creating your first specialist track."
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tracks.map((t) => (
            <EducatorTrackCard key={t.id} track={t} />
          ))}
        </div>
      )}
    </div>
  );
}
