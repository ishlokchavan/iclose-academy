import type { InquiryStatus } from "@/features/inquiries/server/queries";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<InquiryStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200" },
  assigned: { label: "Assigned", className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200" },
  closed: { label: "Closed", className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" },
};

export function InquiryStatusBadge({
  status,
  className,
}: {
  status: InquiryStatus;
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
