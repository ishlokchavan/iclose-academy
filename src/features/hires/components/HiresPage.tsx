"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/patterns/DataTable";
import { EmailLink, TelLink } from "@/components/patterns/ContactLink";
import { filterByPeriod, PeriodFilter, type Period } from "@/components/patterns/PeriodFilter";
import { HireDrawer } from "@/features/hires/components/HireDrawer";
import { HIRE_STATUSES } from "@/features/hires/constants";
import type { HireApplication } from "@/features/hires/server/queries";
import { formatDateTime, formatShortDateTime, formatUpdatedAt } from "@/lib/utils/date";

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

// Period filter helpers come from the shared component.

export function HiresPage({ applications }: { applications: HireApplication[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [period, setPeriod]             = useState<Period>("all");
  const [selected, setSelected]         = useState<HireApplication | null>(null);

  const visible = useMemo(() => {
    const inPeriod = filterByPeriod(applications, (a) => a.created_at, period);
    if (statusFilter === "all") return inPeriod;
    return inPeriod.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter, period]);

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
            <p className="text-[13px] text-ink-muted">
              <EmailLink email={a.email} stopPropagation />
            </p>
            <p className="text-[12px] text-ink-muted/70">
              <TelLink phone={a.phone} stopPropagation />
            </p>
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
    {
      id: "updated",
      accessorKey: "updated_at",
      header: "Updated",
      meta: { className: "hidden xl:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">
          {formatUpdatedAt(row.original.created_at, row.original.updated_at)}
        </span>
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
        <PeriodFilter value={period} onChange={setPeriod} className="ml-auto" />
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
