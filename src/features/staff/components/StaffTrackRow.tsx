import Link from "next/link";
import { BookOpen, ChevronRight, User } from "lucide-react";

import { StatusBadge } from "@/features/educator/components/StatusBadge";
import type { StaffTrackRow as StaffTrackData } from "@/features/staff/server/queries";
import { cn } from "@/lib/utils/cn";

export function StaffTrackRow({
  track,
  className,
}: {
  track: StaffTrackData;
  className?: string;
}) {
  return (
    <Link
      href={`/staff/tracks/${track.slug}`}
      className={cn(
        "group flex items-start gap-4 rounded-lg border border-hairline bg-surface-raised p-4 transition-all duration-200 ease-luxury",
        "hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
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
          <p className="line-clamp-1 text-sm text-ink-muted">{track.subtitle}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            {track.educator.full_name ?? "Unknown educator"}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            {track.lessonCount} {track.lessonCount === 1 ? "lesson" : "lessons"} · {track.moduleCount} {track.moduleCount === 1 ? "module" : "modules"}
          </span>
          <span className="ml-auto text-[11px]">
            Updated {formatRelative(track.updated_at)}
          </span>
        </div>
      </div>
      <ChevronRight className="mt-1 size-4 shrink-0 text-zinc-300 group-hover:text-accent transition-colors" />
    </Link>
  );
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
