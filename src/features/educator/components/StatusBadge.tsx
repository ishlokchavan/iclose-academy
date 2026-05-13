import { cn } from "@/lib/utils/cn";
import type { TrackStatus } from "@/features/educator/server/queries";

const STYLES: Record<TrackStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200",
  },
  in_review: {
    label: "In Review",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
  published: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
  archived: {
    label: "Archived",
    className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: TrackStatus;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        s.className,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
