"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { HireDrawer } from "@/features/hires/components/HireDrawer";
import { HIRE_STATUSES } from "@/features/hires/constants";
import type { HireApplication } from "@/features/hires/server/queries";

const STATUS_DOT: Record<string, string> = {
  pending:     "bg-amber-400",
  reviewing:   "bg-blue-400",
  shortlisted: "bg-violet-400",
  hired:       "bg-green-400",
  rejected:    "bg-red-400",
};

const STATUS_PILL: Record<string, string> = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  reviewing:   "bg-blue-50 text-blue-700 border-blue-200",
  shortlisted: "bg-violet-50 text-violet-700 border-violet-200",
  hired:       "bg-green-50 text-green-700 border-green-200",
  rejected:    "bg-red-50 text-red-600 border-red-200",
};

const DATE_RANGES = [
  { label: "All time",     value: "all" },
  { label: "Today",        value: "today" },
  { label: "Last 7 days",  value: "7d" },
  { label: "Last 30 days", value: "30d" },
] as const;

type DateRange = (typeof DATE_RANGES)[number]["value"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });
}

function dateRangeStart(range: DateRange): Date | null {
  const now = new Date();
  if (range === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "7d")  { const d = new Date(now); d.setDate(d.getDate() - 7);  return d; }
  if (range === "30d") { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
  return null;
}

export function HiresPage({ applications }: { applications: HireApplication[] }) {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange]       = useState<DateRange>("all");
  const [selected, setSelected]         = useState<HireApplication | null>(null);

  const filtered = useMemo(() => {
    const rangeStart = dateRangeStart(dateRange);
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (rangeStart && new Date(a.created_at) < rangeStart) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = `${a.first_name} ${a.last_name}`.toLowerCase();
      return (
        name.includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
      );
    });
  }, [applications, search, statusFilter, dateRange]);

  const hasFilters = search || statusFilter !== "all" || dateRange !== "all";

  return (
    <>
      {/* Toolbar */}
      <div className="space-y-3">
        {/* Search + date range row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, email or status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-full border border-hairline bg-surface-raised pl-9 pr-4 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
            />
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="h-9 rounded-full border border-hairline bg-surface-raised px-3 text-[13px] text-ink focus:outline-none focus:border-accent shrink-0"
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`h-7 rounded-full border px-3 text-[12px] font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-ink text-surface border-ink"
                : "bg-surface-raised text-ink-muted border-hairline hover:border-ink/30"
            }`}
          >
            All
          </button>
          {HIRE_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`h-7 rounded-full border px-3 text-[12px] font-medium capitalize transition-colors ${
                statusFilter === s
                  ? (STATUS_PILL[s] ?? "bg-ink text-surface border-ink")
                  : "bg-surface-raised text-ink-muted border-hairline hover:border-ink/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-hairline bg-surface-raised shadow-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline bg-surface-subtle/60">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Applicant</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted sm:table-cell">Contact</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:table-cell">Status</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted lg:table-cell">Applied</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-ink-muted">
                  {hasFilters ? "No applicants match your filters." : "No applications yet."}
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="border-b border-hairline last:border-0 cursor-pointer hover:bg-surface-subtle/60 transition-colors"
                >
                  {/* Name + mobile meta */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
                        {a.first_name[0]}{a.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[14px] font-medium text-ink leading-snug">
                          {a.first_name} {a.last_name}
                        </span>
                        {/* Mobile-only: status + applied date */}
                        <div className="flex items-center gap-1.5 mt-0.5 sm:hidden">
                          <span className={`size-1.5 rounded-full shrink-0 ${STATUS_DOT[a.status] ?? "bg-ink-muted"}`} />
                          <span className="text-[11px] text-ink-muted capitalize">{a.status}</span>
                          <span className="text-[11px] text-ink-muted/50">·</span>
                          <span className="text-[11px] text-ink-muted">{formatShortDate(a.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <p className="text-[13px] text-ink-muted">{a.email}</p>
                    <p className="text-[12px] text-ink-muted/70">{a.phone}</p>
                  </td>
                  {/* Status */}
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full shrink-0 ${STATUS_DOT[a.status] ?? "bg-ink-muted"}`} />
                      <span className="text-[13px] text-ink capitalize">{a.status}</span>
                    </div>
                  </td>
                  {/* Applied */}
                  <td className="hidden px-5 py-3.5 text-[13px] text-ink-muted lg:table-cell">
                    {formatDate(a.created_at)}
                  </td>
                  {/* Chevron */}
                  <td className="pr-4 text-ink-muted">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="border-t border-hairline px-5 py-3 text-[12px] text-ink-muted">
            {filtered.length} {filtered.length === 1 ? "applicant" : "applicants"}
            {hasFilters && " matching filters"}
          </div>
        )}
      </div>

      <HireDrawer
        app={selected}
        onClose={() => setSelected(null)}
        onStatusChange={(updated) => setSelected(updated)}
      />
    </>
  );
}
