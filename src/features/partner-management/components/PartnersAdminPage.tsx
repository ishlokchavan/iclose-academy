"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Check, Copy, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patterns/DataTable";
import { EmailLink, TelLink } from "@/components/patterns/ContactLink";
import { filterByPeriod, PeriodFilter, type Period } from "@/components/patterns/PeriodFilter";
import { useViewMode, ViewToggle } from "@/components/patterns/ViewToggle";
import { MembersTree } from "@/features/members/components/MembersTree";
import type { TreeMember } from "@/features/members/server/queries";
import { partnerReferralLink } from "@/features/partner-management/link";
import { formatDateTime, formatUpdatedAt } from "@/lib/utils/date";

import { AddPartnerModal } from "./AddPartnerModal";
import { PartnerAdminDrawer } from "./PartnerAdminDrawer";
import type {
  PartnerAdminRow,
  PartnersOverview,
} from "../server/queries";

const VIEW_STORAGE_KEY = "iclose.partners.view";

function initials(name: string) {
  return (name || "P")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PartnersAdminPage({
  partners,
  overview,
  treeNodes,
  canDelete,
}: {
  partners: PartnerAdminRow[];
  overview: PartnersOverview;
  /** Partner-rooted forest for the tree view. Defaults to empty. */
  treeNodes?: TreeMember[];
  canDelete: boolean;
}) {
  const [selected, setSelected] = useState<PartnerAdminRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("all");
  const [showArchived, setShowArchived] = useState(false);
  const { view, changeView } = useViewMode(VIEW_STORAGE_KEY);

  // Tree-view consumers select by partner id (prefixed "partner:<id>" in the
  // synthetic nodes). Map that back to the PartnerAdminRow to open the drawer.
  function selectByTreeNodeId(nodeId: string) {
    const partnerId = nodeId.startsWith("partner:") ? nodeId.slice("partner:".length) : null;
    if (!partnerId) return;
    const row = partners.find((p) => p.id === partnerId);
    if (row) setSelected(row);
  }

  const archivedCount = partners.filter((p) => p.status === "archived").length;
  const visible = useMemo(() => {
    const inPeriod = filterByPeriod(
      partners,
      (p) => p.created_at ?? new Date().toISOString(),
      period,
    );
    return showArchived ? inPeriod : inPeriod.filter((p) => p.status !== "archived");
  }, [partners, period, showArchived]);

  const columns = useMemo<ColumnDef<PartnerAdminRow, unknown>[]>(() => [
    {
      id: "partner",
      accessorKey: "name",
      header: "Partner",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", filterPlaceholder: "name" },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
            {initials(row.original.name)}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[14px] font-medium text-ink">{row.original.name}</span>
            <span className="text-[11px] font-mono text-ink-muted">{row.original.code}</span>
          </div>
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
          <EmailLink email={row.original.email} stopPropagation />
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
      id: "clicks",
      accessorKey: "clicks",
      header: "Clicks",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink tabular-nums">{row.original.clicks}</span>
      ),
    },
    {
      id: "signups",
      accessorKey: "signups",
      header: "Signups",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink tabular-nums">{row.original.signups}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      meta: { filter: "select" },
      cell: ({ row }) => {
        const v = row.original.status;
        const state = v === "archived" ? "archived" : v === "inactive" ? "inactive" : "active";
        const styles = {
          active:   { bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", label: "Active" },
          inactive: { bg: "bg-zinc-100 text-zinc-600",      dot: "bg-zinc-400",    label: "Inactive" },
          archived: { bg: "bg-amber-50 text-amber-700",     dot: "bg-amber-500",   label: "Archived" },
        }[state];
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${styles.bg}`}>
            <span className={`size-1.5 rounded-full ${styles.dot}`} />
            {styles.label}
          </span>
        );
      },
    },
    {
      id: "joined",
      accessorKey: "created_at",
      header: "Joined",
      meta: { className: "hidden lg:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">
          {row.original.created_at ? formatDateTime(row.original.created_at) : "—"}
        </span>
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
    {
      id: "link",
      header: "Link",
      enableSorting: false,
      cell: ({ row }) => <RowCopyButton code={row.original.code} />,
    },
  ], []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Partners" value={overview.totalPartners} />
        <StatTile label="Active" value={overview.totalActive} />
        <StatTile label="Total clicks" value={overview.totalClicks} />
        <StatTile label="Total signups" value={overview.totalSignups} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {view === "table" ? <PeriodFilter value={period} onChange={setPeriod} /> : null}
        {view === "table" && archivedCount > 0 ? (
          <label className="ml-2 inline-flex items-center gap-1.5 text-[12px] text-ink-muted cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="size-3.5 accent-ink"
            />
            Show archived ({archivedCount})
          </label>
        ) : null}
        {view !== "table" ? (
          <p className="text-[12px] text-ink-muted">
            {(treeNodes ?? []).filter((n) => n.kind === "partner").length} partner
            {(treeNodes ?? []).filter((n) => n.kind === "partner").length === 1 ? "" : "s"} · click any node
          </p>
        ) : null}
        <ViewToggle
          view={view}
          onChange={changeView}
          className={view !== "table" ? "ml-auto" : undefined}
        />
        {view === "table" ? (
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">Add partner</span>
          </Button>
        ) : null}
      </div>

      {view === "table" ? (
        <DataTable
          data={visible}
          columns={columns}
          getRowId={(p) => p.id}
          onRowClick={(p) => setSelected(p)}
          initialSorting={[{ id: "joined", desc: true }]}
          emptyMessage="No partners yet."
        />
      ) : (treeNodes ?? []).length > 0 ? (
        <MembersTree
          members={treeNodes ?? []}
          onSelect={selectByTreeNodeId}
          selectedId={selected ? `partner:${selected.id}` : null}
        />
      ) : (
        <div className="rounded-2xl border border-hairline bg-surface-raised py-16 text-center text-[13px] text-ink-muted">
          No partner has brought in a signup yet. Share a referral link to see the tree fill in.
        </div>
      )}

      <PartnerAdminDrawer
        partner={selected}
        canDelete={canDelete}
        onClose={() => setSelected(null)}
      />
      <AddPartnerModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-raised px-4 py-3">
      <p className="text-[11px] font-medium text-ink-muted">{label}</p>
      <p className="text-[22px] font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}

/** Inline copy button for a partner's referral link. Stops row-click. */
function RowCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(partnerReferralLink(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy referral link"
      aria-label="Copy referral link"
      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-2 py-1 text-[12px] font-medium text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
