import { cn } from "@/lib/utils/cn";

type Variant = "learner" | "manager" | "admin" | "muted";

const MAP: Record<Variant, string> = {
  learner: "bg-surface-subtle text-ink-muted border-hairline",
  manager: "bg-blue-50 text-blue-700 border-blue-200",
  admin:   "bg-amber-50 text-amber-700 border-amber-200",
  muted:   "bg-surface-subtle text-ink-muted border-hairline",
};

const LABELS: Record<Variant, string> = {
  learner: "Learner",
  manager: "Manager",
  admin:   "Admin",
  muted:   "—",
};

export function RoleBadge({ role, className }: { role: Variant; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        MAP[role] ?? MAP.muted,
        className,
      )}
    >
      {LABELS[role] ?? role}
    </span>
  );
}
