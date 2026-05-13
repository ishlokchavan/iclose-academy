import Link from "next/link";

import type { TrackStatus } from "@/features/educator/server/queries";
import { cn } from "@/lib/utils/cn";

const TILE_STYLES: Record<TrackStatus, string> = {
  draft: "border-zinc-200 bg-white",
  in_review: "border-amber-200 bg-amber-50/40",
  published: "border-emerald-200 bg-emerald-50/40",
  archived: "border-rose-200 bg-rose-50/30",
};

const TILE_LABEL: Record<TrackStatus, string> = {
  draft: "Drafts",
  in_review: "In Review",
  published: "Published",
  archived: "Archived",
};

export function StatusSummary({
  byStatus,
}: {
  byStatus: Record<TrackStatus, number>;
}) {
  const order: TrackStatus[] = ["draft", "in_review", "published", "archived"];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {order.map((status) => (
        <Link
          key={status}
          href={`/educator/tracks?status=${status}`}
          className={cn(
            "flex flex-col gap-1 rounded-lg border p-4 transition-all duration-200 ease-luxury",
            "hover:-translate-y-0.5 hover:shadow-card-hover",
            TILE_STYLES[status],
          )}
        >
          <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
            {TILE_LABEL[status]}
          </span>
          <span className="text-2xl font-semibold text-ink">{byStatus[status]}</span>
        </Link>
      ))}
    </div>
  );
}
