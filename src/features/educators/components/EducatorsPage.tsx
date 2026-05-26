"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patterns/DataTable";
import { EmailLink, TelLink } from "@/components/patterns/ContactLink";
import { AddEducatorModal } from "@/features/educators/components/AddEducatorModal";
import { EducatorDrawer } from "@/features/educators/components/EducatorDrawer";
import type { EducatorRecord } from "@/features/educators/server/queries";
import { formatDateTime } from "@/lib/utils/date";

function initials(e: EducatorRecord) {
  return (e.name || "E")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EducatorsPage({ educators }: { educators: EducatorRecord[] }) {
  const [selected, setSelected] = useState<EducatorRecord | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const columns = useMemo<ColumnDef<EducatorRecord, unknown>[]>(() => [
    {
      id: "educator",
      accessorKey: "name",
      header: "Educator",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", filterPlaceholder: "name" },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
            {initials(row.original)}
          </div>
          <span className="text-[14px] font-medium text-ink">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", className: "hidden sm:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">
          {row.original.email
            ? <EmailLink email={row.original.email} stopPropagation />
            : <span className="text-ink-muted/50">—</span>}
        </span>
      ),
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: "Phone",
      enableColumnFilter: true,
      meta: { filter: "text", className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">
          {row.original.phone
            ? <TelLink phone={row.original.phone} stopPropagation />
            : <span className="text-ink-muted/50">—</span>}
        </span>
      ),
    },
    {
      id: "expertise",
      accessorKey: "expertise",
      header: "Expertise",
      enableColumnFilter: true,
      meta: { filter: "select", className: "hidden lg:table-cell" },
      cell: ({ row }) => (
        row.original.expertise ? (
          <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">{row.original.expertise}</span>
        ) : (
          <span className="text-ink-muted/50 text-[13px]">—</span>
        )
      ),
    },
    {
      id: "added",
      accessorKey: "created_at",
      header: "Added",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">{formatDateTime(row.original.created_at)}</span>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="size-4" />
          <span className="hidden sm:inline">Add educator</span>
        </Button>
      </div>

      <DataTable
        data={educators}
        columns={columns}
        getRowId={(e) => e.id}
        onRowClick={(e) => setSelected(e)}
        initialSorting={[{ id: "added", desc: true }]}
        emptyMessage="No educators yet."
      />

      <EducatorDrawer
        educator={selected}
        onClose={() => setSelected(null)}
      />
      <AddEducatorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}
