"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/patterns/DataTable";
import { formatDateTime, formatUpdatedAt } from "@/lib/utils/date";

import { PlanDrawer } from "./PlanDrawer";
import type { PlanWithCounts } from "../server/queries";

const BILLING_LABEL: Record<string, string> = {
  free:    "Free",
  monthly: "Monthly",
  yearly:  "Yearly",
};

function formatPrice(aed: number | null, cycle: string): string {
  if (cycle === "free" || aed === null) return "—";
  const formatted = new Intl.NumberFormat("en-AE", {
    style: "currency", currency: "AED", maximumFractionDigits: 0,
  }).format(aed);
  return cycle === "yearly" ? `${formatted}/yr` : `${formatted}/mo`;
}

export function PlansPage({ plans }: { plans: PlanWithCounts[] }) {
  const [selected, setSelected] = useState<PlanWithCounts | null>(null);

  const columns = useMemo<ColumnDef<PlanWithCounts, unknown>[]>(() => [
    {
      id: "label",
      accessorKey: "label",
      header: "Plan",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text" },
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-semibold text-ink">{p.label}</span>
                {p.is_star ? <Sparkles className="size-3 text-amber-500" /> : null}
                {!p.is_active ? (
                  <span className="rounded-full border border-hairline bg-surface-subtle px-1.5 text-[10px] font-medium text-ink-muted">
                    inactive
                  </span>
                ) : null}
              </div>
              <code className="font-mono text-[11px] text-ink-muted">{p.key}</code>
            </div>
          </div>
        );
      },
    },
    {
      id: "billing",
      accessorKey: "billing_cycle",
      header: "Billing",
      enableColumnFilter: true,
      meta: { filter: "select", className: "hidden sm:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink">
          {BILLING_LABEL[row.original.billing_cycle] ?? row.original.billing_cycle}
        </span>
      ),
    },
    {
      id: "price",
      accessorFn: (p) => p.price_yearly_aed ?? p.price_monthly_aed ?? 0,
      header: "Price",
      meta: { align: "right", className: "hidden md:table-cell" },
      cell: ({ row }) => {
        const p = row.original;
        return (
          <span className="text-[13px] tabular-nums text-ink">
            {p.billing_cycle === "yearly"
              ? formatPrice(p.price_yearly_aed != null ? Number(p.price_yearly_aed) : null, "yearly")
              : p.billing_cycle === "monthly"
              ? formatPrice(p.price_monthly_aed != null ? Number(p.price_monthly_aed) : null, "monthly")
              : "—"}
          </span>
        );
      },
    },
    {
      id: "split",
      accessorKey: "agent_split_pct",
      header: "Agent split",
      meta: { align: "right", className: "hidden lg:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] tabular-nums text-ink-muted">{row.original.agent_split_pct}%</span>
      ),
    },
    {
      id: "users",
      accessorFn: (p) => p.profiles_count,
      header: "Users",
      meta: { align: "right" },
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[14px] font-medium text-ink tabular-nums">{p.profiles_count}</span>
            <span className="text-[10px] text-ink-muted tabular-nums">{p.leads_count} leads</span>
          </div>
        );
      },
    },
    {
      id: "order",
      accessorKey: "order",
      header: "Order",
      meta: { align: "right", className: "hidden xl:table-cell" },
      cell: ({ row }) => (
        <span className="text-[12px] tabular-nums text-ink-muted">{row.original.order}</span>
      ),
    },
    {
      id: "created",
      accessorKey: "created_at",
      header: "Created",
      meta: { className: "hidden xl:table-cell" },
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
      <DataTable
        data={plans}
        columns={columns}
        getRowId={(p) => p.key}
        onRowClick={(p) => setSelected(p)}
        initialSorting={[{ id: "order", desc: false }]}
        emptyMessage="No plans configured."
        pageSize={0}
      />

      <PlanDrawer
        plan={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
