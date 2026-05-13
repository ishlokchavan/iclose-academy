import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-hairline bg-surface-subtle/40 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="grid size-12 place-items-center rounded-full bg-surface-raised text-ink-muted">
        <Icon className="size-5" aria-hidden />
      </div>
      <h2 className="text-base font-medium text-ink">{title}</h2>
      {description ? <p className="max-w-sm text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
