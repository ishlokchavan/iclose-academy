import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { StaffTrackRow } from "@/features/staff/components/StaffTrackRow";
import { getStaffOverview } from "@/features/staff/server/queries";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Staff overview" };

export default async function StaffOverviewPage() {
  const overview = await getStaffOverview();

  const tiles = [
    { label: "In Review", value: overview.byStatus.in_review, href: "/staff/tracks?status=in_review", tone: "amber" as const },
    { label: "Published", value: overview.byStatus.published, href: "/staff/tracks?status=published", tone: "emerald" as const },
    { label: "Drafts", value: overview.byStatus.draft, href: "/staff/tracks?status=draft", tone: "zinc" as const },
    { label: "Archived", value: overview.byStatus.archived, href: "/staff/tracks?status=archived", tone: "rose" as const },
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Staff"
        title="Platform operations"
        description="Track moderation, educator activity, and platform health at a glance."
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={cn(
              "flex flex-col gap-1 rounded-lg border p-4 transition-all duration-200 ease-luxury hover:-translate-y-0.5 hover:shadow-card-hover",
              TONES[t.tone],
            )}
          >
            <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
              {t.label}
            </span>
            <span className="text-2xl font-semibold text-ink">{t.value}</span>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
            Awaiting review
          </h2>
          <Link
            href="/staff/tracks?status=in_review"
            className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            View all →
          </Link>
        </div>

        {overview.recentInReview.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing waiting for review"
            description="Submitted tracks will appear here. You can also browse all tracks under Tracks."
          />
        ) : (
          <div className="space-y-2">
            {overview.recentInReview.map((t) => (
              <StaffTrackRow key={t.id} track={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const TONES: Record<"amber" | "emerald" | "zinc" | "rose", string> = {
  amber: "border-amber-200 bg-amber-50/40",
  emerald: "border-emerald-200 bg-emerald-50/40",
  zinc: "border-zinc-200 bg-white",
  rose: "border-rose-200 bg-rose-50/30",
};
