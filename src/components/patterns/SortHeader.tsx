"use client";

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type SortDir = "asc" | "desc";
export type SortState<K extends string> = { key: K; dir: SortDir };

/** Click-to-sort table header cell. Cycles asc → desc on repeated clicks. */
export function SortHeader<K extends string>({
  label,
  sortKey,
  current,
  onChange,
  align = "left",
  className,
}: {
  label: string;
  sortKey: K;
  current: SortState<K>;
  onChange: (next: SortState<K>) => void;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const active = current.key === sortKey;
  const next: SortDir = active && current.dir === "desc" ? "asc" : "desc";

  return (
    <button
      type="button"
      onClick={() => onChange({ key: sortKey, dir: next })}
      className={cn(
        "group inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors",
        active ? "text-ink" : "text-ink-muted hover:text-ink",
        align === "right" && "ml-auto",
        align === "center" && "mx-auto",
        className,
      )}
    >
      <span>{label}</span>
      {active ? (
        current.dir === "asc" ? (
          <ChevronUp className="size-3" aria-hidden />
        ) : (
          <ChevronDown className="size-3" aria-hidden />
        )
      ) : (
        <ChevronsUpDown className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
      )}
    </button>
  );
}

/** Generic comparator usable from any table that has a SortState. */
export function compareBy<T>(getter: (row: T) => unknown, dir: SortDir): (a: T, b: T) => number {
  return (a, b) => {
    const va = getter(a);
    const vb = getter(b);
    if (va == null && vb == null) return 0;
    if (va == null) return dir === "asc" ? -1 : 1;
    if (vb == null) return dir === "asc" ? 1 : -1;
    if (typeof va === "number" && typeof vb === "number") {
      return dir === "asc" ? va - vb : vb - va;
    }
    const sa = String(va).toLowerCase();
    const sb = String(vb).toLowerCase();
    if (sa < sb) return dir === "asc" ? -1 : 1;
    if (sa > sb) return dir === "asc" ? 1 : -1;
    return 0;
  };
}
