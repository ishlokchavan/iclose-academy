"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Database, Server, User, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/patterns/DataTable";
import { filterByPeriod, PeriodFilter, type Period } from "@/components/patterns/PeriodFilter";
import { formatDateTimeSeconds } from "@/lib/utils/date";

import type { AuditFacets, AuditLogRow } from "../server/queries";
import { AuditDetailDrawer } from "./AuditDetailDrawer";

const SOURCE_PILL: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  db:     { label: "DB",     cls: "bg-blue-50 text-blue-700 border-blue-200",       icon: Database },
  app:    { label: "App",    cls: "bg-violet-50 text-violet-700 border-violet-200", icon: User },
  api:    { label: "API",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Server },
  system: { label: "System", cls: "bg-amber-50 text-amber-700 border-amber-200",    icon: Wand2 },
};

export function AuditLogPage({
  rows,
}: {
  rows: AuditLogRow[];
  facets: AuditFacets; // kept for prop compat — DataTable derives facets live
}) {
  const [selected, setSelected] = useState<AuditLogRow | null>(null);
  const [period, setPeriod]     = useState<Period>("all");

  const visible = useMemo(
    () => filterByPeriod(rows, (r) => r.created_at, period),
    [rows, period],
  );

  const columns = useMemo<ColumnDef<AuditLogRow, unknown>[]>(() => [
    {
      id: "when",
      accessorKey: "created_at",
      header: "When",
      cell: ({ row }) => (
        <span className="text-[12px] text-ink-muted whitespace-nowrap tabular-nums">
          {formatDateTimeSeconds(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "action",
      accessorKey: "action",
      header: "Action",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "select" },
      cell: ({ row }) => (
        <code className="rounded-md border border-hairline bg-surface-subtle px-1.5 py-0.5 font-mono text-[12px] text-ink">
          {row.original.action}
        </code>
      ),
    },
    {
      id: "entity",
      accessorKey: "entity_type",
      header: "Entity",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "select", className: "hidden sm:table-cell" },
      cell: ({ row }) => {
        const r = row.original;
        return r.entity_type ? (
          <div className="flex flex-col">
            <span className="text-[13px] text-ink">{r.entity_type}</span>
            {r.entity_id ? (
              <code className="font-mono text-[10px] text-ink-muted truncate max-w-[14ch]">
                {r.entity_id}
              </code>
            ) : null}
          </div>
        ) : (
          <span className="text-[12px] text-ink-muted">—</span>
        );
      },
    },
    {
      id: "actor",
      accessorFn: (r) => r.actor_email ?? "system",
      header: "Actor",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "select", className: "hidden md:table-cell" },
      cell: ({ row }) => {
        const r = row.original;
        return r.actor_email ? (
          <span className="text-[12px] text-ink truncate block max-w-[24ch]">{r.actor_email}</span>
        ) : (
          <span className="text-[12px] text-ink-muted">system</span>
        );
      },
    },
    {
      id: "source",
      accessorKey: "source",
      header: "Source",
      enableColumnFilter: true,
      meta: { filter: "select" },
      cell: ({ row }) => {
        const sourceMeta = SOURCE_PILL[row.original.source] ?? SOURCE_PILL.system!;
        const SourceIcon = sourceMeta.icon;
        return (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${sourceMeta.cls}`}>
            <SourceIcon className="size-2.5" /> {sourceMeta.label}
          </span>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <PeriodFilter value={period} onChange={setPeriod} className="ml-auto" />
      </div>
      <DataTable
        data={visible}
        columns={columns}
        getRowId={(r) => r.id}
        onRowClick={(r) => setSelected(r)}
        initialSorting={[{ id: "when", desc: true }]}
        emptyMessage="No audit events match your filters."
        pageSize={50}
      />

      <AuditDetailDrawer row={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
