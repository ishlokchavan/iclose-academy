import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function Brand({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 text-ink transition-colors duration-200 ease-luxury",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-md bg-ink text-[11px] font-semibold tracking-tight text-surface-raised"
      >
        iC
      </span>
      <span className="display text-base font-semibold tracking-tight">
        iClose <span className="text-ink-muted">Academy</span>
      </span>
    </Link>
  );
}
