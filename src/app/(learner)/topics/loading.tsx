import type { CSSProperties } from "react";

function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div style={style} className={`animate-pulse rounded-lg bg-surface-subtle ${className ?? ""}`} />;
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface-raised shadow-card">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function TopicsLoading() {
  return (
    <div className="pb-16">
      <div className="flex gap-8">
        <div className="hidden lg:block w-64 shrink-0">
          <div className="space-y-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <div className="flex flex-wrap gap-1.5">
                {[80, 64, 96, 72].map((w) => (
                  <Skeleton key={w} className="h-7 rounded-full" style={{ width: w }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <div className="flex flex-wrap gap-1.5">
                {[64, 88, 72, 56, 80].map((w) => (
                  <Skeleton key={w} className="h-7 rounded-full" style={{ width: w }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-8">
          <Skeleton className="h-[56vw] max-h-[520px] min-h-[260px] w-full rounded-3xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
