import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function Brand({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-ink transition-opacity duration-200 ease-apple hover:opacity-70",
        className,
      )}
    >
      {/* Logo mark: clean rounded square, Apple-style */}
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-ink text-[10px] font-bold tracking-tight text-surface-raised"
      >
        iC
      </span>
      {/* Wordmark */}
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        iClose <span className="font-normal text-ink-muted">Academy</span>
      </span>
    </Link>
  );
}
