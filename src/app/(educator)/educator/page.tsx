import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Plus } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { EducatorTrackCard } from "@/features/educator/components/EducatorTrackCard";
import { StatusSummary } from "@/features/educator/components/StatusSummary";
import { getEducatorOverview } from "@/features/educator/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Educator dashboard" };

export default async function EducatorDashboardPage() {
  const user = await requireUser();
  const overview = await getEducatorOverview(user.id);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Educator"
        title="Your tracks"
        description="Author specialist intelligence, manage curriculum, and publish to the library."
        actions={
          <Link
            href="/educator/tracks/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            <Plus className="size-4" /> New track
          </Link>
        }
      />

      {overview.total === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No tracks yet"
          description="Start by creating your first specialist track. You'll add modules, lessons, and resources as you go."
          action={
            <Link
              href="/educator/tracks/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
            >
              <Plus className="size-4" /> Create your first track
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          <section className="space-y-3">
            <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
              Overview
            </h2>
            <StatusSummary byStatus={overview.byStatus} />
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
                Recent
              </h2>
              <Link
                href="/educator/tracks"
                className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {overview.recent.map((t) => (
                <EducatorTrackCard key={t.id} track={t} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
