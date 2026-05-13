import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Sparkles, Users } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { StatusBadge } from "@/features/educator/components/StatusBadge";
import { getEducatorAnalytics } from "@/features/educator/server/analytics-queries";
import type { TrackStatus } from "@/features/educator/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Analytics · Educator" };

export default async function EducatorAnalyticsPage() {
  const user = await requireUser();
  if (user.role === "learner") redirect("/dashboard");

  const data = await getEducatorAnalytics(user.id);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Educator"
        title="Analytics"
        description="Enrollments, completion rates, and engagement across your tracks."
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          icon={<Users className="size-4" />}
          label="Total enrollments"
          value={`${data.totals.enrollments}`}
        />
        <Stat
          icon={<Sparkles className="size-4" />}
          label="Active learners"
          value={`${data.totals.activeEnrollments}`}
        />
        <Stat
          icon={<BarChart3 className="size-4" />}
          label="Completions"
          value={`${data.totals.completedEnrollments}`}
        />
        <Stat
          icon={<Sparkles className="size-4" />}
          label="Published tracks"
          value={`${data.totals.publishedTracks}`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
          By track
        </h2>
        {data.perTrack.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No tracks yet"
            description="Once you publish a track and learners start enrolling, metrics will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-hairline bg-surface-raised">
            <table className="w-full">
              <thead className="border-b border-hairline bg-surface-subtle/50 text-left text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Track</th>
                  <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                    Lessons
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Enrolled</th>
                  <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {data.perTrack.map((t) => (
                  <tr key={t.trackId}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={t.status as TrackStatus} />
                        <Link
                          href={`/educator/tracks/${t.trackSlug}`}
                          className="truncate text-sm font-medium text-ink hover:text-accent transition-colors"
                        >
                          {t.trackTitle}
                        </Link>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-right text-sm text-ink-muted md:table-cell">
                      {t.lessonCount}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-ink">
                      {t.enrollments}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-sm text-ink-muted md:table-cell">
                      {t.completedEnrollments}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-surface-subtle sm:block">
                          <div
                            className="h-full bg-accent transition-all duration-500"
                            style={{ width: `${Math.min(100, t.completionRate)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-mono tabular-nums text-ink">
                          {t.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-raised p-4">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}
