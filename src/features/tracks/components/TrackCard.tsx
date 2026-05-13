import Link from "next/link";
import { Clock, BookOpen, User } from "lucide-react";

import { BookmarkButton } from "@/features/tracks/components/BookmarkButton";
import { cn } from "@/lib/utils/cn";
import type { TrackCardData } from "../types";

const SPECIALTY_STYLES: Record<string, string> = {
  community: "bg-blue-50 text-blue-700",
  building: "bg-orange-50 text-orange-700",
  luxury: "bg-amber-50 text-amber-700",
  "off-plan": "bg-purple-50 text-purple-700",
  leasing: "bg-emerald-50 text-emerald-700",
};

function formatDuration(minutes: number | null) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

type Props = {
  track: TrackCardData;
  className?: string;
};

export function TrackCard({ track, className }: Props) {
  const specialtyStyle = track.specialty?.slug
    ? (SPECIALTY_STYLES[track.specialty.slug] ?? "bg-zinc-100 text-zinc-600")
    : "bg-zinc-100 text-zinc-600";

  return (
    <Link
      href={`/tracks/${track.slug}`}
      className={cn(
        "group flex flex-col rounded-xl border border-hairline bg-white p-6 transition-all duration-200",
        "hover:shadow-card-hover hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Tags row */}
      <div className="mb-4 flex items-center gap-2">
        {track.specialty && (
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
              specialtyStyle,
            )}
          >
            {track.specialty.name}
          </span>
        )}
        {track.level && (
          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {track.level.name}
          </span>
        )}
        {track.enrollment && (
          <span className="ml-auto inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-green-700">
            Enrolled
          </span>
        )}
        <BookmarkButton
          trackId={track.id}
          initialSaved={track.saved}
          className={track.enrollment ? "" : "ml-auto"}
        />
      </div>

      {/* Title */}
      <h3 className="font-display mb-1 text-lg font-semibold leading-snug text-ink group-hover:text-accent transition-colors">
        {track.title}
      </h3>

      {/* Subtitle */}
      {track.subtitle && (
        <p className="mb-3 text-sm font-medium text-zinc-500">{track.subtitle}</p>
      )}

      {/* Summary */}
      {track.summary && (
        <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-zinc-600">
          {track.summary}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center gap-4 text-xs text-zinc-400">
        {track.educator?.full_name && (
          <span className="flex items-center gap-1.5">
            <User className="h-3 w-3" />
            {track.educator.full_name}
          </span>
        )}
        {track.lessonCount > 0 && (
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" />
            {track.lessonCount} {track.lessonCount === 1 ? "lesson" : "lessons"}
          </span>
        )}
        {track.duration_minutes && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {formatDuration(track.duration_minutes)}
          </span>
        )}
      </div>
    </Link>
  );
}
