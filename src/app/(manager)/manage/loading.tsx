function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-subtle ${className ?? ""}`} />;
}

export default function ManageOverviewLoading() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-hairline bg-surface-raised p-5 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-hairline bg-surface-raised p-5 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-3 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-hairline bg-surface-raised p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
