"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/patterns/DataTable";
import { HireDrawer } from "@/features/hires/components/HireDrawer";
import { HIRE_STATUSES } from "@/features/hires/constants";
import type { HireApplication } from "@/features/hires/server/queries";
import { formatDateTime, formatShortDateTime } from "@/lib/utils/date";

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

function dateRangeStart(range: DateRange): Date | null {
  const now = new Date();
  if (range === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "7d")  { const d = new Date(now); d.setDate(d.getDate() - 7);  return d; }
  if (range === "30d") { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
  return null;
}

export function HiresPage({ applications }: { applications: HireApplication[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange]       = useState<DateRange>("all");
  const [selected, setSelected]         = useState<HireApplication | null>(null);

  // Cross-cutting predicates that don't map to a single column: status chip
  // and date-range select. These belong outside the column-filter UI.
  const visible = useMemo(() => {
    const rangeStart = dateRangeStart(dateRange);
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (rangeStart && new Date(a.created_at) < rangeStart)   return false;
      return true;
    });
  }, [applications, statusFilter, dateRange]);

  const columns = useMemo<ColumnDef<HireApplication, unknown>[]>(() => [
    {
      id: "applicant",
      accessorFn: (a) => `${a.first_name} ${a.last_name}`,
      header: "Applicant",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", filterPlaceholder: "first or last" },
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
              {a.first_name[0]}{a.last_name[0]}
            </div>
            <div className="min-w-0">
              <span className="block text-[14px] font-medium text-ink leading-snug">
                {a.first_name} {a.last_name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 sm:hidden">
                <span className={`size-1.5 rounded-full shrink-0 ${STATUS_DOT[a.status] ?? "bg-ink-muted"}`} />
                <span className="text-[11px] text-ink-muted capitalize">{a.status}</span>
                <span className="text-[11px] text-ink-muted/50">·</span>
                <span className="text-[11px] text-ink-muted">{formatShortDateTime(a.created_at)}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "contact",
      accessorFn: (a) => `${a.email} ${a.phone}`,
      header: "Contact",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", className: "hidden sm:table-cell", filterPlaceholder: "email or phone" },
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div>
            <p className="text-[13px] text-ink-muted">{a.email}</p>
            <p className="text-[12px] text-ink-muted/70">{a.phone}</p>
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      meta: { filter: "select", className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full shrink-0 ${STATUS_DOT[row.original.status] ?? "bg-ink-muted"}`} />
          <span className="text-[13px] text-ink capitalize">{row.original.status}</span>
        </div>
      ),
    },
    {
      id: "applied",
      accessorKey: "created_at",
      header: "Applied",
      meta: { className: "hidden lg:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">{formatDateTime(row.original.created_at)}</span>
      ),
    },
  ], []);

  return (
    <>
      <div className="mb-3 flex items-center gap-1.5 flex-wrap">
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
        <div className="ml-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="h-7 rounded-full border border-hairline bg-surface-raised px-3 text-[12px] text-ink focus:outline-none focus:border-accent"
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={visible}
        columns={columns}
        getRowId={(a) => a.id}
        onRowClick={(a) => setSelected(a)}
        initialSorting={[{ id: "applied", desc: true }]}
        emptyMessage="No applications match your filters."
      />

      <HireDrawer
        app={selected}
        onClose={() => setSelected(null)}
        onStatusChange={(updated) => setSelected(updated)}
      />
    </>
  );
}
