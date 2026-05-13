import Link from "next/link";
import { BookOpen, Clock, ChevronRight } from "lucide-react";

import { StatusBadge } from "@/features/educator/components/StatusBadge";
import type { EducatorTrackRow } from "@/features/educator/server/queries";
import { cn } from "@/lib/utils/cn";

export function EducatorTrackCard({
  track,
  className,
}: {
  track: EducatorTrackRow;
  className?: string;
}) {
  return (
    <Link
      href={`/educator/tracks/${track.slug}`}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border border-hairline bg-surface-raised p-5 transition-all duration-200 ease-luxury",
        "hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <StatusBadge status={track.status} />
            {track.specialty ? (
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                {track.specialty.name}
              </span>
            ) : null}
          </div>
          <h3 className="text-base font-semibold text-ink group-hover:text-accent transition-colors">
            {track.title}
          </h3>
          {track.subtitle ? (
            <p className="line-clamp-2 text-sm text-ink-muted">{track.subtitle}</p>
          ) : null}
        </div>
        <ChevronRight className="size-4 shrink-0 text-zinc-300 group-hover:text-accent transition-colors" />
      </div>

      <div className="flex items-center gap-4 pt-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-3.5" />
          {track.lessonCount} {track.lessonCount === 1 ? "lesson" : "lessons"}
        </span>
        {track.duration_minutes ? (
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatDuration(track.duration_minutes)}
          </span>
        ) : null}
        <span className="ml-auto text-[11px]">
          Updated {formatRelative(track.updated_at)}
        </span>
      </div>
    </Link>
  );
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
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
