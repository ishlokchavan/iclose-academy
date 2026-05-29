"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/patterns/DataTable";
import { filterByPeriod, PeriodFilter, type Period } from "@/components/patterns/PeriodFilter";
import { InquiryStatusBadge } from "@/features/inquiries/components/InquiryStatusBadge";
import { InquiryStatusSelect } from "@/features/inquiries/components/InquiryStatusSelect";
import type { InquiryRow } from "@/features/inquiries/server/queries";
import { formatDateTime, formatUpdatedAt } from "@/lib/utils/date";

export function InquiriesTable({ inquiries }: { inquiries: InquiryRow[] }) {
  const [period, setPeriod] = useState<Period>("all");
  const visible = useMemo(
    () => filterByPeriod(inquiries, (i) => i.created_at, period),
    [inquiries, period],
  );

  const columns = useMemo<ColumnDef<InquiryRow, unknown>[]>(() => [
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      meta: { filter: "select" },
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <InquiryStatusBadge status={row.original.status} />
          <InquiryStatusSelect inquiryId={row.original.id} initial={row.original.status} />
        </div>
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Inquiry",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", filterPlaceholder: "keyword" },
      cell: ({ row }) => (
        <p className="line-clamp-3 max-w-[42ch] whitespace-pre-line text-[13px] text-ink">
          {row.original.description}
        </p>
      ),
    },
    {
      id: "learner",
      accessorFn: (i) => i.learner.full_name ?? i.email,
      header: "Learner",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", className: "hidden md:table-cell" },
      cell: ({ row }) => {
        const i = row.original;
        return (
          <div>
            <p className="text-[13px] font-medium text-ink">{i.learner.full_name ?? "—"}</p>
            <div className="mt-0.5 flex flex-col gap-0.5 text-[11px] text-ink-muted">
              <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 hover:text-accent">
                <Mail className="size-2.5" /> {i.email}
              </a>
              {i.phone ? (
                <a href={`tel:${i.phone}`} className="inline-flex items-center gap-1 hover:text-accent">
                  <Phone className="size-2.5" /> {i.phone}
                </a>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      id: "location",
      accessorFn: (i) => [i.subarea, i.area?.name, i.type?.name].filter(Boolean).join(" · "),
      header: "Location / type",
      enableColumnFilter: true,
      meta: { filter: "select", className: "hidden lg:table-cell" },
      cell: ({ row }) => {
        const i = row.original;
        const parts = [i.subarea, i.area?.name].filter(Boolean).join(" · ");
        return (
          <div className="flex flex-col gap-0.5 text-[12px] text-ink-muted">
            {parts ? (
              <span className="inline-flex items-center gap-1"><MapPin className="size-2.5" /> {parts}</span>
            ) : null}
            {i.type?.name ? <span>{i.type.name}</span> : null}
            {!parts && !i.type ? <span className="text-ink-muted/50">—</span> : null}
          </div>
        );
      },
    },
    {
      id: "source",
      accessorFn: (i) => i.source_topic?.title ?? "",
      header: "Source",
      enableColumnFilter: true,
      meta: { filter: "text", className: "hidden xl:table-cell" },
      cell: ({ row }) => {
        const t = row.original.source_topic;
        return t ? (
          <Link href={`/topics/${t.slug}`} className="text-[12px] text-accent hover:underline">
            {t.title}
          </Link>
        ) : (
          <span className="text-[12px] text-ink-muted/50">—</span>
        );
      },
    },
    {
      id: "created",
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-[12px] tabular-nums text-ink-muted">
          {formatDateTime(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "updated",
      accessorKey: "updated_at",
      header: "Updated",
      meta: { className: "hidden xl:table-cell" },
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-[12px] tabular-nums text-ink-muted">
          {formatUpdatedAt(row.original.created_at, row.original.updated_at)}
        </span>
      ),
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
        getRowId={(i) => i.id}
        initialSorting={[{ id: "created", desc: true }]}
        emptyMessage="No inquiries match your filters."
      />
    </div>
  );
}
