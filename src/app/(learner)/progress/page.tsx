import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Play, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { getRecentProgress } from "@/features/dashboard/server/progress-queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const user = await requireUser();
  const entries = await getRecentProgress(user.id);

  const completed = entries.filter((e) => e.completedAt !== null);
  const inProgress = entries.filter((e) => e.completedAt === null);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Account"
        title="Your progress"
        description="Recently watched lessons and a record of what you've completed."
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No progress yet"
          description="Open any lesson to start tracking your watch history and completions."
          action={
            <Link
              href="/tracks"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              Browse the library →
            </Link>
          }
        />
      ) : (
        <>
          {inProgress.length > 0 ? (
            <Section title="Recently watched" entries={inProgress} icon={<Play className="size-3.5" />} />
          ) : null}
          {completed.length > 0 ? (
            <Section
              title="Completed"
              entries={completed}
              icon={<CheckCircle2 className="size-3.5 text-emerald-600" />}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  entries,
  icon,
}: {
  title: string;
  entries: ReturnType<typeof Array.prototype.slice>;
  icon: React.ReactNode;
}) {
  type Entry = Awaited<ReturnType<typeof getRecentProgress>>[number];
  return (
    <section className="space-y-3">
      <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
        {title}
      </h2>
      <ul className="divide-y divide-hairline rounded-lg border border-hairline bg-surface-raised">
        {(entries as Entry[]).map((e) => (
          <li key={`${e.lessonId}-${e.updatedAt}`}>
            <Link
              href={`/tracks/${e.trackSlug}/lessons/${e.lessonId}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-subtle transition-colors"
            >
              <span className="grid size-7 place-items-center rounded-full bg-surface-subtle">
                {icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{e.lessonTitle}</p>
                <p className="truncate text-xs text-ink-muted">
                  {e.trackTitle} · {e.moduleTitle}
                </p>
              </div>
              <div className="hidden text-right text-[11px] text-ink-muted sm:block">
                {e.completedAt
                  ? `Completed ${formatRelative(e.completedAt)}`
                  : `${formatTime(e.positionSeconds)}${
                      e.durationSeconds ? ` / ${formatTime(e.durationSeconds)}` : ""
                    }`}
                <br />
                <span className="text-zinc-400">{formatRelative(e.updatedAt)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatRelative(iso: string) {
  const date = new Date(iso);
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
