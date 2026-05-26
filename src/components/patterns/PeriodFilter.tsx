"use client";

import { CalendarRange } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export const PERIODS = [
  { value: "all",    label: "All time" },
  { value: "today",  label: "Today" },
  { value: "7d",     label: "Last 7 days" },
  { value: "30d",    label: "Last 30 days" },
  { value: "90d",    label: "Last 90 days" },
  { value: "year",   label: "This year" },
] as const;

export type Period = (typeof PERIODS)[number]["value"];

/** Inclusive start of the period, or null for "all time". */
export function getPeriodStart(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case "today": return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7d":    { const d = new Date(now); d.setDate(d.getDate() - 7);  return d; }
    case "30d":   { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
    case "90d":   { const d = new Date(now); d.setDate(d.getDate() - 90); return d; }
    case "year":  return new Date(now.getFullYear(), 0, 1);
    default:      return null;
  }
}

/** Filter a list of rows by an ISO timestamp accessor. Returns the same
 *  array reference when period is "all" so React memos can skip downstream
 *  work. */
export function filterByPeriod<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  period: Period,
): T[] {
  const start = getPeriodStart(period);
  if (!start) return items;
  const startMs = start.getTime();
  return items.filter((item) => {
    const raw = getDate(item);
    if (!raw) return false;
    return new Date(raw).getTime() >= startMs;
  });
}

export function PeriodFilter({
  value, onChange, className,
}: {
  value: Period;
  onChange: (v: Period) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-surface-raised pl-3 pr-2 text-[12px] text-ink-muted",
        className,
      )}
    >
      <CalendarRange className="size-3.5" />
      <span>Period:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Period)}
        className="appearance-none border-0 bg-transparent pr-1 text-[12px] text-ink focus:outline-none"
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    </label>
  );
}
